import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 4 — free tier concurrent match cap (1 active match).
 */
test.describe("Price War free concurrent cap", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("API blocks second vs-bot match while first is active", async ({ page, request }) => {
    const email = process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!";

    await loginAs(page, email, password);

    const first = await request.post("/api/pricewar/match/vs-bot", {
      data: {
        scenarioId: "coffee-shop",
        playModeId: "blitz",
        botPersonalityId: "bot.budget",
      },
    });
    expect(first.ok()).toBe(true);
    const { matchId } = await first.json();

    const second = await request.post("/api/pricewar/match/vs-bot", {
      data: {
        scenarioId: "coffee-shop",
        playModeId: "blitz",
        botPersonalityId: "bot.budget",
      },
    });
    expect(second.status()).toBe(403);
    const body = await second.json();
    expect(body.message).toContain("already have a match in progress");

    await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  });
});
