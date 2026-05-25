import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { queueLessonGenerationJob } from "@/lib/admin/lesson-generation-runner";
import { resolveLessonMetadata } from "@/lib/admin/infer-lesson-metadata";

type BatchLessonInput = {
  title?: string;
  topic?: string;
  description?: string;
  category?: string;
  difficulty?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createUniqueSlug(baseTitle: string) {
  const base = slugify(baseTitle) || "lesson";
  let slug = base;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);

    if (!existing) {
      return slug;
    }

    slug = `${base.slice(0, Math.max(1, 76))}-${suffix}`;
    suffix += 1;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessonInputs = Array.isArray(body.lessons) ? body.lessons : [];
    const autoQueue = body.autoQueue !== false;

    if (lessonInputs.length === 0) {
      return NextResponse.json(
        { error: "At least one lesson is required" },
        { status: 400 }
      );
    }

    if (lessonInputs.length > 100) {
      return NextResponse.json(
        { error: "Batch limit is 100 lessons per request" },
        { status: 400 }
      );
    }

    const normalized = lessonInputs
      .map((lesson: BatchLessonInput) => {
        const title = String(lesson.title || lesson.topic || "").trim();
        const description = String(lesson.description || "").trim();
        const { category, difficulty } = resolveLessonMetadata({
          title,
          description,
          ...(lesson.category !== undefined ? { category: lesson.category } : {}),
          ...(lesson.difficulty !== undefined ? { difficulty: lesson.difficulty } : {}),
        });

        return { title, description, category, difficulty };
      })
      .filter((lesson: { title: string }) => lesson.title);

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "No valid lesson rows were found" },
        { status: 400 }
      );
    }

    const createdLessons = [];

    for (const lesson of normalized) {
      const slug = await createUniqueSlug(lesson.title);

      const [created] = await db
        .insert(lessons)
        .values({
          slug,
          title: lesson.title,
          description: lesson.description,
          category: lesson.category,
          difficulty: lesson.difficulty,
          status: "research",
          sections: [],
          contentProgress: { completedSections: [] },
          questionsProgress: { completedSections: [] },
        })
        .returning();

      if (!created) {
        continue;
      }

      if (autoQueue) {
        await queueLessonGenerationJob(created.id);
      }

      createdLessons.push(created);
    }

    return NextResponse.json(
      {
        lessons: createdLessons,
        queued: autoQueue ? createdLessons.length : 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/lessons/batch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
