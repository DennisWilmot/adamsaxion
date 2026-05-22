import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { canonicalLessonId, lessonIdCandidates } from "@/lib/constants/lessons";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const passed = Boolean(body.passed);
    const score =
      typeof body.score === "number" ? Math.round(body.score) : undefined;

    const storedLessonId = canonicalLessonId(slug);
    const candidates = lessonIdCandidates(slug);

    const [existing] = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, user.id),
          inArray(lessonProgress.lessonId, candidates)
        )
      )
      .limit(1);

    const bestScore = Math.max(existing?.masteryBestScore ?? 0, score ?? 0);

    if (existing) {
      await db
        .update(lessonProgress)
        .set({
          masteryAttempted: true,
          masteryPassed: passed || existing.masteryPassed,
          masteryBestScore: bestScore,
          completedAt:
            passed || existing.masteryPassed
              ? existing.completedAt ?? new Date()
              : existing.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existing.id));
    } else {
      await db.insert(lessonProgress).values({
        userId: user.id,
        lessonId: storedLessonId,
        completedSubsections: [],
        unlockedSections: [],
        masteryAttempted: true,
        masteryPassed: passed,
        masteryBestScore: score ?? null,
        completedAt: passed ? new Date() : null,
      });
    }

    return NextResponse.json({
      ok: true,
      masteryPassed: passed || existing?.masteryPassed,
      showPathSetup: passed,
    });
  } catch (error) {
    console.error("POST mastery/complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
