import fs from "fs";
import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { lessons } from "../src/db/schema";

const LESSONS_DIR = path.join(process.cwd(), "src/content/lessons");

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

    const slug = lesson.id;
    console.log(`Migrating: ${slug}`);

    const [existing] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);

    if (existing) {
      console.log(`  ⏭ Already exists, skipping`);
      continue;
    }

    await db.insert(lessons).values({
      slug,
      title: lesson.title,
      category: lesson.category,
      difficulty: lesson.difficulty,
      estimatedMinutes: lesson.estimatedMinutes || 30,
      description: lesson.description || "",
      thumbnail: lesson.thumbnail || "",
      sortOrder: 0,
      status: "published",
      sections: lesson.sections || [],
      masteryQuiz: lesson.masteryQuiz || null,
      outlineData: null,
      researchNotes: null,
      contentProgress: { completedSections: [] },
      questionsProgress: { completedSections: [] },
      publishedAt: new Date(),
    });

    console.log(`  ✓ Migrated ${slug}`);
  }

  console.log("\nMigration complete!");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
