import { getOrComputeCachedValue } from "@/lib/admin/generation-cache";

/** SerpAPI — https://serpapi.com/search-api */
const SERPAPI_URL = "https://serpapi.com/search.json";
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const SEARCH_CACHE_VERSION = "serpapi-v1";

export interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerpApiOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
}

interface SerpApiResponse {
  organic_results?: SerpApiOrganicResult[];
  error?: string;
}

function getSearchApiKey() {
  const raw = process.env.SERPAPI_API_KEY?.trim() ?? "";
  return raw.replace(/^["']|["']$/g, "");
}

function mapResults(items: SerpApiOrganicResult[] | undefined): WebSearchResult[] {
  return (items ?? [])
    .filter((item) => item.title && item.link)
    .map((item, index) => ({
      title: item.title!,
      link: item.link!,
      snippet: item.snippet ?? "",
      position: item.position ?? index + 1,
    }));
}

export async function search(
  query: string,
  numResults = 10
): Promise<WebSearchResult[]> {
  const apiKey = getSearchApiKey();
  if (!apiKey) {
    throw new Error(
      "SERPAPI_API_KEY not set in econblog/.env (get key from serpapi.com/manage-api-key)"
    );
  }

  return getOrComputeCachedValue({
    kind: "serpapi-search",
    version: SEARCH_CACHE_VERSION,
    input: { query, numResults },
    ttlMs: SEARCH_CACHE_TTL_MS,
    compute: async () => {
      const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: apiKey,
        num: String(numResults),
      });

      const res = await fetch(`${SERPAPI_URL}?${params.toString()}`);

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`SerpAPI error (${res.status}): ${err}`);
      }

      const data: SerpApiResponse = await res.json();
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return mapResults(data.organic_results);
    },
  });
}

export async function testSerpApiConnection() {
  const apiKey = getSearchApiKey();
  if (!apiKey) {
    return {
      ok: false as const,
      error: "SERPAPI_API_KEY missing from econblog/.env",
    };
  }

  const params = new URLSearchParams({
    engine: "google",
    q: "economics scarcity",
    api_key: apiKey,
    num: "1",
  });

  const res = await fetch(`${SERPAPI_URL}?${params.toString()}`);
  const body = await res.text();

  if (!res.ok) {
    return { ok: false as const, status: res.status, error: body };
  }

  try {
    const data = JSON.parse(body) as SerpApiResponse;
    if (data.error) {
      return { ok: false as const, status: res.status, error: data.error };
    }
    const count = data.organic_results?.length ?? 0;
    return {
      ok: true as const,
      status: res.status,
      preview: `SerpAPI OK — ${count} organic result(s)`,
    };
  } catch {
    return { ok: true as const, status: res.status, preview: body.slice(0, 200) };
  }
}

export async function searchMultiple(
  queries: string[],
  numResults = 8
): Promise<{ query: string; results: WebSearchResult[] }[]> {
  const results = await Promise.all(
    queries.map(async (query) => ({
      query,
      results: await search(query, numResults),
    }))
  );
  return results;
}
