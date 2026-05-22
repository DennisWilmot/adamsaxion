import { CORPUS_BY_ID, CORPUS_LESSONS, type CorpusLesson } from "./corpus-lessons";
import { buildSlugToCorpusIdMap, resolveCorpusIdForSlug } from "./slug-aliases";
import { getInterestTag, type InterestTagId } from "./interest-tags";

export type PathLessonStatus = "published" | "coming_soon";

export interface PathLessonItem {
  corpusId: number;
  slug: string | null;
  title: string;
  phase: number;
  status: PathLessonStatus;
  reason?: string;
}

export interface LearningPath {
  tagline: string;
  lessons: PathLessonItem[];
}

const INTEREST_TO_CORPUS_TAGS: Record<InterestTagId, string[]> = {
  fundamentals: ["fundamentals", "everyday-economics", "decision-making"],
  policy: ["policy", "taxation", "government", "public-interest"],
  markets: ["markets", "fundamentals", "pricing"],
  business: ["business", "strategy", "entrepreneurship", "competition"],
  "decision-making": ["decision-making", "psychology", "everyday-life"],
  psychology: ["psychology", "behavioral-change", "decision-making"],
  data: ["data", "research", "media-literacy"],
  "critical-thinking": ["critical-thinking", "media-literacy", "research"],
  healthcare: ["healthcare", "insurance", "public-health"],
  "personal-finance": ["personal-finance", "everyday-life", "savings"],
};

function collectSeedIds(interestIds: InterestTagId[]): number[] {
  const seeds = new Set<number>();
  for (const id of interestIds) {
    const tag = getInterestTag(id);
    if (!tag) continue;
    for (const lessonId of tag.entryLessonIds) {
      seeds.add(lessonId);
    }
  }
  if (seeds.size === 0) {
    seeds.add(0);
    seeds.add(1);
  }
  return [...seeds];
}

function scoreLesson(lesson: CorpusLesson, interestIds: InterestTagId[]): number {
  let score = 0;
  const tagSets = interestIds.map((id) => INTEREST_TO_CORPUS_TAGS[id] ?? []);
  for (const tags of tagSets) {
    if (lesson.interests.some((i) => tags.includes(i))) score += 2;
  }
  return score;
}

function orderedCorpusIds(seedIds: number[], interestIds: InterestTagId[]): number[] {
  const result: number[] = [];
  const added = new Set<number>();

  function addWithPrereqs(id: number) {
    if (added.has(id)) return;
    const lesson = CORPUS_BY_ID.get(id);
    if (!lesson) return;
    for (const prereq of lesson.prereqs) addWithPrereqs(prereq);
    if (!added.has(id)) {
      added.add(id);
      result.push(id);
    }
  }

  for (const seed of seedIds) addWithPrereqs(seed);

  const rest = [...CORPUS_LESSONS]
    .filter((l) => !added.has(l.id))
    .sort(
      (a, b) =>
        scoreLesson(b, interestIds) - scoreLesson(a, interestIds) ||
        a.phase - b.phase ||
        a.id - b.id
    );

  for (const lesson of rest) addWithPrereqs(lesson.id);

  return result;
}

function toPathItems(
  orderedIds: number[],
  publishedByCorpusId: Map<number, string>
): PathLessonItem[] {
  return orderedIds.map((corpusId) => {
    const lesson = CORPUS_BY_ID.get(corpusId)!;
    const slug = publishedByCorpusId.get(corpusId) ?? null;
    return {
      corpusId,
      slug,
      title: lesson.title,
      phase: lesson.phase,
      status: slug ? "published" : "coming_soon",
    } satisfies PathLessonItem;
  });
}

export function buildLearningPath(input: {
  primaryInterestId: InterestTagId;
  secondaryInterestIds?: InterestTagId[];
  completedLessonSlugs: string[];
  publishedSlugs: string[];
}): LearningPath {
  const interestIds = [
    input.primaryInterestId,
    ...(input.secondaryInterestIds ?? []),
  ].filter(Boolean) as InterestTagId[];

  const slugToCorpusId = buildSlugToCorpusIdMap(input.publishedSlugs);
  const publishedByCorpusId = new Map<number, string>();

  for (const slug of input.publishedSlugs) {
    const corpusId = resolveCorpusIdForSlug(slug, slugToCorpusId);
    if (corpusId != null && !publishedByCorpusId.has(corpusId)) {
      publishedByCorpusId.set(corpusId, slug);
    }
  }

  const seeds = collectSeedIds(interestIds);
  const orderedIds = orderedCorpusIds(seeds, interestIds);
  const lessons = toPathItems(orderedIds, publishedByCorpusId);

  const primary = getInterestTag(input.primaryInterestId);
  const tagline = primary
    ? `Because you're focused on ${primary.label.toLowerCase()}`
    : "Your personalized curriculum";

  return { tagline, lessons };
}

export function getDefaultFundamentalsPath(publishedSlugs: string[]): LearningPath {
  return buildLearningPath({
    primaryInterestId: "fundamentals",
    secondaryInterestIds: [],
    completedLessonSlugs: [],
    publishedSlugs,
  });
}
