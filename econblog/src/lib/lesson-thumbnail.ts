type LessonThumbnailInput = {
  title: string;
  category: string;
  difficulty?: string;
  description?: string;
};

import { generateImageDataUrl } from "./openrouter";

export const THUMBNAIL_PROMPT_VERSION = "v2-human";

const THUMBNAIL_GENERATION_TIMEOUT_MS = 25_000;

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

function chooseMotif(title: string, category: string): Theme["motif"] {
  const haystack = `${title} ${category}`.toLowerCase();

  if (/(game|strategy|strategic|nash|incentive|coordination)/.test(haystack)) {
    return "network";
  }

  if (/(demand|supply|equilibrium|market|elasticity|price)/.test(haystack)) {
    return "curves";
  }

  if (/(keynes|stimulus|growth|inflation|recession|recovery|macro)/.test(haystack)) {
    return "bars";
  }

  if (/(trade|tariff|flow|exchange|global|import|export)/.test(haystack)) {
    return "flow";
  }

  if (/(finance|money|bank|interest|capital|risk)/.test(haystack)) {
    return "rings";
  }

  return "curves";
}

function chooseAccent(title: string) {
  const words = title
    .split(/[\s:,-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3);

  return words.slice(0, 2).join(" ");
}

function chooseHumanMoment(title: string, description?: string) {
  const haystack = `${title} ${description ?? ""}`.toLowerCase();

  if (/(game|strategy|nash|incentive|coordination|prisoner)/.test(haystack)) {
    return "two abstract figures facing each other across a table or divide, weighing a hard choice together";
  }

  if (/(budget|constraint|tradeoff|choice|scarcity)/.test(haystack)) {
    return "a lone figure at a crossroads or balancing scales in their hands, feeling the weight of a tradeoff";
  }

  if (/(preference|utility|consumer|demand|substitution|income)/.test(haystack)) {
    return "a contemplative figure in profile, hand on chin or reaching toward two paths, expressing inner deliberation";
  }

  if (/(keynes|recession|stimulus|unemployment|macro|growth)/.test(haystack)) {
    return "a small crowd or pair of figures under changing skies, suggesting collective economic pressure and recovery";
  }

  if (/(trade|tariff|exchange|global|import|export)/.test(haystack)) {
    return "figures exchanging objects or reaching across a divide, symbolizing connection and exchange between people";
  }

  if (/(finance|bank|interest|capital|risk|invest)/.test(haystack)) {
    return "a figure standing at the edge of an abstract landscape, looking forward with cautious hope";
  }

  if (/(supply|equilibrium|market|price)/.test(haystack)) {
    return "a buyer and seller as soft silhouettes meeting in the middle of flowing abstract forms";
  }

  return "one expressive human silhouette as the emotional center — posture should suggest curiosity, struggle, or discovery";
}

function getTheme(input: LessonThumbnailInput): Theme {
  const base =
    CATEGORY_THEMES[input.category] ?? CATEGORY_THEMES.Microeconomics;

  return {
    ...base,
    motif: chooseMotif(input.title, input.category),
    accent: chooseAccent(input.title),
  };
}

export function buildLessonThumbnailPrompt(input: LessonThumbnailInput) {
  const theme = getTheme(input);
  const humanMoment = chooseHumanMoment(input.title, input.description);

  return [
    `Editorial course-cover illustration for the economics lesson "${input.title}".`,
    "",
    "MOOD (most important): Warm, alive, human, thoughtful. This should feel like art made for real learners wrestling with hard ideas — not a cold corporate slide, not a sterile infographic, not neon tech wallpaper.",
    "",
    "HUMANITY (required — never skip): The image MUST include a clear human emotional anchor:",
    humanMoment + ".",
    "Use semi-abstract silhouettes, gestures, posture, hands, profiles, or small groups — painterly and expressive, never photorealistic stock photography.",
    "The human element should carry feeling: curiosity, tension, tradeoffs, discovery, responsibility, or connection.",
    "",
    "STYLE: Abstract editorial illustration with organic painterly gradients, soft cinematic light, warm amber/gold highlights against deep blues and greens.",
    `Include a subtle abstract ${theme.motif} motif in the environment around the figure — economics as context, not the whole image.`,
    "Brush-like edges, emotional color, one strong focal composition. Semi-abstract, tasteful, premium.",
    "",
    `Category: ${input.category}.`,
    input.difficulty ? `Tone: ${input.difficulty}.` : null,
    input.description
      ? `Lesson context: ${input.description.slice(0, 240)}`
      : null,
    "",
    "AVOID: lifeless geometric wallpaper, glowing network graphs, labeled charts, 3D corporate renders, clip-art icons, coins, textbooks, flags, neon cyber aesthetics, empty shapes with no human presence, symmetrical tech diagrams, AI slop.",
    "",
    "No text, no logos, no watermarks. 16:9 horizontal composition.",
  ]
    .filter(Boolean)
    .join("\n");
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
        opacity="0.88"
      />
      <path
        d="M598 410 C630 392 662 404 676 438 C684 462 674 486 648 496"
        stroke="${warmAccent}"
        stroke-width="14"
        stroke-linecap="round"
        fill="none"
        opacity="0.75"
      />
    </g>`;
}

function renderMotif(theme: Theme) {
  switch (theme.motif) {
    case "network":
      return `
        <g opacity="0.35" stroke="${theme.stroke}" stroke-width="4" fill="none" stroke-linecap="round">
          <path d="M270 470 L500 250 L760 360 L930 210" />
          <path d="M340 240 L500 250 L640 130 L930 210" />
        </g>`;
    case "bars":
      return `
        <g opacity="0.28">
          <rect x="250" y="350" width="110" height="170" rx="24" fill="${theme.fill}" />
          <rect x="400" y="280" width="110" height="240" rx="24" fill="${theme.fill}" />
          <rect x="700" y="300" width="110" height="220" rx="24" fill="${theme.fill}" />
        </g>`;
    case "flow":
      return `
        <g stroke="${theme.stroke}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.35">
          <path d="M170 250 H590" />
          <path d="M320 430 H890" />
        </g>`;
    case "rings":
      return `
        <g fill="none" stroke="${theme.stroke}" stroke-width="8" opacity="0.3">
          <circle cx="820" cy="220" r="120" />
          <circle cx="820" cy="220" r="78" />
        </g>`;
    case "curves":
    default:
      return `
        <g fill="none" stroke-linecap="round" opacity="0.38">
          <path d="M160 470 C300 420, 430 350, 560 210 C670 100, 810 115, 1030 180"
            stroke="${theme.stroke}" stroke-width="10" />
          <path d="M190 180 C320 250, 450 340, 610 430 C760 510, 900 490, 1030 420"
            stroke="${theme.fill}" stroke-width="10" />
        </g>`;
  }
}

export function generateLessonThumbnailDataUrl(input: LessonThumbnailInput) {
  const theme = getTheme(input);
  const prompt = buildLessonThumbnailPrompt(input);
  const lessonId = slugify(input.title || "lesson");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
      <title>${input.title}</title>
      <desc>${prompt}</desc>
      <defs>
        <linearGradient id="bg-${lessonId}" x1="120" y1="80" x2="1080" y2="595" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.background[0]}" />
          <stop offset="1" stop-color="${theme.background[1]}" />
        </linearGradient>
        <radialGradient id="warm-${lessonId}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(520 360) rotate(90) scale(380 320)">
          <stop stop-color="${theme.warmAccent}" stop-opacity="0.22" />
          <stop offset="1" stop-color="${theme.warmAccent}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="675" rx="48" fill="url(#bg-${lessonId})" />
      <rect width="1200" height="675" rx="48" fill="url(#warm-${lessonId})" />

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
    return await withTimeout(
      generateImageDataUrl(buildLessonThumbnailPrompt(input), {
        aspectRatio: "16:9",
        imageSize: "1K",
      }),
      THUMBNAIL_GENERATION_TIMEOUT_MS,
      "OpenRouter thumbnail generation"
    );
  } catch (error) {
    console.error("[thumbnail] OpenRouter image generation failed:", error);
    return generateLessonThumbnailDataUrl(input);
  }
}
