import { test, expect } from "@playwright/test";
import {
  expireClock,
  loginAs,
  startE2eBlitzMatch,
  waitForRound,
} from "./helpers/auth";

/**
 * Story 7 — first clock-out auto-passes; second ends match by forfeit.
 * Requires PRICEWAR_E2E_ENABLED=1 and PRICEWAR_E2E_PLAY_MODES=1 on the dev server.
 */
test.describe("Price War clock-out", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("second clock expiry forfeits the match", async ({ page, request }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    const matchId = await startE2eBlitzMatch(request);

    await page.goto(`/play/match/${matchId}/decide`);

    const first = await expireClock(request, matchId);
    expect(first.phase).toBe("decide");

    await waitForRound(request, matchId, 2);

    const second = await expireClock(request, matchId);
    expect(second.phase).toBe("completed");

    await page.reload();
    await page.waitForURL(/\/play\/match\/[^/]+\/(postmatch|abandoned)/, {
      timeout: 15_000,
    });
  });
});
