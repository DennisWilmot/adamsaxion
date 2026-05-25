/**
 * k6 load test — Price War Blitz matchmaking queue (P5-L2).
 *
 * Usage:
 *   k6 run scripts/k6/pricewar-queue.js \
 *     -e BASE_URL=http://localhost:3000 \
 *     -e SUPABASE_ACCESS_TOKEN=<jwt> \
 *     -e VUS=500 -e DURATION=5m
 *
 * Requires paid-tier JWT for human matchmaking (carol/dan test accounts).
 * Each VU enqueues once per iteration; pairs should form or bot-fallback applies.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

const enqueueLatency = new Trend("pricewar_queue_latency_ms", true);
const errorRate = new Rate("pricewar_queue_errors");
const matchedCount = new Counter("pricewar_queue_matched");

export const options = {
  vus: Number(__ENV.VUS ?? 500),
  duration: __ENV.DURATION ?? "5m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    pricewar_queue_errors: ["rate<0.05"],
    pricewar_queue_latency_ms: ["p(95)<2000"],
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

  const start = Date.now();
  const res = http.post(
    `${BASE_URL}/api/pricewar/matchmaking/queue`,
    JSON.stringify({
      scenarioId: "coffee-shop",
      playModeId: "blitz",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    }
  );
  enqueueLatency.add(Date.now() - start);

  const ok = check(res, {
    "queue accepted": (r) => r.status === 201 || r.status === 200,
  });
  errorRate.add(!ok);

  if (ok) {
    const body = res.json();
    if (body.matched === true) {
      matchedCount.add(1);
    }
  }

  sleep(0.2);
}

export function handleSummary(data) {
  const p95 = data.metrics?.pricewar_queue_latency_ms?.values?.["p(95)"] ?? "n/a";
  const failed = data.metrics?.http_req_failed?.values?.rate ?? 0;
  const matched = data.metrics?.pricewar_queue_matched?.values?.count ?? 0;
  return {
    stdout: [
      "Price War queue k6 summary (P5-L2)",
      `  p95 enqueue latency: ${p95} ms`,
      `  http fail rate: ${(failed * 100).toFixed(2)}%`,
      `  matched pairs: ${matched}`,
      "",
    ].join("\n"),
  };
}
