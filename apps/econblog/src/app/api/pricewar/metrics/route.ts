import { collectPriceWarMetrics } from "@/server/pricewar/metrics";

export async function GET(request: Request) {
  const token = process.env.PRICEWAR_METRICS_TOKEN;
  if (token) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${token}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const body = await collectPriceWarMetrics();
  return new Response(body, {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}
