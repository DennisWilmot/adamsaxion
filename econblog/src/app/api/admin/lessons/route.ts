import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db
      .select({
        id: lessons.id,
        slug: lessons.slug,
        title: lessons.title,
        category: lessons.category,
        difficulty: lessons.difficulty,
        status: lessons.status,
        sortOrder: lessons.sortOrder,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        publishedAt: lessons.publishedAt,
      })
      .from(lessons)
      .orderBy(desc(lessons.updatedAt));

    return NextResponse.json({ lessons: all });
  } catch (error) {
    console.error("GET /api/admin/lessons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, category, difficulty } = body;

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
