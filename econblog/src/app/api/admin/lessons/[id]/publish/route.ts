import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createLessonThumbnail } from "@/lib/lesson-thumbnail";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.status !== "review" && lesson.status !== "archived") {
      return NextResponse.json(
        { error: `Cannot publish a lesson in "${lesson.status}" status. Must be in "review" first.` },
        { status: 400 }
      );
    }

    const thumbnail = await createLessonThumbnail(
      {
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        description: lesson.description,
      },
      lesson.thumbnail
    );

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

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("POST /api/admin/lessons/[id]/publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
