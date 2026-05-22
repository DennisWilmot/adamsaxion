type LessonThumbnailInput = {
  title: string;
  category: string;
  difficulty?: string;
  description?: string;
};

import { generateImageDataUrl } from "./openrouter";

const THUMBNAIL_GENERATION_TIMEOUT_MS = 20_000;

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
  stroke: string;
  fill: string;
  motif: "curves" | "network" | "bars" | "flow" | "rings";
  accent: string;
};

const CATEGORY_THEMES: Record<string, Omit<Theme, "motif" | "accent">> = {
  Microeconomics: {
    background: ["#173d7a", "#3c70c8"],
    stroke: "#d8e7ff",
    fill: "#8eb8ff",
  },
  Macroeconomics: {
    background: ["#0f5e50", "#24a18d"],
    stroke: "#d9fff6",
    fill: "#8af1df",
  },
  Trade: {
    background: ["#9a4c14", "#e78a2f"],
    stroke: "#fff1dd",
    fill: "#ffd09c",
  },
  Finance: {
    background: ["#4d2d96", "#8c63e8"],
    stroke: "#efe7ff",
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

  return [
    "Create a minimalist editorial lesson thumbnail.",
    "Style: abstract, geometric, clean, modern, premium, painterly gradients, no photorealism, no text, no logos, no interface chrome.",
    `Lesson title inspiration: "${input.title}".`,
    `Category context: ${input.category}.`,
    input.difficulty ? `Difficulty tone: ${input.difficulty}.` : null,
    input.description
      ? `Use the lesson description as secondary inspiration: ${input.description.slice(0, 220)}`
      : null,
    `Visual direction: use a ${theme.motif} motif with restrained geometry, soft gradients, and one clear focal composition.`,
    `The image should feel abstract but recognizably inspired by the title phrase "${theme.accent || input.title}".`,
    "Include subtle humanity through abstract human presence — silhouettes, hands, posture, profiles, or symbolic figures integrated into the geometry. Keep faces minimal and non-photorealistic.",
    "Humanity should feel thoughtful and editorial, not stock-photo literal. Prefer one human gesture or figure over crowds.",
    "Make it distinct from generic economics cover art by choosing one specific visual metaphor rather than a collage of concepts.",
    "Use only 2-4 main shapes with strong hierarchy and generous negative space.",
    "Avoid charts with labels, clip-art, coins, textbooks, flags, or literal icon sets unless transformed into abstract geometric forms.",
    "Composition: 16:9 horizontal thumbnail, generous negative space, premium course-cover feel.",
  ]
    .filter(Boolean)
    .join(" ");
}

function renderMotif(theme: Theme) {
  switch (theme.motif) {
    case "network":
      return `
        <g opacity="0.92" stroke="${theme.stroke}" stroke-width="6" fill="none" stroke-linecap="round">
          <path d="M270 470 L500 250 L760 360 L930 210" opacity="0.55" />
          <path d="M340 240 L500 250 L640 130 L930 210" opacity="0.45" />
          <path d="M270 470 L480 520 L760 360" opacity="0.35" />
        </g>
        <g fill="${theme.fill}">
          <circle cx="270" cy="470" r="26" />
          <circle cx="340" cy="240" r="18" opacity="0.9" />
          <circle cx="500" cy="250" r="34" />
          <circle cx="640" cy="130" r="16" opacity="0.8" />
          <circle cx="760" cy="360" r="24" />
          <circle cx="930" cy="210" r="20" />
          <circle cx="480" cy="520" r="14" opacity="0.75" />
        </g>`;
    case "bars":
      return `
        <g opacity="0.95">
          <rect x="250" y="350" width="110" height="170" rx="24" fill="${theme.fill}" opacity="0.38" />
          <rect x="400" y="280" width="110" height="240" rx="24" fill="${theme.fill}" opacity="0.52" />
          <rect x="550" y="220" width="110" height="300" rx="24" fill="${theme.fill}" opacity="0.72" />
          <rect x="700" y="300" width="110" height="220" rx="24" fill="${theme.fill}" opacity="0.48" />
        </g>
        <g stroke="${theme.stroke}" stroke-width="8" fill="none" stroke-linecap="round">
          <path d="M220 470 C360 430, 470 210, 620 250 C760 290, 860 220, 970 150" />
        </g>`;
    case "flow":
      return `
        <g stroke="${theme.stroke}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
          <path d="M170 250 H590" />
          <path d="M560 220 L620 250 L560 280" />
          <path d="M320 430 H890" opacity="0.65" />
          <path d="M860 400 L920 430 L860 460" opacity="0.65" />
        </g>
        <g fill="${theme.fill}" opacity="0.8">
          <circle cx="270" cy="250" r="58" opacity="0.3" />
          <circle cx="760" cy="430" r="72" opacity="0.24" />
          <rect x="610" y="150" width="180" height="180" rx="42" opacity="0.18" />
        </g>`;
    case "rings":
      return `
        <g fill="none" stroke="${theme.stroke}" stroke-width="10" opacity="0.85">
          <circle cx="520" cy="320" r="170" />
          <circle cx="520" cy="320" r="115" opacity="0.75" />
          <circle cx="520" cy="320" r="58" opacity="0.6" />
        </g>
        <g fill="${theme.fill}" opacity="0.9">
          <circle cx="760" cy="240" r="32" />
          <circle cx="860" cy="180" r="18" opacity="0.72" />
          <circle cx="250" cy="450" r="26" opacity="0.72" />
        </g>`;
    case "curves":
    default:
      return `
        <g fill="none" stroke-linecap="round">
          <path d="M160 470 C300 420, 430 350, 560 210 C670 100, 810 115, 1030 180"
            stroke="${theme.stroke}" stroke-width="12" opacity="0.9" />
          <path d="M190 180 C320 250, 450 340, 610 430 C760 510, 900 490, 1030 420"
            stroke="${theme.fill}" stroke-width="12" opacity="0.72" />
        </g>
        <g fill="${theme.fill}" opacity="0.22">
          <circle cx="830" cy="185" r="92" />
          <circle cx="340" cy="390" r="72" />
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
        <radialGradient id="glow-${lessonId}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(910 145) rotate(135) scale(420 360)">
          <stop stop-color="#FFFFFF" stop-opacity="0.26" />
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="675" rx="48" fill="url(#bg-${lessonId})" />
      <rect width="1200" height="675" rx="48" fill="url(#glow-${lessonId})" />
      <rect x="42" y="42" width="1116" height="591" rx="36" stroke="rgba(255,255,255,0.14)" />

      ${renderMotif(theme)}

      <g opacity="0.42">
        <rect x="92" y="92" width="170" height="30" rx="999" fill="rgba(255,255,255,0.16)" />
        <circle cx="1068" cy="110" r="6" fill="rgba(255,255,255,0.48)" />
        <circle cx="1092" cy="110" r="6" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function resolveLessonThumbnail(
  input: LessonThumbnailInput,
  existingThumbnail?: string | null
) {
  const thumbnail = existingThumbnail?.trim() ?? "";

  // Legacy course images look visually inconsistent with the new abstract system,
  // so we replace them with generated lesson art.
  if (!thumbnail || thumbnail.startsWith("/thumbnails/")) {
    return generateLessonThumbnailDataUrl(input);
  }

  return thumbnail;
}

export async function createLessonThumbnail(
  input: LessonThumbnailInput,
  existingThumbnail?: string | null
) {
  const thumbnail = existingThumbnail?.trim() ?? "";

  if (
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
