import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 14 — match-create rate limit (10/hour per user).
 */
test.describe("Price War rate limit", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("11th match create returns 429", async ({ page, request }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);

    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request.post("/api/pricewar/match/vs-bot", {
        data: {
          scenarioId: "coffee-shop",
          playModeId: "blitz",
          botPersonalityId: "bot.budget",
        },
      });
      lastStatus = res.status();
      if (res.ok()) {
        const { matchId } = await res.json();
        await request.post(`/api/pricewar/match/${matchId}/forfeit`);
      }
    }

    expect(lastStatus).toBe(429);
  });
});
