import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { resolveLessonThumbnail } from "@/lib/lesson-thumbnail";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: lessons.id,
        slug: lessons.slug,
        title: lessons.title,
        description: lessons.description,
        category: lessons.category,
        difficulty: lessons.difficulty,
        status: lessons.status,
        sortOrder: lessons.sortOrder,
        thumbnail: lessons.thumbnail,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        publishedAt: lessons.publishedAt,
      })
      .from(lessons)
      .orderBy(desc(lessons.updatedAt));

    const all = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      status: row.status,
      sortOrder: row.sortOrder,
      thumbnail: resolveLessonThumbnail(
        {
          title: row.title,
          category: row.category,
          difficulty: row.difficulty,
          description: row.description,
        },
        row.thumbnail
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
    }));

    return NextResponse.json({ lessons: all });
  } catch (error) {
    console.error("GET /api/admin/lessons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, description, category, difficulty } = body;

    if (!topic || !category || !difficulty) {
      return NextResponse.json(
        { error: "topic, category, and difficulty are required" },
        { status: 400 }
      );
    }

    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);

    const [lesson] = await db
      .insert(lessons)
      .values({
        slug,
        title: topic,
        description: String(description || "").trim(),
        category,
        difficulty,
        status: "research",
        sections: [],
        contentProgress: { completedSections: [] },
        questionsProgress: { completedSections: [] },
      })
      .returning();

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/lessons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
