import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 12 — concurrent submits for the same slot resolve to a single submission.
 * Requires seeded paid user (carol+test).
 */
test.describe("Price War submit race", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("TC-12.1: only one parallel submit succeeds for the round slot", async ({
    page,
    request,
  }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);

    const createRes = await request.post("/api/pricewar/match/vs-bot", {
      data: {
        scenarioId: "coffee-shop",
        playModeId: "blitz",
        botPersonalityId: "bot.budget",
      },
    });
    expect(createRes.ok()).toBe(true);
    const { matchId } = await createRes.json();

    const viewRes = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(viewRes.ok()).toBe(true);
    const view = await viewRes.json();
    expect(view.phase).toBe("decide");

    const parallel = 10;
    const results = await Promise.all(
      Array.from({ length: parallel }, () =>
        request.post(`/api/pricewar/match/${matchId}/submit`, {
          data: { moves: [] },
        })
      )
    );

    const statuses = results.map((r) => r.status());
    const successCount = statuses.filter((s) => s === 200).length;
    expect(successCount).toBe(1);

    const rejected = results.filter((r) => !r.ok());
    expect(rejected.length).toBe(parallel - 1);
    for (const res of rejected) {
      expect([409, 429]).toContain(res.status());
      const body = await res.json();
      expect([
        "ALREADY_SUBMITTED",
        "RATE_LIMITED",
        "MATCH_COMPLETED",
      ]).toContain(body.code);
    }

    const finalView = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(finalView.ok()).toBe(true);
    const after = await finalView.json();
    expect(["decide", "report", "completed"]).toContain(after.phase);
    if (after.phase === "decide") {
      expect(after.market.currentRound).toBeGreaterThan(view.market.currentRound);
    }
    if (after.phase === "report") {
      expect(after.market.lastResolvedRound).toBe(view.market.currentRound);
    }
  });
});
