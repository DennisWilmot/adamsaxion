import { test, expect } from "@playwright/test";

/**
 * P5-CH4 — when ENABLE_PRICEWAR=false, game APIs return 503.
 *
 * Run against a dev server started with ENABLE_PRICEWAR=false:
 *   ENABLE_PRICEWAR=false pnpm dev
 *   ENABLE_PRICEWAR=false pnpm -F @adamsaxion/econblog exec playwright test e2e/pricewar/feature-flag.spec.ts
 */
test.describe("Price War feature flag disabled", () => {
  test.skip(
    process.env.ENABLE_PRICEWAR !== "false" && process.env.ENABLE_PRICEWAR !== "0",
    "Set ENABLE_PRICEWAR=false on the test process and dev server to run"
  );

  test("vs-bot returns 503 when Price War is disabled", async ({ request }) => {
    const res = await request.post("/api/pricewar/match/vs-bot", {
      data: {
        scenarioId: "coffee-shop",
        playModeId: "blitz",
        botPersonalityId: "bot.budget",
      },
    });

    expect(res.status()).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("SERVICE_UNAVAILABLE");
  });

  test("metrics endpoint stays available when disabled", async ({ request }) => {
    const res = await request.get("/api/pricewar/metrics");
    expect(res.status()).toBe(200);
  });
});
