import { STATIC_CAROUSEL_LESSONS } from "@/lib/landing/carousel-manifest";

export function lessonMetaForSlug(slug: string) {
  const lesson = STATIC_CAROUSEL_LESSONS.find((l) => l.id === slug);
  if (lesson) {
    return {
      title: lesson.title,
      minutes: lesson.estimatedMinutes,
      description: lesson.description,
    };
  }
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { title, minutes: 4, description: undefined as string | undefined };
}
