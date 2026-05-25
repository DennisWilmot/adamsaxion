import { NextResponse } from "next/server";
import {
  cancelLessonGenerationJob,
  listAdminJobs,
  serializeJob,
} from "@/lib/admin/lesson-generation-runner";

export async function GET() {
  try {
    const { activeJobs, recentJobs } = await listAdminJobs();

    return NextResponse.json({
      activeJobs: activeJobs.map(({ job, lesson }) => ({
        job: serializeJob(job),
        lesson,
      })),
      recentJobs: recentJobs.map(({ job, lesson }) => ({
        job: serializeJob(job),
        lesson,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      jobId?: string;
    };

    if (body.action !== "cancel" || !body.jobId) {
      return NextResponse.json(
        { error: "action=cancel and jobId are required" },
        { status: 400 }
      );
    }

    const job = await cancelLessonGenerationJob(body.jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job: serializeJob(job) });
  } catch (error) {
    console.error("PATCH /api/admin/jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
