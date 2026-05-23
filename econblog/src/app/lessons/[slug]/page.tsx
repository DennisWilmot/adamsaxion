import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { userHasLessonAccess } from "@/lib/subscription/service";
import { eq, or } from "drizzle-orm";
import { loadLesson, loadAllLessonMeta } from "@/lib/lesson-loader";
import { LessonPlayer, type LessonAccessMode } from "@/components/lesson/LessonPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin/auth";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import {
  isLessonZeroSlug,
  LESSON_ZERO_SLUG,
  LEGACY_LESSON_ZERO_SLUGS,
} from "@/lib/constants/lessons";
import { lessonCourseJsonLd, lessonMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const allLessons = await loadAllLessonMeta();
  return allLessons.map((lesson) => ({ slug: lesson.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await loadLesson(slug);
  if (!lesson) {
    return { title: "Lesson not found" };
  }
  return lessonMetadata(lesson);
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;

  if (
    LEGACY_LESSON_ZERO_SLUGS.includes(
      slug as (typeof LEGACY_LESSON_ZERO_SLUGS)[number]
    )
  ) {
    redirect(`/lessons/${LESSON_ZERO_SLUG}`);
  }

  const lesson = await loadLesson(slug);

  if (!lesson) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const isFreeLesson = isLessonZeroSlug(slug);
  let hasLessonAccess = isFreeLesson;
  if (user && !isFreeLesson) {
    hasLessonAccess = await userHasLessonAccess(user.id, user.email);
  }

  const accessMode: LessonAccessMode = hasLessonAccess ? "full" : "preview";

  let adminEditHref: string | null = null;
  if (isAdminUser(user)) {
    const slugCandidates = isLessonZeroSlug(slug)
      ? [LESSON_ZERO_SLUG, ...LEGACY_LESSON_ZERO_SLUGS]
      : [slug];
    const [row] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(or(...slugCandidates.map((s) => eq(lessons.slug, s))))
      .limit(1);
    if (row) {
      adminEditHref = `/admin/lessons/${row.id}`;
    }
  }

  return (
    <>
      <JsonLd data={lessonCourseJsonLd(lesson)} />
      <LessonPlayer
        lesson={lesson}
        isAuthenticated={isAuthenticated}
        accessMode={accessMode}
        adminEditHref={adminEditHref}
      />
    </>
  );
}
