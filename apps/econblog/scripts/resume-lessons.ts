import "dotenv/config";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../src/db";
import { lessonGenerationJobs, lessons } from "../src/db/schema";
import {
  getActiveLessonJob,
  queueLessonGenerationJob,
} from "../src/lib/admin/lesson-generation-runner";

const ACTIVE = ["queued", "running"] as const;

async function main() {
  const execute = process.argv.includes("--execute");

  const statusCounts = await db
    .select({
      status: lessons.status,
      count: sql<number>`count(*)::int`,
    })
    .from(lessons)
    .groupBy(lessons.status);

  console.log("\n=== Lesson status counts ===");
  for (const row of statusCounts.sort((a, b) => a.status.localeCompare(b.status))) {
    console.log(`  ${row.status}: ${row.count}`);
  }

  const activeJobs = await db
    .select({
      job: lessonGenerationJobs,
      lesson: { title: lessons.title, status: lessons.status },
    })
    .from(lessonGenerationJobs)
    .innerJoin(lessons, eq(lessonGenerationJobs.lessonId, lessons.id))
    .where(inArray(lessonGenerationJobs.status, [...ACTIVE]))
    .orderBy(lessonGenerationJobs.updatedAt);

  console.log(`\n=== Active jobs (${activeJobs.length}) ===`);
  for (const { job, lesson } of activeJobs.slice(0, 20)) {
    console.log(
      `  [${job.status}/${job.currentStage}] ${lesson.title.slice(0, 60)} — ${job.currentStep ?? "—"}`
    );
  }
  if (activeJobs.length > 20) {
    console.log(`  ... and ${activeJobs.length - 20} more`);
  }

  const incomplete = await db
    .select({ id: lessons.id, title: lessons.title, status: lessons.status })
    .from(lessons)
    .where(
      inArray(lessons.status, [
        "research",
        "outline",
        "content",
        "questions",
        "mastery",
      ])
    );

  const needsQueue: typeof incomplete = [];
  for (const lesson of incomplete) {
    const active = await getActiveLessonJob(lesson.id);
    if (!active) needsQueue.push(lesson);
  }

  console.log(`\n=== Incomplete without active job (${needsQueue.length}) ===`);
  for (const lesson of needsQueue.slice(0, 15)) {
    console.log(`  [${lesson.status}] ${lesson.title}`);
  }
  if (needsQueue.length > 15) {
    console.log(`  ... and ${needsQueue.length - 15} more`);
  }

  if (!execute) {
    if (needsQueue.length) {
      console.log("\nRun with --execute to re-queue lessons missing jobs.");
    }
    console.log("\nWorker: npm run worker:lessons");
    return;
  }

  let queued = 0;
  for (const lesson of needsQueue) {
    const result = await queueLessonGenerationJob(lesson.id);
    if (result.created) {
      queued++;
      console.log(`Queued: ${lesson.title}`);
    }
  }

  console.log(`\nRe-queued ${queued} lesson(s).`);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
