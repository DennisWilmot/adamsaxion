export type InterestTagId =
  | "fundamentals"
  | "policy"
  | "markets"
  | "business"
  | "decision-making"
  | "psychology"
  | "data"
  | "critical-thinking"
  | "healthcare"
  | "personal-finance";

export interface InterestTag {
  id: InterestTagId;
  label: string;
  /** Corpus lesson IDs to seed the path (in order). */
  entryLessonIds: number[];
}

export const INTEREST_TAGS: InterestTag[] = [
  {
    id: "fundamentals",
    label: "Understanding how the economy works",
    entryLessonIds: [0, 1],
  },
  {
    id: "policy",
    label: "Government, taxation, and public policy",
    entryLessonIds: [0, 1],
  },
  {
    id: "markets",
    label: "How markets and businesses operate",
    entryLessonIds: [0, 1, 3],
  },
  {
    id: "business",
    label: "Business strategy and competition",
    entryLessonIds: [1, 5, 13],
  },
  {
    id: "decision-making",
    label: "How people make choices",
    entryLessonIds: [0, 1, 2],
  },
  {
    id: "psychology",
    label: "Psychology and irrational behavior",
    entryLessonIds: [0, 43],
  },
  {
    id: "data",
    label: "Data, evidence, and research methods",
    entryLessonIds: [25],
  },
  {
    id: "critical-thinking",
    label: "Evaluating claims and spotting weak arguments",
    entryLessonIds: [25, 33],
  },
  {
    id: "healthcare",
    label: "Healthcare and health policy",
    entryLessonIds: [0, 1, 18, 48],
  },
  {
    id: "personal-finance",
    label: "Personal money decisions",
    entryLessonIds: [0, 43, 44],
  },
];

export const MAX_INTEREST_SELECTIONS = 3;

export function getInterestTag(id: string) {
  return INTEREST_TAGS.find((t) => t.id === id);
}
