import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { LessonData, LessonMeta, Section, MasteryQuiz } from "./types/lesson";
import { calculateLessonXp } from "./types/lesson";

function rowToLessonData(row: typeof lessons.$inferSelect): LessonData {
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
    id: row.slug,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    description: row.description,
    thumbnail: row.thumbnail,
    sections,
    masteryQuiz,
  };
}

export async function loadLesson(slug: string): Promise<LessonData | null> {
  const [row] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.slug, slug))
    .limit(1);

  if (!row || row.status !== "published") return null;
  return rowToLessonData(row);
}

export async function loadAllLessonMeta(): Promise<LessonMeta[]> {
  const rows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.status, "published"))
    .orderBy(asc(lessons.sortOrder), asc(lessons.slug));

  return rows.map((row) => {
    const data = rowToLessonData(row);
    const subsectionCount = data.sections.reduce(
      (sum, s) => sum + s.subsections.length,
      0
    );

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      description: data.description,
      thumbnail: data.thumbnail,
      totalXp: calculateLessonXp(data),
      sectionCount: data.sections.length,
      subsectionCount,
    } satisfies LessonMeta;
  });
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
