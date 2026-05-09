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

  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}
