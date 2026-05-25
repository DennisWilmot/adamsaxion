/**
 * Delete all non-published lessons. Cascades lesson_generation_jobs and lesson_sources.
 * Does NOT re-queue or recreate lessons.
 *
 * Usage:
 *   tsx scripts/delete-unpublished-lessons.ts --dry-run
 *   tsx scripts/delete-unpublished-lessons.ts --execute
 */
import "dotenv/config";
import { eq, ne, inArray, sql } from "drizzle-orm";
import { db } from "../src/db";
import { lessonGenerationJobs, lessonSources, lessons } from "../src/db/schema";

const ACTIVE_JOB_STATUSES = ["queued", "running", "pending"] as const;

async function summarize() {
  const byStatus = await db
    .select({
      status: lessons.status,
      count: sql<number>`count(*)::int`,
    })
    .from(lessons)
    .groupBy(lessons.status);

  const jobCounts = await db
    .select({
      status: lessonGenerationJobs.status,
      count: sql<number>`count(*)::int`,
    })
    .from(lessonGenerationJobs)
    .groupBy(lessonGenerationJobs.status);

  const sourceCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessonSources);

  return { byStatus, jobCounts, sourceCount: sourceCount[0]?.count ?? 0 };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");

  if (!dryRun && !execute) {
    console.log("Usage: tsx scripts/delete-unpublished-lessons.ts --dry-run | --execute");
    process.exit(1);
  }

  const toDelete = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      status: lessons.status,
    })
    .from(lessons)
    .where(ne(lessons.status, "published"));

  const keep = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      status: lessons.status,
    })
    .from(lessons)
    .where(eq(lessons.status, "published"));

  const deleteIds = toDelete.map((row) => row.id);

  const activeJobs =
    deleteIds.length > 0
      ? await db
          .select({
            id: lessonGenerationJobs.id,
            lessonId: lessonGenerationJobs.lessonId,
            status: lessonGenerationJobs.status,
          })
          .from(lessonGenerationJobs)
          .where(inArray(lessonGenerationJobs.lessonId, deleteIds))
      : [];

  const activeForDeleted = activeJobs.filter((job) =>
    ACTIVE_JOB_STATUSES.includes(job.status as (typeof ACTIVE_JOB_STATUSES)[number])
  );

  console.log(`\n=== KEEP (${keep.length} published) ===`);
  for (const row of keep) {
    console.log(`  [published] ${row.title} (${row.slug})`);
  }

  console.log(`\n=== DELETE (${toDelete.length} non-published) ===`);
  for (const row of toDelete) {
    console.log(`  [${row.status}] ${row.title} (${row.slug})`);
  }

  if (activeForDeleted.length > 0) {
    console.log(`\n=== ACTIVE JOBS ON DELETED LESSONS (${activeForDeleted.length}) ===`);
    for (const job of activeForDeleted) {
      console.log(`  [${job.status}] job ${job.id} -> lesson ${job.lessonId}`);
    }
    console.log("  (Will be removed via cascade when lessons are deleted.)");
  }

  if (dryRun) {
    console.log("\nDry run only. Re-run with --execute to delete.");
    const summary = await summarize();
    console.log("\n=== CURRENT DB STATE ===");
    console.log("Lessons by status:", summary.byStatus);
    console.log("Jobs by status:", summary.jobCounts);
    console.log("Lesson sources:", summary.sourceCount);
    return;
  }

  if (deleteIds.length === 0) {
    console.log("\nNothing to delete.");
  } else {
    await db.delete(lessons).where(inArray(lessons.id, deleteIds));
    console.log(`\nDeleted ${deleteIds.length} non-published lessons.`);
  }

  const summary = await summarize();
  console.log("\n=== FINAL DB STATE ===");
  console.log("Lessons by status:", summary.byStatus);
  console.log("Jobs by status:", summary.jobCounts);
  console.log("Lesson sources:", summary.sourceCount);
  console.log(`\nDone. Kept ${keep.length}, deleted ${deleteIds.length}.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
