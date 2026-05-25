/**
 * k6 load test — Price War vs-bot match creation (P5-L1 baseline).
 *
 * Prerequisites:
 *   brew install k6   # or see https://k6.io/docs/get-started/installation/
 *
 * Usage:
 *   k6 run scripts/k6/pricewar-vs-bot.js \
 *     -e BASE_URL=http://localhost:3000 \
 *     -e SUPABASE_ACCESS_TOKEN=<jwt> \
 *     -e VUS=10 -e DURATION=30s
 *
 * For authenticated runs, obtain a session JWT by signing in via the app and
 * copying the Supabase access token from browser devtools (Application → Cookies).
 *
 * Without SUPABASE_ACCESS_TOKEN, the script only hits public endpoints (metrics, play-modes).
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const submitLatency = new Trend("pricewar_submit_latency_ms", true);
const errorRate = new Rate("pricewar_errors");

export const options = {
  vus: Number(__ENV.VUS ?? 10),
  duration: __ENV.DURATION ?? "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    pricewar_errors: ["rate<0.05"],
    pricewar_submit_latency_ms: ["p(95)<500"],
  },
};

const BASE_URL = __ENV.BASE_URL ?? "http://localhost:3000";
const TOKEN = __ENV.SUPABASE_ACCESS_TOKEN ?? "";

function authHeaders() {
  if (!TOKEN) return {};
  return {
    Authorization: `Bearer ${TOKEN}`,
    Cookie: `sb-access-token=${TOKEN}`,
  };
}

export default function () {
  if (!TOKEN) {
    const metrics = http.get(`${BASE_URL}/api/pricewar/metrics`);
    check(metrics, { "metrics 200": (r) => r.status === 200 });
    sleep(1);
    return;
  }

  const createRes = http.post(
    `${BASE_URL}/api/pricewar/match/vs-bot`,
    JSON.stringify({
      scenarioId: "coffee-shop",
      playModeId: "blitz",
      botPersonalityId: "bot.budget",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    }
  );

  const created = check(createRes, {
    "match created": (r) => r.status === 201 || r.status === 200,
  });
  errorRate.add(!created);

  if (!created) {
    sleep(1);
    return;
  }

  const body = createRes.json();
  const matchId = body.matchId;
  if (!matchId) {
    errorRate.add(true);
    sleep(1);
    return;
  }

  const viewStart = Date.now();
  const viewRes = http.get(`${BASE_URL}/api/pricewar/match/${matchId}/view`, {
    headers: authHeaders(),
  });
  submitLatency.add(Date.now() - viewStart);

  check(viewRes, { "view 200": (r) => r.status === 200 });
  errorRate.add(viewRes.status !== 200);

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const p95 = data.metrics?.pricewar_submit_latency_ms?.values?.["p(95)"] ?? "n/a";
  const failed = data.metrics?.http_req_failed?.values?.rate ?? 0;
  return [
    "Price War k6 summary",
    `  p95 view latency: ${p95} ms`,
    `  http fail rate: ${(failed * 100).toFixed(2)}%`,
    "",
  ].join("\n");
}
