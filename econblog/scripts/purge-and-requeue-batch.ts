/**
 * Delete all non-published in-progress batch lessons (Jamaica-centric run)
 * and re-create them fresh with current global-diversity prompts.
 *
 * Keeps: all published lessons (Lesson Zero, Game Theory, etc.)
 *
 * Usage:
 *   npm run purge:batch -- --dry-run
 *   npm run purge:batch -- --execute
 */
import "dotenv/config";
import { eq, ne, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { lessonGenerationJobs, lessons } from "../src/db/schema";
import { queueLessonGenerationJob } from "../src/lib/admin/lesson-generation-runner";
import { resolveLessonMetadata } from "../src/lib/admin/infer-lesson-metadata";

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

    if (!existing) return slug;
    slug = `${base.slice(0, Math.max(1, 76))}-${suffix}`;
    suffix += 1;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");

  if (!dryRun && !execute) {
    console.log("Usage: tsx scripts/purge-and-requeue-batch.ts --dry-run | --execute");
    process.exit(1);
  }

  const toDelete = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      status: lessons.status,
      category: lessons.category,
      difficulty: lessons.difficulty,
      description: lessons.description,
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .where(ne(lessons.status, "published"));

  const keep = await db
    .select({ title: lessons.title, status: lessons.status })
    .from(lessons)
    .where(eq(lessons.status, "published"));

  console.log(`\n=== KEEP (${keep.length} published) ===`);
  for (const row of keep) {
    console.log(`  [published] ${row.title}`);
  }

  console.log(`\n=== DELETE & RE-QUEUE (${toDelete.length}) ===`);
  for (const row of toDelete) {
    console.log(`  [${row.status}] ${row.title}`);
  }

  if (dryRun) {
    console.log("\nDry run only. Re-run with --execute to purge and re-queue.");
    return;
  }

  const topics = toDelete.map((row) => ({
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
  }));

  const ids = toDelete.map((row) => row.id);

  // Cancel any active jobs first (including stale "running" from dead workers)
  const activeJobs = await db
    .select()
    .from(lessonGenerationJobs)
    .where(inArray(lessonGenerationJobs.lessonId, ids));

  let cancelled = 0;
  for (const job of activeJobs) {
    if (job.status === "cancelled" || job.status === "completed" || job.status === "failed") {
      continue;
    }
    await db
      .update(lessonGenerationJobs)
      .set({
        status: "cancelled",
        cancelRequested: true,
        currentStep: "Cancelled for global-prompt batch purge.",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lessonGenerationJobs.id, job.id));
    cancelled++;
  }
  console.log(`\nCancelled ${cancelled} active jobs.`);

  // Delete lessons (cascades jobs + sources)
  await db.delete(lessons).where(inArray(lessons.id, ids));
  console.log(`Deleted ${ids.length} lessons.`);

  // Re-create fresh
  let created = 0;
  let queued = 0;
  for (const topic of topics) {
    const { category, difficulty } = resolveLessonMetadata({
      title: topic.title,
      description: topic.description,
      category: topic.category,
      difficulty: topic.difficulty,
    });

    const slug = await createUniqueSlug(topic.title);
    const [lesson] = await db
      .insert(lessons)
      .values({
        slug,
        title: topic.title,
        description: topic.description,
        category,
        difficulty,
        status: "research",
        sections: [],
        masteryQuiz: null,
        outlineData: null,
        researchNotes: null,
        contentProgress: { completedSections: [] },
        questionsProgress: { completedSections: [] },
        updatedAt: new Date(),
      })
      .returning();

    created++;
    const result = await queueLessonGenerationJob(lesson.id);
    if (result.created) queued++;
    console.log(`  Created & queued: ${topic.title}`);
  }

  console.log(`\nDone. Deleted ${ids.length}, created ${created}, queued ${queued}.`);
  console.log("Start worker: npm run worker:lessons");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
