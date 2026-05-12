import { NextResponse } from "next/server";
import {
  cancelLessonGenerationJob,
  estimateRemainingSteps,
  getActiveLessonJob,
  getLessonById,
  listLessonJobs,
  queueLessonGenerationJob,
  serializeJob,
} from "@/lib/admin/lesson-generation-runner";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await getLessonById(id);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const jobs = await listLessonJobs(id);
    const activeJob = jobs.find(
      (job) => job.status === "queued" || job.status === "running"
    );

    return NextResponse.json({
      activeJob: activeJob ? serializeJob(activeJob) : null,
      jobs: jobs.map(serializeJob),
      hasRemainingWork: estimateRemainingSteps(lesson) > 0,
    });
  } catch (error) {
    console.error("GET /api/admin/lessons/[id]/autopilot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await getLessonById(id);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const result = await queueLessonGenerationJob(id);

    return NextResponse.json(
      {
        job: serializeJob(result.job),
        created: result.created,
      },
      { status: result.created ? 202 : 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/lessons/[id]/autopilot error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeJob = await getActiveLessonJob(id);

    if (!activeJob) {
      return NextResponse.json({ error: "No active job found" }, { status: 404 });
    }

    const job = await cancelLessonGenerationJob(activeJob.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job: serializeJob(job) });
  } catch (error) {
    console.error("DELETE /api/admin/lessons/[id]/autopilot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
