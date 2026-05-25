import { chatJSON, generateImageDataUrl } from "./openrouter";
import { getOrComputeCachedValue } from "@/lib/admin/generation-cache";

export type LessonThumbnailInput = {
  title: string;
  category: string;
  difficulty?: string;
  description?: string;
};

export const THUMBNAIL_PROMPT_VERSION = "v6-brief-inferred";

const THUMBNAIL_BRIEF_CACHE_VERSION = "v6";
const THUMBNAIL_BRIEF_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const THUMBNAIL_GENERATION_TIMEOUT_MS = 50_000;
const THUMBNAIL_BRIEF_TIMEOUT_MS = 20_000;

type ThumbnailVisualBrief = {
  economicIdea: string;
  iconicImagery: string;
  scene: string;
  emotion: string;
  lightingAndColor: string;
};

const DISTINCT_PALETTES = [
  "deep cobalt blue, crisp white, and sharp yellow accents",
  "forest green, warm ivory, and copper",
  "rich violet, soft lavender, and gold",
  "ocean teal, sand beige, and coral",
  "charcoal grey, cherry red, and cream",
  "midnight navy, silver, and electric cyan",
  "olive green, burnt sienna, and pale sky blue",
  "plum purple, mint green, and warm peach",
  "slate blue, rust orange, and oat white",
  "indigo, lemon, and soft pink",
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function pickPaletteVariant(title: string): string {
  let hash = 0;
  for (const char of title) {
    hash = (hash + char.charCodeAt(0)) % DISTINCT_PALETTES.length;
  }
  return DISTINCT_PALETTES[hash]!;
}

function fallbackBrief(input: LessonThumbnailInput): ThumbnailVisualBrief {
  return {
    economicIdea: `The core economic idea taught in "${input.title}"`,
    iconicImagery:
      "One or two large, readable symbols that students associate with this specific topic — textbook-cover clarity, not abstract decoration",
    scene:
      "A grounded everyday setting where those symbols are the hero; optional human figure interacting with them",
    emotion: "curiosity, tension, or discovery",
    lightingAndColor:
      pickPaletteVariant(input.title) + " — bold, high contrast, not warm sepia café lighting",
  };
}

async function inferThumbnailVisualBrief(
  input: LessonThumbnailInput,
  options: { skipCache?: boolean } = {}
): Promise<ThumbnailVisualBrief> {
  const compute = async () => {
    const assignedPalette = pickPaletteVariant(input.title);

    return chatJSON<ThumbnailVisualBrief>(
      [
        {
          role: "system",
          content: `You write visual briefs for premium economics course thumbnails.
Infer imagery from the LESSON TITLE first, then description and category.
Return JSON only with keys: economicIdea, iconicImagery, scene, emotion, lightingAndColor.

Rules:
- iconicImagery: name 1-2 SPECIFIC mainstream symbols for THIS exact topic (what a student would expect on a textbook cover). Large and readable at thumbnail size. Examples: dice for game theory, S/D curves for supply & demand, banknotes for hyperinflation, containers for trade — but pick what fits THIS title.
- scene: one concrete grounded setting; humans optional but must interact WITH the symbols, not replace them
- lightingAndColor: describe mood, light direction, and colors. Must incorporate this assigned palette: ${assignedPalette}. Do NOT default to amber/brown/sepia café tones.
- Be specific and visual. No generic "economics clipart".`,
        },
        {
          role: "user",
          content: [
            `Title: ${input.title}`,
            `Category: ${input.category}`,
            input.difficulty ? `Difficulty: ${input.difficulty}` : null,
            input.description ? `Description: ${input.description.slice(0, 400)}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      { temperature: 0.65, maxTokens: 600 }
    );
  };

  try {
    if (options.skipCache) {
      return await withTimeout(compute(), THUMBNAIL_BRIEF_TIMEOUT_MS, "Thumbnail brief inference");
    }

    return await withTimeout(
      getOrComputeCachedValue({
        kind: "thumbnail-visual-brief",
        version: THUMBNAIL_BRIEF_CACHE_VERSION,
        input: {
          title: input.title,
          category: input.category,
          difficulty: input.difficulty ?? "",
          description: input.description?.slice(0, 400) ?? "",
        },
        ttlMs: THUMBNAIL_BRIEF_CACHE_TTL_MS,
        compute,
      }),
      THUMBNAIL_BRIEF_TIMEOUT_MS,
      "Thumbnail brief inference"
    );
  } catch (error) {
    console.error("[thumbnail] Visual brief inference failed, using fallback:", error);
    return fallbackBrief(input);
  }
}

export function buildLessonThumbnailPrompt(
  input: LessonThumbnailInput,
  brief: ThumbnailVisualBrief
) {
  const colorPalette = pickPaletteVariant(input.title);

  return [
    `Create a premium course thumbnail illustration for: "${input.title}".`,
    "",
    "ECONOMIC IDEA (must read instantly at thumbnail size):",
    brief.economicIdea + ".",
    "",
    "ICONIC IMAGERY (hero of the image — large, central, readable):",
    brief.iconicImagery + ".",
    "",
    "SCENE:",
    brief.scene + ".",
    "",
    "EMOTION:",
    brief.emotion + ". Show through expression, posture, and situation.",
    "",
    "LIGHTING & COLOR:",
    brief.lightingAndColor + ".",
    `Also follow this assigned palette for catalog variety: ${colorPalette}.`,
    "Do NOT use the same warm amber/brown/sepia palette on every card.",
    "",
    "PEOPLE (if shown): Real, relatable humans — natural skin, everyday clothes, believable proportions. Editorial magazine illustration or indie film still. NOT marble statues, NOT faceless silhouettes, NOT surreal cosmic figures.",
    "",
    "STYLE: Stylized realism / editorial illustration. Painterly but crisp. Premium course-cover quality — sharp focal detail, intentional composition, rich but controlled color.",
    "",
    `Category: ${input.category}.`,
    input.difficulty ? `Difficulty: ${input.difficulty}.` : null,
    "",
    "COMPOSITION:",
    "- 16:9 horizontal.",
    "- One clear focal scene; theory symbols dominate, humans support.",
    "- Strong depth, contrast, and color separation so this card pops in a grid.",
    "- No text, logos, watermarks, or readable chart labels.",
    "",
    "AVOID: generic warm-brown café scenes, floating scales, glowing orbs, marble statues, teal-and-gold AI slop, abstract geometry with no setting, blurry soft focus, low-detail mush, stock-photo handshakes, identical look across unrelated topics.",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---- SVG fallback (when image API fails) ---- */

type Theme = {
  background: [string, string];
  warmAccent: string;
  stroke: string;
  fill: string;
  motif: "curves" | "network" | "bars" | "flow" | "rings";
  accent: string;
};

const CATEGORY_THEMES: Record<string, Omit<Theme, "motif" | "accent">> = {
  Microeconomics: {
    background: ["#1a3560", "#4a7fd4"],
    warmAccent: "#e8b86d",
    stroke: "#f5e6cc",
    fill: "#8eb8ff",
  },
  Macroeconomics: {
    background: ["#0f4a40", "#2cb8a3"],
    warmAccent: "#f0c987",
    stroke: "#fff1dd",
    fill: "#8af1df",
  },
  Trade: {
    background: ["#7a3a10", "#e09545"],
    warmAccent: "#ffe4b8",
    stroke: "#fff8ef",
    fill: "#ffd09c",
  },
  Finance: {
    background: ["#3a2278", "#7b55d9"],
    warmAccent: "#f2d18b",
    stroke: "#f3ecff",
    fill: "#cfbcff",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function chooseMotif(title: string): Theme["motif"] {
  const motifs: Theme["motif"][] = ["curves", "network", "bars", "flow", "rings"];
  let hash = 0;
  for (const char of title) {
    hash = (hash + char.charCodeAt(0)) % motifs.length;
  }
  return motifs[hash]!;
}

function chooseAccent(title: string) {
  const words = title
    .split(/[\s:,-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3);

  return words.slice(0, 2).join(" ");
}

function getTheme(input: LessonThumbnailInput): Theme {
  const base =
    CATEGORY_THEMES[input.category] ?? CATEGORY_THEMES.Microeconomics;
  if (!base) {
    throw new Error("Missing default lesson thumbnail theme");
  }

  return {
    ...base,
    motif: chooseMotif(input.title),
    accent: chooseAccent(input.title),
  };
}

function renderHumanSilhouette(warmAccent: string) {
  return `
    <g opacity="0.92">
      <ellipse cx="520" cy="560" rx="210" ry="28" fill="rgba(0,0,0,0.18)" />
      <path
        d="M520 470 C478 470 452 430 452 392 C452 352 478 318 520 318 C562 318 588 352 588 392 C588 430 562 470 520 470 Z"
        fill="${warmAccent}"
        opacity="0.95"
      />
      <path
        d="M470 478 C456 520 448 560 440 610 C440 628 456 640 472 640 L568 640 C584 640 600 628 600 610 C592 560 584 520 570 478 C552 492 488 492 470 478 Z"
        fill="${warmAccent}"
        opacity="0.95"
      />
    </g>`;
}

function renderMotif(theme: Theme) {
  switch (theme.motif) {
    case "network":
      return `
        <g opacity="0.35" stroke="${theme.stroke}" stroke-width="4" fill="none" stroke-linecap="round">
          <path d="M270 470 L500 250 L760 360 L930 210" />
        </g>`;
    case "bars":
      return `
        <g opacity="0.28">
          <rect x="250" y="350" width="110" height="170" rx="24" fill="${theme.fill}" />
          <rect x="400" y="280" width="110" height="240" rx="24" fill="${theme.fill}" />
        </g>`;
    case "flow":
      return `
        <g stroke="${theme.stroke}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.35">
          <path d="M170 250 H590" />
        </g>`;
    case "rings":
      return `
        <g fill="none" stroke="${theme.stroke}" stroke-width="8" opacity="0.3">
          <circle cx="820" cy="220" r="120" />
        </g>`;
    case "curves":
    default:
      return `
        <g fill="none" stroke-linecap="round" opacity="0.38">
          <path d="M160 470 C300 420, 430 350, 560 210 C670 100, 810 115, 1030 180"
            stroke="${theme.stroke}" stroke-width="10" />
        </g>`;
  }
}

export function generateLessonThumbnailDataUrl(input: LessonThumbnailInput) {
  const theme = getTheme(input);
  const lessonId = slugify(input.title || "lesson");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
      <title>${input.title}</title>
      <defs>
        <linearGradient id="bg-${lessonId}" x1="120" y1="80" x2="1080" y2="595" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.background[0]}" />
          <stop offset="1" stop-color="${theme.background[1]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" rx="48" fill="url(#bg-${lessonId})" />
      ${renderMotif(theme)}
      ${renderHumanSilhouette(theme.warmAccent)}
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function resolveLessonThumbnail(
  input: LessonThumbnailInput,
  existingThumbnail?: string | null
) {
  const thumbnail = existingThumbnail?.trim() ?? "";

  if (!thumbnail || thumbnail.startsWith("/thumbnails/")) {
    return generateLessonThumbnailDataUrl(input);
  }

  return thumbnail;
}

interface CreateLessonThumbnailOptions {
  forceRegenerate?: boolean;
}

export async function createLessonThumbnail(
  input: LessonThumbnailInput,
  existingThumbnail?: string | null,
  options: CreateLessonThumbnailOptions = {}
) {
  const thumbnail = existingThumbnail?.trim() ?? "";
  const { forceRegenerate = false } = options;

  if (
    !forceRegenerate &&
    thumbnail &&
    !thumbnail.startsWith("/thumbnails/") &&
    !thumbnail.startsWith("data:image/svg+xml")
  ) {
    return thumbnail;
  }

  try {
    const brief = await inferThumbnailVisualBrief(input, {
      skipCache: forceRegenerate,
    });
    const prompt = buildLessonThumbnailPrompt(input, brief);

    try {
      return await withTimeout(
        generateImageDataUrl(prompt, {
          aspectRatio: "16:9",
          imageSize: "2K",
          skipCache: true,
        }),
        THUMBNAIL_GENERATION_TIMEOUT_MS,
        "OpenRouter thumbnail generation (2K)"
      );
    } catch (highResError) {
      console.warn("[thumbnail] 2K generation failed, retrying at 1K:", highResError);
      return await withTimeout(
        generateImageDataUrl(prompt, {
          aspectRatio: "16:9",
          imageSize: "1K",
          skipCache: true,
        }),
        THUMBNAIL_GENERATION_TIMEOUT_MS,
        "OpenRouter thumbnail generation (1K)"
      );
    }
  } catch (error) {
    console.error("[thumbnail] OpenRouter image generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Thumbnail generation failed";
    if (message.includes("402") || /credits/i.test(message)) {
      throw new Error(
        "OpenRouter is out of credits. Add credits at openrouter.ai/settings/credits, then regenerate."
      );
    }
    throw error instanceof Error ? error : new Error(message);
  }
}
