import "dotenv/config";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { lessonGenerationJobs, lessons } from "../src/db/schema";
import {
  getActiveLessonJob,
  queueLessonGenerationJob,
} from "../src/lib/admin/lesson-generation-runner";

const EARLY_STATUSES = ["research", "outline"] as const;
const ACTIVE_JOB_STATUSES = ["queued", "running"] as const;

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");

  if (!dryRun && !execute) {
    console.log("Usage: tsx scripts/restart-early-lessons.ts --dry-run | --execute");
    process.exit(1);
  }

  const earlyLessons = await db
    .select()
    .from(lessons)
    .where(inArray(lessons.status, [...EARLY_STATUSES]))
    .orderBy(lessons.sortOrder);

  const activeJobs = await db
    .select({
      job: lessonGenerationJobs,
      lesson: {
        id: lessons.id,
        title: lessons.title,
        status: lessons.status,
      },
    })
    .from(lessonGenerationJobs)
    .innerJoin(lessons, eq(lessonGenerationJobs.lessonId, lessons.id))
    .where(inArray(lessonGenerationJobs.status, [...ACTIVE_JOB_STATUSES]))
    .orderBy(desc(lessonGenerationJobs.createdAt));

  console.log(`\n=== Early lessons (${earlyLessons.length}) ===`);
  for (const lesson of earlyLessons) {
    console.log(
      `- [${lesson.status}] ${lesson.title} (${lesson.slug}) — research: ${lesson.researchNotes ? "yes" : "no"}, outline: ${lesson.outlineData ? "yes" : "no"}`
    );
  }

  console.log(`\n=== Active jobs (${activeJobs.length}) ===`);
  for (const { job, lesson } of activeJobs) {
    console.log(
      `- [${job.status}/${job.currentStage}] ${lesson.title} — ${job.currentStep ?? "—"}`
    );
  }

  if (dryRun) {
    console.log("\nDry run only. Re-run with --execute to cancel, reset, and re-queue.");
    return;
  }

  let cancelled = 0;
  let reset = 0;
  let queued = 0;

  for (const lesson of earlyLessons) {
    const activeJob = await getActiveLessonJob(lesson.id);
    if (activeJob) {
      await db
        .update(lessonGenerationJobs)
        .set({
          status: "cancelled",
          cancelRequested: true,
          currentStep: "Cancelled for prompt refresh restart.",
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(lessonGenerationJobs.id, activeJob.id));
      cancelled++;
      console.log(`Cancelled job for: ${lesson.title}`);
    }

    await db
      .update(lessons)
      .set({
        status: "research",
        researchNotes: null,
        outlineData: null,
        sections: [],
        masteryQuiz: null,
        contentProgress: { completedSections: [] },
        questionsProgress: { completedSections: [] },
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, lesson.id));
    reset++;

    const result = await queueLessonGenerationJob(lesson.id);
    if (result.created) {
      queued++;
      console.log(`Queued: ${lesson.title}`);
    } else {
      console.log(`Already queued: ${lesson.title}`);
    }
  }

  // Cancel active jobs for early lessons that may have been missed
  for (const { job, lesson } of activeJobs) {
    if (!earlyLessons.some((l) => l.id === lesson.id)) continue;
    if (job.status === "cancelled") continue;
    await db
      .update(lessonGenerationJobs)
      .set({
        status: "cancelled",
        cancelRequested: true,
        currentStep: "Cancelled for prompt refresh restart.",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lessonGenerationJobs.id, job.id));
    cancelled++;
    console.log(`Force-cancelled: ${lesson.title}`);
  }

  // Re-queue any early lesson without an active job
  for (const lesson of earlyLessons) {
    const stillActive = await getActiveLessonJob(lesson.id);
    if (stillActive) continue;
    const result = await queueLessonGenerationJob(lesson.id);
    if (result.created) {
      queued++;
      console.log(`Re-queued: ${lesson.title}`);
    }
  }

  console.log(`\nDone. Cancelled ${cancelled}, reset ${reset}, queued ${queued}.`);
  console.log("Start worker: npm run worker:lessons");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
