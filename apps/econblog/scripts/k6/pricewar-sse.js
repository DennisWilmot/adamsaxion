/**
 * k6 load test — Price War SSE connections (P5-L3 baseline).
 *
 * Usage:
 *   k6 run scripts/k6/pricewar-sse.js \
 *     -e BASE_URL=http://localhost:3000 \
 *     -e SUPABASE_ACCESS_TOKEN=<jwt> \
 *     -e MATCH_ID=<uuid> \
 *     -e VUS=50 -e DURATION=2m
 *
 * Create a match first (vs-bot) and pass its ID. Each VU opens one SSE stream.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const sseErrors = new Rate("pricewar_sse_errors");

export const options = {
  vus: Number(__ENV.VUS ?? 10),
  duration: __ENV.DURATION ?? "30s",
  thresholds: {
    pricewar_sse_errors: ["rate<0.01"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL ?? "http://localhost:3000";
const TOKEN = __ENV.SUPABASE_ACCESS_TOKEN ?? "";
const MATCH_ID = __ENV.MATCH_ID ?? "";

function authHeaders() {
  if (!TOKEN) return {};
  return {
    Authorization: `Bearer ${TOKEN}`,
    Cookie: `sb-access-token=${TOKEN}`,
  };
}

export default function () {
  if (!TOKEN || !MATCH_ID) {
    const metrics = http.get(`${BASE_URL}/api/pricewar/metrics`);
    check(metrics, { "metrics 200": (r) => r.status === 200 });
    sleep(1);
    return;
  }

  const res = http.get(`${BASE_URL}/api/pricewar/match/${MATCH_ID}/events`, {
    headers: {
      Accept: "text/event-stream",
      ...authHeaders(),
    },
    timeout: "30s",
  });

  const ok = check(res, {
    "sse connected": (r) => r.status === 200,
    "content-type sse": (r) =>
      (r.headers["Content-Type"] ?? "").includes("text/event-stream"),
  });
  sseErrors.add(!ok);

  sleep(5);
}
