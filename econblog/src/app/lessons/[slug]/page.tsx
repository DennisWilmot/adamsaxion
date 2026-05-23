import { notFound, redirect } from "next/navigation";
import { userHasLessonAccess } from "@/lib/subscription/service";
import { eq, or } from "drizzle-orm";
import { loadLesson } from "@/lib/lesson-loader";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin/auth";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import {
  isLessonZeroSlug,
  LESSON_ZERO_SLUG,
  LEGACY_LESSON_ZERO_SLUGS,
} from "@/lib/constants/lessons";

interface Props {
  params: Promise<{ slug: string }>;
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

  if (!isLessonZeroSlug(slug)) {
    const lessonPath = `/lessons/${slug}`;
    if (!user) {
      redirect(`/auth?next=${encodeURIComponent(lessonPath)}`);
    }
    const hasAccess = await userHasLessonAccess(user.id, user.email);
    if (!hasAccess) {
      redirect(`/subscribe?next=${encodeURIComponent(lessonPath)}`);
    }
  }

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
    <LessonPlayer
      lesson={lesson}
      isAuthenticated={isAuthenticated}
      adminEditHref={adminEditHref}
    />
  );
}
