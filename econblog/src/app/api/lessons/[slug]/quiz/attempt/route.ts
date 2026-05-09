import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { quizAttempts, profiles, lessonProgress } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { loadLesson, getQuestionFromLesson } from "@/lib/lesson-loader";

const LOCKOUT_HOURS = 24;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, selectedAnswer } = body;

    if (!questionId || selectedAnswer === undefined) {
      return NextResponse.json(
        { error: "questionId and selectedAnswer are required" },
        { status: 400 }
      );
    }

    const lesson = await loadLesson(slug);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const found = getQuestionFromLesson(lesson, questionId);
    if (!found) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { question, isMastery } = found;

    const previousAttempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, user.id),
          eq(quizAttempts.lessonId, slug),
          eq(quizAttempts.questionId, questionId)
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    const alreadyCorrect = previousAttempts.some((a) => a.isCorrect);
    if (alreadyCorrect) {
      return NextResponse.json(
        { error: "Already answered correctly", xpEarned: 0, isCorrect: true },
        { status: 409 }
      );
    }

    const latestAttempt = previousAttempts[0];
    if (latestAttempt?.lockedUntil && new Date() < latestAttempt.lockedUntil) {
      return NextResponse.json(
        {
          error: "Question is locked",
          lockedUntil: latestAttempt.lockedUntil,
          attemptsUsed: previousAttempts.length,
        },
        { status: 423 }
      );
    }

    const attemptNumber = previousAttempts.length + 1;
    const isCorrect = selectedAnswer === question.correctAnswer;

    let xpEarned = 0;
    let lockedUntil: Date | null = null;

    if (isCorrect) {
      xpEarned = question.xpReward;
    } else {
      if (attemptNumber === 1) {
        xpEarned = -question.xpPenalties[0];
      } else if (attemptNumber === 2) {
        xpEarned = -question.xpPenalties[1];
      }

      if (attemptNumber >= 3) {
        lockedUntil = new Date(Date.now() + LOCKOUT_HOURS * 60 * 60 * 1000);
      }
    }

    await db.insert(quizAttempts).values({
      userId: user.id,
      lessonId: slug,
      questionId,
      selectedAnswer,
      isCorrect,
      xpEarned,
      attemptNumber,
      lockedUntil,
    });

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    const newTotalXp = Math.max(0, (profile?.totalXp ?? 0) + xpEarned);
    const newLevel = Math.floor(newTotalXp / 1000) + 1;

    await db
      .update(profiles)
      .set({ totalXp: newTotalXp, currentLevel: newLevel, updatedAt: new Date() })
      .where(eq(profiles.id, user.id));

    if (isCorrect && !isMastery) {
      const subsectionId = findSubsectionForQuestion(lesson, questionId);
      if (subsectionId) {
        await updateLessonProgress(user.id, slug, subsectionId, xpEarned, lesson);
      }
    }

    return NextResponse.json({
      isCorrect,
      xpEarned,
      attemptNumber,
      lockedUntil,
      correctAnswer: isCorrect ? question.correctAnswer : undefined,
      explanation: question.explanation,
      attemptsRemaining: isCorrect ? 0 : Math.max(0, 3 - attemptNumber),
    });
  } catch (error) {
    console.error("POST /api/lessons/[slug]/quiz/attempt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function findSubsectionForQuestion(
  lesson: Awaited<ReturnType<typeof loadLesson>>,
  questionId: string
): string | null {
  if (!lesson) return null;
  for (const section of lesson.sections) {
    for (const sub of section.subsections) {
      if (sub.quiz?.id === questionId) return sub.id;
    }
  }
  return null;
}

async function updateLessonProgress(
  userId: string,
  lessonId: string,
  subsectionId: string,
  xpEarned: number,
  lesson: NonNullable<Awaited<ReturnType<typeof loadLesson>>>
) {
  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  if (existing) {
    const completed = existing.completedSubsections.includes(subsectionId)
      ? existing.completedSubsections
      : [...existing.completedSubsections, subsectionId];

    const unlocked = computeUnlockedSections(lesson, completed);

    await db
      .update(lessonProgress)
      .set({
        completedSubsections: completed,
        unlockedSections: unlocked,
        totalXpEarned: existing.totalXpEarned + Math.max(0, xpEarned),
        updatedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    const completed = [subsectionId];
    const unlocked = computeUnlockedSections(lesson, completed);

    await db.insert(lessonProgress).values({
      userId,
      lessonId,
      completedSubsections: completed,
      unlockedSections: unlocked,
      totalXpEarned: Math.max(0, xpEarned),
    });
  }
}

function computeUnlockedSections(
  lesson: NonNullable<Awaited<ReturnType<typeof loadLesson>>>,
  completedSubsections: string[]
): string[] {
  const unlocked: string[] = [lesson.sections[0]?.id].filter(Boolean);

  for (let i = 0; i < lesson.sections.length; i++) {
    const section = lesson.sections[i];
    const allSubsCompleted = section.subsections.every((sub) =>
      completedSubsections.includes(sub.id)
    );

    if (allSubsCompleted && i + 1 < lesson.sections.length) {
      const nextSectionId = lesson.sections[i + 1].id;
      if (!unlocked.includes(nextSectionId)) {
        unlocked.push(nextSectionId);
      }
    }
  }

  return unlocked;
}
