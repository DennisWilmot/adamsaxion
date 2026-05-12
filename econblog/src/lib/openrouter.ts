const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
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

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 8192,
  };

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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
