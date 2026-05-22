import fs from "fs";
import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { lessons } from "../src/db/schema";
import {
  LEGACY_LESSON_ZERO_SLUGS,
  LESSON_ZERO_SLUG,
} from "../src/lib/constants/lessons";

const LESSONS_DIR = path.join(process.cwd(), "src/content/lessons");

function lessonPayloadFromJson(lesson: Record<string, unknown>) {
  return {
    slug: String(lesson.id),
    title: String(lesson.title),
    category: String(lesson.category),
    difficulty: String(lesson.difficulty),
    estimatedMinutes: Number(lesson.estimatedMinutes) || 30,
    description: String(lesson.description || ""),
    thumbnail: String(lesson.thumbnail || ""),
    sortOrder: lesson.id === LESSON_ZERO_SLUG ? -1 : 0,
    status: "published" as const,
    sections: lesson.sections || [],
    masteryQuiz: lesson.masteryQuiz || null,
    outlineData: null,
    researchNotes: null,
    contentProgress: { completedSections: [] },
    questionsProgress: { completedSections: [] },
    publishedAt: new Date(),
  };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client);

  const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} lesson JSON files to migrate`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(LESSONS_DIR, file), "utf-8");
    const lesson = JSON.parse(raw);
    const payload = lessonPayloadFromJson(lesson);

    console.log(`Migrating: ${payload.slug}`);

    const [existingBySlug] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, payload.slug))
      .limit(1);

    if (existingBySlug) {
      await db
        .update(lessons)
        .set({
          title: payload.title,
          category: payload.category,
          difficulty: payload.difficulty,
          estimatedMinutes: payload.estimatedMinutes,
          description: payload.description,
          thumbnail: payload.thumbnail,
          sortOrder: payload.sortOrder,
          sections: payload.sections,
          masteryQuiz: payload.masteryQuiz,
          updatedAt: new Date(),
        })
        .where(eq(lessons.id, existingBySlug.id));
      console.log(`  ↻ Updated ${payload.slug}`);
      continue;
    }

    if (payload.slug === LESSON_ZERO_SLUG) {
      let renamed = false;
      for (const legacySlug of LEGACY_LESSON_ZERO_SLUGS) {
        const [legacy] = await db
          .select()
          .from(lessons)
          .where(eq(lessons.slug, legacySlug))
          .limit(1);

        if (legacy) {
          await db
            .update(lessons)
            .set({
              ...payload,
              updatedAt: new Date(),
            })
            .where(eq(lessons.id, legacy.id));
          console.log(`  ↻ Renamed ${legacySlug} → ${payload.slug}`);
          renamed = true;
          break;
        }
      }

      if (renamed) {
        continue;
      }

      await db.insert(lessons).values(payload);
      console.log(`  ✓ Migrated ${payload.slug}`);
      continue;
    }

    await db.insert(lessons).values(payload);
    console.log(`  ✓ Migrated ${payload.slug}`);
  }

  console.log("\nMigration complete!");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
