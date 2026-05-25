import { CORPUS_LESSONS } from "./corpus-lessons";

/** Corpus slug → known DB slugs for the same lesson. */
export const CORPUS_SLUG_ALIASES: Record<string, string[]> = {
  "how-a-currency-dies": ["lesson-zero", "lesson-1-supply-and-demand-fundamentals"],
  "demand-where-it-comes-from": ["demand-where-it-actually-comes-from"],
  "nash-equilibrium": ["game-theory"],
};

function normalizeSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Map published DB slug → corpus lesson id. */
export function buildSlugToCorpusIdMap(publishedSlugs: string[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const lesson of CORPUS_LESSONS) {
    const candidates = new Set<string>([
      lesson.slug,
      normalizeSlug(lesson.slug),
      normalizeSlug(lesson.title),
      ...(CORPUS_SLUG_ALIASES[lesson.slug] ?? []),
    ]);

    for (const pub of publishedSlugs) {
      const normPub = normalizeSlug(pub);
      if (
        candidates.has(pub) ||
        candidates.has(normPub) ||
        normPub.includes(normalizeSlug(lesson.slug)) ||
        normalizeSlug(lesson.title).split("-").slice(0, 4).every((w) => normPub.includes(w))
      ) {
        map.set(pub, lesson.id);
      }
    }
  }

  return map;
}

export function resolveCorpusIdForSlug(
  slug: string,
  slugToCorpusId: Map<string, number>
): number | null {
  if (slugToCorpusId.has(slug)) return slugToCorpusId.get(slug)!;

  for (const lesson of CORPUS_LESSONS) {
    const aliases = CORPUS_SLUG_ALIASES[lesson.slug] ?? [];
    if (aliases.includes(slug)) return lesson.id;
  }

  return null;
}
