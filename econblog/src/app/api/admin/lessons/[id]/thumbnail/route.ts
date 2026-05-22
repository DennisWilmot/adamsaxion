import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { createLessonThumbnail, resolveLessonThumbnail } from "@/lib/lesson-thumbnail";

export const maxDuration = 90;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[thumbnail] POST /api/admin/lessons/${id}/thumbnail`);

  try {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const thumbnail = await createLessonThumbnail(
      {
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        description: lesson.description,
      },
      lesson.thumbnail,
      { forceRegenerate: true }
    );

    const [updated] = await db
      .update(lessons)
      .set({
        thumbnail,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, id))
      .returning();

    console.log(`[thumbnail] regenerated thumbnail for lesson ${id}`);
    return NextResponse.json({
      lesson: {
        ...updated,
        thumbnail: resolveLessonThumbnail(
          {
            title: updated.title,
            category: updated.category,
            difficulty: updated.difficulty,
            description: updated.description,
          },
          updated.thumbnail
        ),
      },
    });
  } catch (error) {
    console.error("POST /api/admin/lessons/[id]/thumbnail error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
