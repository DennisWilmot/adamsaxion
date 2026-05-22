import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { loadLesson } from "@/lib/lesson-loader";
import { lessonIdCandidates } from "@/lib/constants/lessons";

export async function GET(
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

    const lesson = await loadLesson(slug);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const allQuestionIds: string[] = [];
    for (const section of lesson.sections) {
      for (const sub of section.subsections) {
        if (sub.quiz) allQuestionIds.push(sub.quiz.id);
      }
    }
    for (const q of lesson.masteryQuiz.questionPool) {
      allQuestionIds.push(q.id);
    }

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, user.id),
          inArray(quizAttempts.lessonId, lessonIdCandidates(slug))
        )
      );

    const statuses: Record<
      string,
      {
        answered: boolean;
        isCorrect: boolean;
        attemptsUsed: number;
        attemptsRemaining: number;
        locked: boolean;
        lockedUntil: string | null;
        xpEarned: number;
      }
    > = {};

    for (const qId of allQuestionIds) {
      const questionAttempts = attempts
        .filter((a) => a.questionId === qId)
        .sort(
          (a, b) =>
            new Date(b.attemptedAt).getTime() -
            new Date(a.attemptedAt).getTime()
        );

      const isCorrect = questionAttempts.some((a) => a.isCorrect);
      const latest = questionAttempts[0];
      const locked =
        !!latest?.lockedUntil && new Date() < latest.lockedUntil;
      const totalXp = questionAttempts.reduce((sum, a) => sum + a.xpEarned, 0);

      statuses[qId] = {
        answered: questionAttempts.length > 0,
        isCorrect,
        attemptsUsed: questionAttempts.length,
        attemptsRemaining: isCorrect ? 0 : Math.max(0, 3 - questionAttempts.length),
        locked,
        lockedUntil: locked ? latest!.lockedUntil!.toISOString() : null,
        xpEarned: totalXp,
      };
    }

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("GET /api/lessons/[slug]/quiz/status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
