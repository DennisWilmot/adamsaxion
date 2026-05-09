const SERPER_API_URL = "https://google.serper.dev/search";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerperResponse {
  organic: SerperResult[];
  knowledgeGraph?: {
    title?: string;
    description?: string;
  };
}

export async function search(query: string, numResults = 10): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error("SERPER_API_KEY not set");

  const res = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: numResults }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serper API error (${res.status}): ${err}`);
  }

  const data: SerperResponse = await res.json();
  return data.organic ?? [];
}

export async function searchMultiple(queries: string[], numResults = 8): Promise<{
  query: string;
  results: SerperResult[];
}[]> {
  const results = await Promise.all(
    queries.map(async (query) => ({
      query,
      results: await search(query, numResults),
    }))
  );
  return results;
}
