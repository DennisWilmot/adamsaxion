import { STATIC_CAROUSEL_SLUGS } from "@/lib/landing/carousel-manifest";

/** Published slugs from the static manifest (synced from DB via sync:carousel). */
export function getPublishedLessonSlugs(): string[] {
  return STATIC_CAROUSEL_SLUGS;
}
