import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessonSources } from "@/db/schema";
import { getOrComputeCachedValue } from "@/lib/admin/generation-cache";
import { eq } from "drizzle-orm";

const SOURCE_EXTRACTION_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 180;
const SOURCE_EXTRACTION_CACHE_VERSION = "v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sources = await db
      .select()
      .from(lessonSources)
      .where(eq(lessonSources.lessonId, id));

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("GET sources error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const sourceType = file.name.endsWith(".pdf") ? "pdf" : "text";
      const contentHash = createHash("sha256").update(buffer).digest("hex");
      const text = await getOrComputeCachedValue({
        kind: "source-extraction",
        version: SOURCE_EXTRACTION_CACHE_VERSION,
        input: {
          sourceType,
          contentHash,
        },
        ttlMs: SOURCE_EXTRACTION_CACHE_TTL_MS,
        compute: async () => {
          if (sourceType === "pdf") {
            const pdfParse = (await import("pdf-parse")) as any;
            const parseFn = pdfParse.default || pdfParse;
            const parsed = await parseFn(buffer);
            return parsed.text as string;
          }

          return buffer.toString("utf-8");
        },
      });

      const [source] = await db
        .insert(lessonSources)
        .values({
          lessonId: id,
          type: sourceType,
          title: file.name,
          content: text,
        })
        .returning();

      return NextResponse.json({ source }, { status: 201 });
    }

    const body = await request.json();
    const { type, title, content, sourceUrl } = body;

    const [source] = await db
      .insert(lessonSources)
      .values({
        lessonId: id,
        type: type || "text",
        title: title || "Untitled",
        content: content || "",
        sourceUrl,
      })
      .returning();

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error("POST sources error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId");
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId required" }, { status: 400 });
    }

    await db.delete(lessonSources).where(eq(lessonSources.id, sourceId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE sources error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
