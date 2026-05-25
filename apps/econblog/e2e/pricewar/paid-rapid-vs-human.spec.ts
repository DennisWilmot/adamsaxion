import { test, expect, type Browser } from "@playwright/test";
import {
  findActiveMatch,
  forfeitMatch,
  joinQueue,
  loginAs,
} from "./helpers/auth";

async function queueAs(
  browser: Browser,
  email: string,
  password: string
): Promise<{ matchId: string | null; request: import("@playwright/test").APIRequestContext }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAs(page, email, password);
  const data = await joinQueue(page, "coffee-shop", "rapid");
  return { matchId: data.matched ? data.matchId : null, request: context.request };
}

/**
 * Story 2 — paid Rapid human matchmaking creates a rated PvP match.
 * Full 8-round completion is covered by engine replay tests.
 */
test.describe("Price War paid Rapid vs human", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("carol and dan match into the same rated PvP game", async ({ browser }) => {
    const carolEmail =
      process.env.PRICEWAR_E2E_CAROL_EMAIL ?? "carol+test@adamsaxion.dev";
    const carolPassword =
      process.env.PRICEWAR_E2E_CAROL_PASSWORD ?? "TestCarol123!";
    const danEmail = process.env.PRICEWAR_E2E_DAN_EMAIL ?? "dan+test@adamsaxion.dev";
    const danPassword = process.env.PRICEWAR_E2E_DAN_PASSWORD ?? "TestDan123!";

    const carol = await queueAs(browser, carolEmail, carolPassword);
    const dan = await queueAs(browser, danEmail, danPassword);

    const matchId =
      carol.matchId ?? dan.matchId ?? (await findActiveMatch(carol.request));
    expect(matchId).toBeTruthy();

    if (!dan.matchId) {
      const danMatchId = await findActiveMatch(dan.request);
      expect(danMatchId).toBe(matchId);
    }

    for (const req of [carol.request, dan.request]) {
      const summaryRes = await req.get(`/api/pricewar/match/${matchId}/summary`);
      expect(summaryRes.ok()).toBe(true);
      const summary = await summaryRes.json();
      expect(summary.isRated).toBe(true);
      expect(summary.ratingAtStart).not.toBeNull();
    }

    await forfeitMatch(carol.request, matchId!);
  });
});
