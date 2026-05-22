import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isLessonReadyToPublish } from "@/lib/admin/publish";
import { createLessonThumbnail } from "@/lib/lesson-thumbnail";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[publish] POST /api/admin/lessons/${id}/publish`);

  try {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!isLessonReadyToPublish(lesson)) {
      return NextResponse.json(
        {
          error: `Cannot publish a lesson in "${lesson.status}" status. Finish generation and move to review first.`,
        },
        { status: 400 }
      );
    }

    let thumbnail = lesson.thumbnail;
    try {
      thumbnail = await createLessonThumbnail(
        {
          title: lesson.title,
          category: lesson.category,
          difficulty: lesson.difficulty,
          description: lesson.description,
        },
        lesson.thumbnail,
        { forceRegenerate: true }
      );
    } catch (thumbnailError) {
      console.error("POST /api/admin/lessons/[id]/publish thumbnail error:", thumbnailError);
    }

    const [updated] = await db
      .update(lessons)
      .set({
        thumbnail,
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, id))
      .returning();

    console.log(`[publish] published lesson ${id} (${updated?.title ?? "unknown"})`);
    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("POST /api/admin/lessons/[id]/publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
