import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  generateLessonThumbnailDataUrl,
  type LessonThumbnailInput,
} from "./lesson-thumbnail";

export const CATALOG_THUMB_WIDTH = 960;
export const CATALOG_THUMB_WEBP_QUALITY = 88;

export function decodeThumbnailDataUrl(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/i);
  if (!match) {
    throw new Error("Invalid data URL");
  }

  const base64Flag = match[2];
  const payload = match[3];
  if (!payload) {
    throw new Error("Invalid data URL payload");
  }
  if (base64Flag) {
    return Buffer.from(payload, "base64");
  }
  return Buffer.from(decodeURIComponent(payload), "utf8");
}

export async function readThumbnailBytes(
  thumbnail: string | null | undefined,
  fallback: LessonThumbnailInput
): Promise<Buffer> {
  const value = thumbnail?.trim() ?? "";

  if (!value) {
    return decodeThumbnailDataUrl(generateLessonThumbnailDataUrl(fallback));
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    const response = await fetch(value);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for thumbnail URL`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  if (value.startsWith("data:")) {
    return decodeThumbnailDataUrl(value);
  }

  if (value.startsWith("/")) {
    return readFile(
      path.join(process.cwd(), "public", value.replace(/^\//, ""))
    );
  }

  throw new Error(`Unsupported thumbnail format: ${value.slice(0, 40)}`);
}

export async function optimizeCatalogThumbnail(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(CATALOG_THUMB_WIDTH, Math.round((CATALOG_THUMB_WIDTH * 9) / 16), {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: CATALOG_THUMB_WEBP_QUALITY })
    .toBuffer();
}
