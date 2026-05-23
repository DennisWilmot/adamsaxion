import type { Metadata } from "next";
import { getAppUrl } from "@/lib/stripe/config";
import type { LessonData } from "@/lib/types/lesson";

export function lessonMetadata(
  lesson: Pick<LessonData, "id" | "title" | "description" | "thumbnail">
): Metadata {
  return {
    title: lesson.title,
    description: lesson.description,
    alternates: {
      canonical: `/lessons/${lesson.id}`,
    },
    openGraph: {
      title: lesson.title,
      description: lesson.description,
      type: "article",
      url: `/lessons/${lesson.id}`,
      ...(lesson.thumbnail ? { images: [{ url: lesson.thumbnail }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: lesson.title,
      description: lesson.description,
      ...(lesson.thumbnail ? { images: [lesson.thumbnail] } : {}),
    },
  };
}

export function lessonCourseJsonLd(lesson: LessonData) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: lesson.title,
    description: lesson.description,
    provider: {
      "@type": "Organization",
      name: "Adam's Axioms",
      url: getAppUrl(),
    },
    educationalLevel: lesson.difficulty,
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    url: `${getAppUrl()}/lessons/${lesson.id}`,
    ...(lesson.thumbnail ? { image: lesson.thumbnail } : {}),
  };
}
