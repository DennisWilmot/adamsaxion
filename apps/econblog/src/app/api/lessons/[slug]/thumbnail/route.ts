import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { lessonIdCandidates } from "@/lib/constants/lessons";
import {
  optimizeCatalogThumbnail,
  readThumbnailBytes,
} from "@/lib/lesson-thumbnail-bytes";

export const runtime = "nodejs";

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

async function serveCarouselFallback(dbSlug: string) {
  const filePath = path.join(process.cwd(), "public", "carousel", `${dbSlug}.webp`);
  const bytes = await readFile(filePath);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  for (const candidate of lessonIdCandidates(slug)) {
    const [row] = await db
      .select({
        thumbnail: lessons.thumbnail,
        title: lessons.title,
        category: lessons.category,
        difficulty: lessons.difficulty,
        description: lessons.description,
        status: lessons.status,
      })
      .from(lessons)
      .where(eq(lessons.slug, candidate))
      .limit(1);

    if (!row || row.status !== "published") {
      continue;
    }

    const fallback = {
      title: row.title,
      category: row.category,
      difficulty: row.difficulty,
      description: row.description,
    };

    try {
      const source = await readThumbnailBytes(row.thumbnail, fallback);
      const optimized = await optimizeCatalogThumbnail(source);

      return new NextResponse(new Uint8Array(optimized), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": CACHE_CONTROL,
        },
      });
    } catch (error) {
      console.error(`GET /api/lessons/${slug}/thumbnail error:`, error);
      try {
        return await serveCarouselFallback(candidate);
      } catch {
        return NextResponse.json(
          { error: "Thumbnail unavailable" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
}
