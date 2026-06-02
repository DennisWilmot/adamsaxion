/**
 * Generate Price War lobby art via OpenRouter (Gemini image model).
 *
 *   pnpm exec tsx scripts/generate-pricewar-lobby-assets.ts
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { generateImageDataUrl } from "../src/lib/openrouter";
import { decodeThumbnailDataUrl } from "../src/lib/lesson-thumbnail-bytes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "pricewar");
const ICON_DIR = path.join(OUT_DIR, "icons");

const ICON_PROMPTS: Record<string, string> = {
  "mode-blitz.webp": `Glossy 3D game UI icon of an electric lightning bolt. Vivid blue and white energy, soft studio lighting, premium mobile strategy game style. Pale cream background, centered, no text.`,
  "mode-rapid.webp": `Glossy 3D game UI icon of a stopwatch/clock. Silver and pale blue, soft studio lighting, premium mobile strategy game style. Pale cream background, centered, no text.`,
  "mode-tutorial.webp": `Glossy 3D game UI icon of an open tutorial book with a small compass on the cover. Warm gold and pale blue, premium mobile strategy game style. Pale cream background, centered, no text.`,
  "lobby-coffee.webp": `Glossy 3D game UI logo icon of a steaming latte coffee cup with latte art. Warm browns and pale blue accent lighting, premium mobile game quality. Pale cream background, centered, no text.`,
};

const ARENA_PROMPT = `Create a soft out-of-focus background plate for a game UI (16:9).

SCENE: Vague modern coffee shop interior — counter, window light, cup shapes. HEAVY gaussian blur, no sharp details, no readable text.

STYLE: Desaturated pale blue-gray photograph, low contrast, calm, recessive. Like f/1.4 bokeh — sits BEHIND white UI cards.

PALETTE: Powder blue, cream bokeh, soft gray. NOT vivid, NOT illustrative, NOT high saturation.

No characters, logos, or watermarks.`;

const ALDO_PROMPT = `Create a friendly character portrait illustration for a game coach card.

CHARACTER: "Prof. Aldo" — distinguished elderly economics professor, white hair, neat mustache, round glasses, warm smile, bow tie, tweed-ish jacket. Holding a steaming coffee cup. Approachable mentor energy, not stern.

COMPOSITION: Square portrait, head and shoulders, slightly angled, looking toward viewer. Clean simple background: soft warm cream with faint pale blue gradient. Character fills most of frame.

STYLE: Stylized editorial character art matching a premium strategy game — painterly, crisp details, consistent with a light blue / cream game UI palette. NOT photorealistic, NOT anime.

PALETTE: Warm skin tones, cream background, pale blue accent on jacket or background wash, gold accent on bow tie or glasses frame.

No text, no logos, no watermark.`;

async function saveWebp(dataUrl: string, filename: string, resize?: { width: number; height: number }) {
  let buf = decodeThumbnailDataUrl(dataUrl);
  let pipeline = sharp(buf).rotate();
  if (resize) {
    pipeline = pipeline.resize(resize.width, resize.height, {
      fit: "cover",
      position: "centre",
    });
  }
  const webp = await pipeline.webp({ quality: 90 }).toBuffer();
  const outPath = path.join(OUT_DIR, filename);
  await writeFile(outPath, webp);
  console.log(`Wrote ${outPath} (${(webp.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set — add it to apps/econblog/.env");
  }

  await mkdir(OUT_DIR, { recursive: true });

  console.log("Generating lobby arena hero (16:9)…");
  const arenaDataUrl = await generateImageDataUrl(ARENA_PROMPT, {
    aspectRatio: "16:9",
    imageSize: "2K",
    skipCache: true,
  });
  await saveWebp(arenaDataUrl, "lobby-arena-hero.webp", { width: 1920, height: 1080 });

  console.log("Generating Prof. Aldo coach portrait (1:1)…");
  const aldoDataUrl = await generateImageDataUrl(ALDO_PROMPT, {
    aspectRatio: "1:1",
    imageSize: "1K",
    skipCache: true,
  });
  await saveWebp(aldoDataUrl, "prof-aldo-coach.webp", { width: 512, height: 512 });

  await mkdir(ICON_DIR, { recursive: true });
  for (const [filename, prompt] of Object.entries(ICON_PROMPTS)) {
    console.log(`Generating ${filename}…`);
    const dataUrl = await generateImageDataUrl(prompt, {
      aspectRatio: "1:1",
      imageSize: "1K",
      skipCache: true,
    });
    await saveWebp(dataUrl, path.join("icons", filename), { width: 256, height: 256 });
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
