import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resolveLessonThumbnail } from "@/lib/lesson-thumbnail";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({
      lesson: {
        ...lesson,
        thumbnail: resolveLessonThumbnail(
          {
            title: lesson.title,
            category: lesson.category,
            difficulty: lesson.difficulty,
            description: lesson.description,
          },
          lesson.thumbnail
        ),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/lessons/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields: (keyof typeof lessons.$inferInsert)[] = [
      "title", "slug", "category", "difficulty", "estimatedMinutes",
      "description", "thumbnail", "sortOrder", "status", "sections",
      "masteryQuiz", "outlineData", "researchNotes", "contentProgress",
      "questionsProgress", "publishedAt",
    ];

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const [updated] = await db
      .update(lessons)
      .set(updates)
      .where(eq(lessons.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("PATCH /api/admin/lessons/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(lessons).where(eq(lessons.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/lessons/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
