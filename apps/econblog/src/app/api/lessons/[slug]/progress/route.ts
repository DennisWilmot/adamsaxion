import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { canonicalLessonId, lessonIdCandidates } from "@/lib/constants/lessons";

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

    const lessonIds = lessonIdCandidates(slug);

    const [progress] = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, user.id),
          inArray(lessonProgress.lessonId, lessonIds)
        )
      )
      .limit(1);

    if (!progress) {
      return NextResponse.json({
        lessonId: canonicalLessonId(slug),
        completedSubsections: [],
        unlockedSections: [],
        masteryAttempted: false,
        masteryPassed: false,
        masteryBestScore: null,
        totalXpEarned: 0,
        completedAt: null,
      });
    }

    return NextResponse.json({
      lessonId: progress.lessonId,
      completedSubsections: progress.completedSubsections,
      unlockedSections: progress.unlockedSections,
      masteryAttempted: progress.masteryAttempted,
      masteryPassed: progress.masteryPassed,
      masteryBestScore: progress.masteryBestScore,
      totalXpEarned: progress.totalXpEarned,
      completedAt: progress.completedAt,
    });
  } catch (error) {
    console.error("GET /api/lessons/[slug]/progress error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
