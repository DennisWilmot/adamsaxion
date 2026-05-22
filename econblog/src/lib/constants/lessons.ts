/** Canonical slug for the free Zimbabwe intro lesson. */
export const LESSON_ZERO_SLUG = "lesson-zero";

/** Previous slug before Lesson Zero rename — kept for redirects and DB lookup. */
export const LEGACY_LESSON_ZERO_SLUGS = [
  "lesson-1-supply-and-demand-fundamentals",
] as const;

export function isLessonZeroSlug(slug: string) {
  return (
    slug === LESSON_ZERO_SLUG ||
    LEGACY_LESSON_ZERO_SLUGS.includes(
      slug as (typeof LEGACY_LESSON_ZERO_SLUGS)[number]
    )
  );
}

export function lessonZeroPath() {
  return `/lessons/${LESSON_ZERO_SLUG}`;
}

export function canonicalLessonId(slug: string) {
  if (isLessonZeroSlug(slug)) {
    return LESSON_ZERO_SLUG;
  }
  return slug;
}

/** Slugs that may have been stored in progress/quiz rows before the rename. */
export function lessonIdCandidates(slug: string) {
  if (isLessonZeroSlug(slug)) {
    return [LESSON_ZERO_SLUG, ...LEGACY_LESSON_ZERO_SLUGS];
  }
  return [slug];
}
