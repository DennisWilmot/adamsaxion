import { test, expect } from "@playwright/test";
import { loginAs, waitForMatchPhase } from "./helpers/auth";

/**
 * Report → Continue → Decide round advance after both players lock.
 */
test.describe("Price War report flow", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("TC-G2: submit resolves to report, continue advances to next decide", async ({
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

    const before = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(before.ok()).toBe(true);
    const startView = await before.json();
    const startRound = startView.market.currentRound;

    const submitRes = await request.post(`/api/pricewar/match/${matchId}/submit`, {
      data: {
        moves: [{ moveId: "sales.s01", input: { newPrice: 420 }, draftedAt: new Date().toISOString() }],
      },
    });
    expect(submitRes.ok()).toBe(true);
    const submitBody = await submitRes.json();
    expect(submitBody.resolved).toBe(true);

    const reportView = await waitForMatchPhase(request, matchId, "report");
    expect(reportView.market.lastResolvedRound ?? startRound).toBe(startRound);

    const reportRes = await request.get(`/api/pricewar/match/${matchId}/report/${startRound}`);
    expect(reportRes.ok()).toBe(true);
    const { report } = await reportRes.json();
    expect(report.publicSummary).toBeTruthy();
    expect(Array.isArray(report.publicEvents)).toBe(true);

    const continueRes = await request.post(`/api/pricewar/match/${matchId}/continue`);
    expect(continueRes.ok()).toBe(true);

    const afterView = await waitForMatchPhase(request, matchId, "decide");
    expect(afterView.market.currentRound).toBe(startRound + 1);

    await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  });
});
