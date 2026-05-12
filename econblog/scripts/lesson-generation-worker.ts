import "dotenv/config";
import {
  claimNextQueuedJob,
  runLessonGenerationJob,
} from "../src/lib/admin/lesson-generation-runner";

const POLL_INTERVAL_MS = Number(process.env.LESSON_JOB_POLL_MS ?? 2000);
const CONCURRENCY = Math.max(
  1,
  Number(process.env.LESSON_JOB_CONCURRENCY ?? 2)
);

const activeJobs = new Set<string>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function maybeStartJobs() {
  while (activeJobs.size < CONCURRENCY) {
    const job = await claimNextQueuedJob();
    if (!job) {
      break;
    }

    activeJobs.add(job.id);

    void runLessonGenerationJob(job.id).finally(() => {
      activeJobs.delete(job.id);
    });
  }
}

async function main() {
  console.log(
    `[lesson-worker] running with concurrency=${CONCURRENCY}, poll=${POLL_INTERVAL_MS}ms`
  );

  while (true) {
    try {
      await maybeStartJobs();
    } catch (error) {
      console.error("[lesson-worker] poll failed:", error);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

void main();
