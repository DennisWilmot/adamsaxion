import { NextResponse } from "next/server";
import { loadAllLessonMeta } from "@/lib/lesson-loader";

export async function GET() {
  try {
    const lessons = await loadAllLessonMeta();
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("GET /api/lessons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
