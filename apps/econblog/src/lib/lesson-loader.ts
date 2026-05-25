import { cache } from "react";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq, asc, sql, inArray, and } from "drizzle-orm";
import type { LessonData, LessonMeta, Section, MasteryQuiz } from "./types/lesson";
import { resolveLessonThumbnail } from "./lesson-thumbnail";
import {
  isLessonZeroSlug,
  LESSON_ZERO_SLUG,
  LEGACY_LESSON_ZERO_SLUGS,
  canonicalLessonId,
} from "./constants/lessons";

function lessonSlugCandidates(slug: string): string[] {
  if (isLessonZeroSlug(slug)) {
    return [LESSON_ZERO_SLUG, ...LEGACY_LESSON_ZERO_SLUGS];
  }
  return [slug];
}

const lessonContentColumns = {
  slug: lessons.slug,
  title: lessons.title,
  category: lessons.category,
  difficulty: lessons.difficulty,
  estimatedMinutes: lessons.estimatedMinutes,
  description: lessons.description,
  thumbnail: lessons.thumbnail,
  status: lessons.status,
  sections: lessons.sections,
  masteryQuiz: lessons.masteryQuiz,
} as const;

/** Listing fields only — avoids pulling section/quiz JSON over the wire. */
const lessonCarouselColumns = {
  slug: lessons.slug,
  title: lessons.title,
  category: lessons.category,
  difficulty: lessons.difficulty,
  estimatedMinutes: lessons.estimatedMinutes,
  description: lessons.description,
  thumbnail: lessons.thumbnail,
} as const;

/** Aggregates computed in Postgres so subsection markdown never leaves the DB. */
const lessonListStats = {
  sectionCount: sql<number>`COALESCE(jsonb_array_length(${lessons.sections}), 0)::int`.mapWith(
    Number
  ),
  subsectionCount: sql<number>`
    COALESCE((
      SELECT SUM(jsonb_array_length(COALESCE(section.elem->'subsections', '[]'::jsonb)))
      FROM jsonb_array_elements(COALESCE(${lessons.sections}, '[]'::jsonb)) AS section(elem)
    ), 0)::int
  `.mapWith(Number),
  quizXp: sql<number>`
    COALESCE((
      SELECT SUM(COALESCE((sub.elem->'quiz'->>'xpReward')::int, 0))
      FROM jsonb_array_elements(COALESCE(${lessons.sections}, '[]'::jsonb)) AS section(elem),
           jsonb_array_elements(COALESCE(section.elem->'subsections', '[]'::jsonb)) AS sub(elem)
      WHERE sub.elem->'quiz' IS NOT NULL
    ), 0)::int
  `.mapWith(Number),
  questionsPerAttempt: sql<number>`
    COALESCE((${lessons.masteryQuiz}->>'questionsPerAttempt')::int, 5)
  `.mapWith(Number),
  masteryXpPerQuestion: sql<number>`
    COALESCE((${lessons.masteryQuiz}->'questionPool'->0->>'xpReward')::int, 30)
  `.mapWith(Number),
} as const;

const lessonListColumns = {
  ...lessonCarouselColumns,
  ...lessonListStats,
} as const;

const lessonCardColumns = {
  ...lessonCarouselColumns,
  quizXp: lessonListStats.quizXp,
  questionsPerAttempt: lessonListStats.questionsPerAttempt,
  masteryXpPerQuestion: lessonListStats.masteryXpPerQuestion,
} as const;

type LessonCarouselRow = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  thumbnail: string;
};

type LessonListRow = LessonCarouselRow & {
  sectionCount: number;
  subsectionCount: number;
  quizXp: number;
  questionsPerAttempt: number;
  masteryXpPerQuestion: number;
};

type LessonCardRow = LessonCarouselRow & {
  quizXp: number;
  questionsPerAttempt: number;
  masteryXpPerQuestion: number;
};

type LessonContentRow = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  thumbnail: string;
  status: string;
  sections: unknown;
  masteryQuiz: unknown;
};

function rowToLessonData(row: LessonContentRow): LessonData {
  const sections = (row.sections as any[] || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    subsections: (s.subsections || []).map((sub: any) => ({
      id: sub.id,
      title: sub.title,
      content: sub.content || "",
      quiz: sub.quiz ? {
        id: sub.quiz.id,
        type: sub.quiz.type || "in-lesson",
        question: sub.quiz.question,
        options: sub.quiz.options,
        correctAnswer: sub.quiz.correctAnswer,
        difficulty: sub.quiz.difficulty,
        xpReward: sub.quiz.xpReward,
        xpPenalties: sub.quiz.xpPenalties,
        explanation: sub.quiz.explanation,
      } : undefined,
    })),
  })) as Section[];

  const masteryRaw = row.masteryQuiz as any;
  const masteryQuiz: MasteryQuiz = masteryRaw ? {
    questionsPerAttempt: masteryRaw.questionsPerAttempt ?? 5,
    passingScore: masteryRaw.passingScore ?? 70,
    timeLimitMinutes: masteryRaw.timeLimitMinutes ?? 15,
    questionPool: (masteryRaw.questionPool || []).map((q: any) => ({
      id: q.id,
      type: q.type || "recap",
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || "hard",
      xpReward: q.xpReward ?? 30,
      xpPenalties: q.xpPenalties ?? [10, 15],
      explanation: q.explanation,
    })),
    generationProgress: masteryRaw.generationProgress,
  } : { questionsPerAttempt: 5, passingScore: 70, timeLimitMinutes: 15, questionPool: [] };

  return {
    id: canonicalLessonId(row.slug),
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    description: row.description,
    thumbnail: resolveLessonThumbnail(
      {
        title: row.title,
        category: row.category,
        difficulty: row.difficulty,
        description: row.description,
      },
      row.thumbnail
    ),
    sections,
    masteryQuiz,
  };
}

async function loadLessonUncached(slug: string): Promise<LessonData | null> {
  for (const candidate of lessonSlugCandidates(slug)) {
    const [row] = await db
      .select(lessonContentColumns)
      .from(lessons)
      .where(eq(lessons.slug, candidate))
      .limit(1);

    if (row && row.status === "published") {
      return rowToLessonData(row);
    }
  }

  return null;
}

/** Per-request dedupe for generateMetadata + page render. */
export const loadLesson = cache(loadLessonUncached);

/** Question IDs only — avoids loading subsection markdown for quiz status. */
export async function loadLessonQuestionIds(
  slug: string
): Promise<string[] | null> {
  for (const candidate of lessonSlugCandidates(slug)) {
    const [row] = await db
      .select({
        sections: lessons.sections,
        masteryQuiz: lessons.masteryQuiz,
        status: lessons.status,
      })
      .from(lessons)
      .where(eq(lessons.slug, candidate))
      .limit(1);

    if (!row || row.status !== "published") {
      continue;
    }

    const ids: string[] = [];
    for (const section of (row.sections as { subsections?: { quiz?: { id?: string } }[] }[]) || []) {
      for (const sub of section.subsections || []) {
        if (sub.quiz?.id) {
          ids.push(sub.quiz.id);
        }
      }
    }
    for (const q of (row.masteryQuiz as { questionPool?: { id?: string }[] } | null)?.questionPool || []) {
      if (q.id) {
        ids.push(q.id);
      }
    }
    return ids;
  }

  return null;
}

export const loadPublishedLessonSlugs = cache(async (): Promise<string[]> => {
  const rows = await db
    .select({ slug: lessons.slug })
    .from(lessons)
    .where(eq(lessons.status, "published"))
    .orderBy(asc(lessons.sortOrder), asc(lessons.slug));

  return rows.map((row) => canonicalLessonId(row.slug));
});

function rowToCardMeta(row: LessonCardRow): LessonMeta {
  return {
    id: canonicalLessonId(row.slug),
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    description: row.description,
    thumbnail: resolveLessonThumbnail(
      {
        title: row.title,
        category: row.category,
        difficulty: row.difficulty,
        description: row.description,
      },
      row.thumbnail
    ),
    totalXp: row.quizXp + row.masteryXpPerQuestion * row.questionsPerAttempt,
    sectionCount: 0,
    subsectionCount: 0,
  };
}

function rowToListMeta(row: LessonListRow): LessonMeta {
  return {
    id: canonicalLessonId(row.slug),
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    description: row.description,
    thumbnail: resolveLessonThumbnail(
      {
        title: row.title,
        category: row.category,
        difficulty: row.difficulty,
        description: row.description,
      },
      row.thumbnail
    ),
    totalXp: row.quizXp + row.masteryXpPerQuestion * row.questionsPerAttempt,
    sectionCount: row.sectionCount,
    subsectionCount: row.subsectionCount,
  };
}

export async function loadAllLessonMeta(): Promise<LessonMeta[]> {
  const rows = await db
    .select(lessonListColumns)
    .from(lessons)
    .where(eq(lessons.status, "published"))
    .orderBy(asc(lessons.sortOrder), asc(lessons.slug));

  return rows.map(rowToListMeta);
}

export async function loadLessonMetaBySlug(
  slug: string
): Promise<LessonMeta | null> {
  const map = await loadLessonMetaBySlugs([slug]);
  return map.get(canonicalLessonId(slug)) ?? null;
}

export async function loadLessonMetaBySlugs(
  slugs: string[]
): Promise<Map<string, LessonMeta>> {
  const uniqueSlugs = [...new Set(slugs.map(canonicalLessonId))];
  if (uniqueSlugs.length === 0) {
    return new Map();
  }

  const candidateSlugs = [
    ...new Set(uniqueSlugs.flatMap((slug) => lessonSlugCandidates(slug))),
  ];

  const rows = await db
    .select({ ...lessonListColumns, status: lessons.status })
    .from(lessons)
    .where(
      and(
        inArray(lessons.slug, candidateSlugs),
        eq(lessons.status, "published")
      )
    );

  const map = new Map<string, LessonMeta>();
  for (const row of rows) {
    map.set(canonicalLessonId(row.slug), rowToListMeta(row));
  }
  return map;
}

export async function loadLessonCardBySlug(
  slug: string
): Promise<LessonMeta | null> {
  for (const candidate of lessonSlugCandidates(slug)) {
    const [row] = await db
      .select({ ...lessonCardColumns, status: lessons.status })
      .from(lessons)
      .where(eq(lessons.slug, candidate))
      .limit(1);

    if (row && row.status === "published") {
      return rowToCardMeta(row);
    }
  }

  return null;
}

export function getQuestionFromLesson(
  lesson: LessonData,
  questionId: string
): { question: LessonData["masteryQuiz"]["questionPool"][0]; isMastery: boolean } | null {
  for (const section of lesson.sections) {
    for (const sub of section.subsections) {
      if (sub.quiz?.id === questionId) {
        return { question: sub.quiz, isMastery: false };
      }
    }
  }

  const masteryQ = lesson.masteryQuiz.questionPool.find(
    (q) => q.id === questionId
  );
  if (masteryQ) {
    return { question: masteryQ, isMastery: true };
  }

  return null;
}
