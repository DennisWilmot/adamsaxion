/**
 * k6 load test — Price War submit spike (P5-L4).
 *
 * Sustained 100 req/sec submit traffic across active matches.
 *
 * Usage:
 *   k6 run scripts/k6/pricewar-submit-spike.js \
 *     -e BASE_URL=http://localhost:3000 \
 *     -e SUPABASE_ACCESS_TOKEN=<jwt> \
 *     -e RATE=100 -e DURATION=5m
 *
 * Each VU creates one vs-bot match on first iteration, then submits turns.
 * Expect some 4xx when matches complete or rate limits hit — focus on p99 latency.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const submitLatency = new Trend("pricewar_submit_spike_latency_ms", true);
const serverErrorRate = new Rate("pricewar_submit_5xx");

const BASE_URL = __ENV.BASE_URL ?? "http://localhost:3000";
const TOKEN = __ENV.SUPABASE_ACCESS_TOKEN ?? "";
const RATE = Number(__ENV.RATE ?? 100);
const DURATION = __ENV.DURATION ?? "5m";

export const options = {
  scenarios: {
    submit_spike: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: Math.min(RATE, 100),
      maxVUs: Math.max(RATE * 2, 200),
    },
  },
  thresholds: {
    pricewar_submit_spike_latency_ms: ["p(99)<1000"],
    pricewar_submit_5xx: ["rate<0.05"],
  },
};

function authHeaders() {
  if (!TOKEN) return {};
  return {
    Authorization: `Bearer ${TOKEN}`,
    Cookie: `sb-access-token=${TOKEN}`,
  };
}

const minimalSubmit = JSON.stringify({
  moves: [
    {
      moveId: "sales.set_price",
      input: 400,
      draftedAt: new Date().toISOString(),
    },
  ],
});

export function setup() {
  if (!TOKEN) return { matchIds: [] };

  const matchIds = [];
  const setupVUs = Math.min(RATE, 50);
  for (let i = 0; i < setupVUs; i++) {
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
    if (createRes.status === 201 || createRes.status === 200) {
      const body = createRes.json();
      if (body.matchId) matchIds.push(body.matchId);
    }
  }
  return { matchIds };
}

export default function (data) {
  if (!TOKEN) {
    const metrics = http.get(`${BASE_URL}/api/pricewar/metrics`);
    check(metrics, { "metrics 200": (r) => r.status === 200 });
    sleep(1);
    return;
  }

  const matchIds = data?.matchIds ?? [];
  if (matchIds.length === 0) {
    sleep(1);
    return;
  }

  const matchId = matchIds[(__VU - 1) % matchIds.length];
  const start = Date.now();
  const res = http.post(
    `${BASE_URL}/api/pricewar/match/${matchId}/submit`,
    minimalSubmit,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    }
  );
  submitLatency.add(Date.now() - start);

  serverErrorRate.add(res.status >= 500);

  check(res, {
    "submit not 5xx": (r) => r.status < 500,
  });

  sleep(0.01);
}

export function handleSummary(data) {
  const p99 = data.metrics?.pricewar_submit_spike_latency_ms?.values?.["p(99)"] ?? "n/a";
  const fivexx = data.metrics?.pricewar_submit_5xx?.values?.rate ?? 0;
  return {
    stdout: [
      "Price War submit spike k6 summary (P5-L4)",
      `  p99 submit latency: ${p99} ms`,
      `  5xx rate: ${(fivexx * 100).toFixed(2)}%`,
      "",
    ].join("\n"),
  };
}
