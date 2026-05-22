import { getOrComputeCachedValue } from "@/lib/admin/generation-cache";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 365;
const IMAGE_CACHE_VERSION = "v4-iconic-varied";
const OPENROUTER_MIN_RETRY_TOKENS = 256;
const OPENROUTER_RETRY_TOKEN_BUFFER = 64;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

interface OpenRouterImageOptions {
  model?: string;
  aspectRatio?: string;
  imageSize?: string;
  /** Skip DB cache — use for thumbnails where each lesson must get a fresh image. */
  skipCache?: boolean;
}

type OpenRouterErrorPayload = {
  error?: {
    message?: string;
    code?: string;
  };
};

export class OpenRouterApiError extends Error {
  status: number;
  code?: string;
  affordableMaxTokens?: number;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      affordableMaxTokens?: number;
    }
  ) {
    super(message);
    this.name = "OpenRouterApiError";
    this.status = options.status;
    this.code = options.code;
    this.affordableMaxTokens = options.affordableMaxTokens;
  }
}

function parseOpenRouterErrorPayload(raw: string): OpenRouterErrorPayload | null {
  try {
    return JSON.parse(raw) as OpenRouterErrorPayload;
  } catch {
    return null;
  }
}

function extractAffordableMaxTokens(message: string): number | null {
  const match = message.match(/can only afford\s+(\d+)/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildOpenRouterApiError(status: number, raw: string) {
  const payload = parseOpenRouterErrorPayload(raw);
  const errorMessage = payload?.error?.message ?? raw;
  const affordableMaxTokens = extractAffordableMaxTokens(errorMessage);

  return new OpenRouterApiError(`OpenRouter API error (${status}): ${errorMessage}`, {
    status,
    code: payload?.error?.code,
    affordableMaxTokens: affordableMaxTokens ?? undefined,
  });
}

function cleanJSONResponse(raw: string) {
  return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function extractJSONObject(text: string) {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") depth++;
    if (char === "}") depth--;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

function parseJSONResponse<T>(raw: string): T {
  const cleaned = cleanJSONResponse(raw);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const extracted = extractJSONObject(cleaned);
    if (extracted) {
      return JSON.parse(extracted) as T;
    }
    throw new Error(
      `Invalid JSON response: ${cleaned.slice(0, 240)}${
        cleaned.length > 240 ? "..." : ""
      }`
    );
  }
}

export async function chat(
  messages: Message[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";
  let maxTokens = options.maxTokens ?? 8192;

  for (let attempt = 0; attempt < 2; attempt++) {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: maxTokens,
    };

    if (options.responseFormat) {
      body.response_format = options.responseFormat;
    }

    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    }

    const err = await res.text();
    const parsedError = buildOpenRouterApiError(res.status, err);
    const affordableMaxTokens = parsedError.affordableMaxTokens;

    if (
      attempt === 0 &&
      res.status === 402 &&
      affordableMaxTokens &&
      affordableMaxTokens >= OPENROUTER_MIN_RETRY_TOKENS &&
      affordableMaxTokens < maxTokens
    ) {
      maxTokens = Math.max(
        OPENROUTER_MIN_RETRY_TOKENS,
        affordableMaxTokens - OPENROUTER_RETRY_TOKEN_BUFFER
      );
      console.warn(
        `[openrouter] Credit-limited request. Retrying with max_tokens=${maxTokens}.`
      );
      continue;
    }

    throw parsedError;
  }

  throw new Error("OpenRouter request failed unexpectedly");
}

export async function chatJSON<T = unknown>(
  messages: Message[],
  options: Omit<OpenRouterOptions, "responseFormat"> = {}
): Promise<T> {
  const raw = await chat(messages, {
    ...options,
    responseFormat: { type: "json_object" },
  });

  try {
    return parseJSONResponse<T>(raw);
  } catch (parseError) {
    const repaired = await chat(
      [
        ...messages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "Your previous response was invalid JSON. Return the same answer as valid JSON only. Do not use markdown fences, prose, or commentary. Do not omit required fields.",
        },
      ],
      {
        ...options,
        responseFormat: { type: "json_object" },
      }
    );

    try {
      return parseJSONResponse<T>(repaired);
    } catch {
      throw parseError;
    }
  }
}

export async function generateImageDataUrl(
  prompt: string,
  options: OpenRouterImageOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const model =
    options.model ||
    process.env.OPENROUTER_IMAGE_MODEL ||
    "google/gemini-2.5-flash-image";

  const generate = async () => {
    const body: Record<string, unknown> = {
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: options.aspectRatio ?? "16:9",
        image_size: options.imageSize ?? "1K",
      },
    };

    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter image API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;
    const image =
      message?.images?.[0]?.image_url?.url ??
      message?.images?.[0]?.imageUrl?.url;

    if (!image || typeof image !== "string") {
      throw new Error("OpenRouter image API returned no image");
    }

    return image;
  };

  if (options.skipCache) {
    return generate();
  }

  return getOrComputeCachedValue({
    kind: "openrouter-image",
    version: IMAGE_CACHE_VERSION,
    input: {
      model,
      prompt,
      aspectRatio: options.aspectRatio ?? "16:9",
      imageSize: options.imageSize ?? "1K",
    },
    ttlMs: IMAGE_CACHE_TTL_MS,
    compute: generate,
  });
}
