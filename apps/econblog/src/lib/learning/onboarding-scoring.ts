import {
  ONBOARDING_QUESTIONS,
  type OnboardingOption,
} from "./onboarding-questions";
import {
  OPTION_SKILL,
  OUTCOMES_BY_INTEREST,
  PHASE_LABELS,
} from "./onboarding-outcomes";
import { CORPUS_BY_ID, type CorpusLesson } from "./corpus-lessons";
import {
  getInterestTag,
  INTEREST_TAGS,
  type InterestTagId,
} from "./interest-tags";
import { buildLearningPath, type LearningPath, type PathLessonItem } from "./path-engine";

export interface OnboardingAnswers {
  [questionId: string]: string;
}

export interface PathPreviewItem {
  corpusId: number;
  slug: string | null;
  title: string;
  phase: number;
  phaseLabel: string;
  status: PathLessonItem["status"];
  reason: string;
}

export interface OnboardingResult {
  primaryInterestId: InterestTagId;
  secondaryInterestIds: InterestTagId[];
  tagline: string;
  headline: string;
  /** Emotional / motivational reflections from their answers */
  personalNotes: string[];
  /** Concrete skills and capabilities they'll build */
  outcomes: string[];
  focusLabels: string[];
  path: LearningPath;
  pathPreview: PathPreviewItem[];
  stats: {
    totalInPath: number;
    availableNow: number;
    comingSoon: number;
  };
}

const TAGLINE_BY_INTEREST: Record<InterestTagId, string> = {
  fundamentals: "Because you want the economy to finally click",
  policy: "Because you care how government and markets interact",
  markets: "Because how prices and competition work matters to you",
  business: "Because strategic thinking is your edge",
  "decision-making": "Because choices and tradeoffs are your lens",
  psychology: "Because human behavior is the puzzle you care about",
  data: "Because evidence beats opinion in your book",
  "critical-thinking": "Because you want to see through weak arguments",
  healthcare: "Because healthcare and policy hit close to home",
  "personal-finance": "Because your money decisions deserve better frameworks",
};

const HEADLINE_BY_INTEREST: Record<InterestTagId, string> = {
  fundamentals: "A foundations-first path — built for how you learn",
  policy: "A policy-focused curriculum — with the economics to back it up",
  markets: "A markets path — from demand to competition",
  business: "A strategy & competition track — incentives throughout",
  "decision-making": "A decision-making path — models you can use daily",
  psychology: "Behavioral economics woven into your sequence",
  data: "An evidence-first path — methods before opinions",
  "critical-thinking": "A critical thinking track — built to stress-test claims",
  healthcare: "Health economics placed where you need it",
  "personal-finance": "Economics tied to real money decisions",
};

const INTEREST_TAG_KEYWORDS: Record<InterestTagId, string[]> = {
  fundamentals: ["fundamentals", "everyday-economics", "decision-making"],
  policy: ["policy", "taxation", "government", "public-interest"],
  markets: ["markets", "pricing", "fundamentals"],
  business: ["business", "strategy", "competition", "entrepreneurship"],
  "decision-making": ["decision-making", "everyday-life"],
  psychology: ["psychology", "behavioral-change"],
  data: ["data", "research", "media-literacy"],
  "critical-thinking": ["critical-thinking", "media-literacy"],
  healthcare: ["healthcare", "insurance", "public-health"],
  "personal-finance": ["personal-finance", "savings", "everyday-life"],
};

function findOption(questionId: string, optionId: string): OnboardingOption | null {
  const q = ONBOARDING_QUESTIONS.find((x) => x.id === questionId);
  return q?.options.find((o) => o.id === optionId) ?? null;
}

function scoreInterests(answers: OnboardingAnswers): Map<InterestTagId, number> {
  const scores = new Map<InterestTagId, number>();
  for (const tag of INTEREST_TAGS) {
    scores.set(tag.id, 0);
  }

  for (const [questionId, optionId] of Object.entries(answers)) {
    const option = findOption(questionId, optionId);
    if (!option) continue;
    for (const [interest, weight] of Object.entries(option.weights)) {
      const id = interest as InterestTagId;
      scores.set(id, (scores.get(id) ?? 0) + (weight ?? 0));
    }
  }

  return scores;
}

function rankInterests(scores: Map<InterestTagId, number>): InterestTagId[] {
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

function collectPersonalNotes(answers: OnboardingAnswers): string[] {
  const notes: string[] = [];
  for (const [questionId, optionId] of Object.entries(answers)) {
    const option = findOption(questionId, optionId);
    if (option?.insight) notes.push(option.insight);
  }
  return notes.slice(0, 2);
}

function collectOutcomes(
  answers: OnboardingAnswers,
  primary: InterestTagId,
  secondary: InterestTagId[]
): string[] {
  const seen = new Set<string>();
  const outcomes: string[] = [];

  function add(line: string) {
    if (!seen.has(line)) {
      seen.add(line);
      outcomes.push(line);
    }
  }

  for (const [, optionId] of Object.entries(answers)) {
    const skill = OPTION_SKILL[optionId];
    if (skill) add(skill);
  }

  for (const id of [primary, ...secondary]) {
    for (const line of OUTCOMES_BY_INTEREST[id] ?? []) {
      add(line);
      if (outcomes.length >= 5) break;
    }
  }

  return outcomes.slice(0, 5);
}

function lessonMatchesInterests(
  lesson: CorpusLesson,
  interestIds: InterestTagId[]
): InterestTagId | null {
  for (const id of interestIds) {
    const keys = INTEREST_TAG_KEYWORDS[id] ?? [];
    if (lesson.interests.some((i) => keys.includes(i))) return id;
  }
  return null;
}

function reasonForLesson(
  lesson: CorpusLesson,
  interestIds: InterestTagId[],
  index: number,
  isPublished: boolean
): string {
  if (index === 0) {
    const label = getInterestTag(interestIds[0])?.label ?? "your goals";
    return `Starting point aligned with ${label.toLowerCase()}`;
  }

  const match = lessonMatchesInterests(lesson, interestIds);
  if (match) {
    const label = getInterestTag(match)?.label ?? "your focus";
    return `Directly supports ${label.toLowerCase()}`;
  }

  if (lesson.prereqs.length > 0) {
    return "Builds prerequisites for topics you prioritized";
  }

  if (!isPublished) {
    return "Queued on your path — publishing soon";
  }

  return `Part of your ${PHASE_LABELS[lesson.phase] ?? "curriculum"} sequence`;
}

function buildPathPreview(
  lessons: PathLessonItem[],
  interestIds: InterestTagId[]
): PathPreviewItem[] {
  return lessons.slice(0, 6).map((item, index) => {
    const corpus = CORPUS_BY_ID.get(item.corpusId)!;
    const published = item.status === "published" && !!item.slug;
    return {
      corpusId: item.corpusId,
      slug: item.slug,
      title: item.title,
      phase: item.phase,
      phaseLabel: PHASE_LABELS[item.phase] ?? `Phase ${item.phase}`,
      status: item.status,
      reason: reasonForLesson(corpus, interestIds, index, published),
    };
  });
}

export function computeOnboardingResult(
  answers: OnboardingAnswers,
  publishedSlugs: string[]
): OnboardingResult {
  const ranked = rankInterests(scoreInterests(answers));
  const primaryInterestId = ranked[0] ?? "fundamentals";
  const secondaryInterestIds = ranked
    .filter((id) => id !== primaryInterestId)
    .slice(0, 2);

  const interestIds = [primaryInterestId, ...secondaryInterestIds];

  const path = buildLearningPath({
    primaryInterestId,
    secondaryInterestIds,
    completedLessonSlugs: [],
    publishedSlugs,
  });

  const pathPreview = buildPathPreview(path.lessons, interestIds);

  const availableNow = path.lessons.filter((l) => l.status === "published").length;
  const comingSoon = path.lessons.filter((l) => l.status === "coming_soon").length;

  const focusLabels = [
    getInterestTag(primaryInterestId)?.label,
    ...secondaryInterestIds.map((id) => getInterestTag(id)?.label),
  ].filter(Boolean) as string[];

  return {
    primaryInterestId,
    secondaryInterestIds,
    tagline:
      TAGLINE_BY_INTEREST[primaryInterestId] ??
      "Because you told us what you actually want from this",
    headline:
      HEADLINE_BY_INTEREST[primaryInterestId] ??
      "Your personalized path is ready",
    personalNotes: collectPersonalNotes(answers),
    outcomes: collectOutcomes(answers, primaryInterestId, secondaryInterestIds),
    focusLabels,
    path,
    pathPreview,
    stats: {
      totalInPath: path.lessons.length,
      availableNow,
      comingSoon,
    },
  };
}
