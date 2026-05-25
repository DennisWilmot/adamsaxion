import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 5 — vs-bot match creation and bot auto-submit.
 * Requires seeded paid user (carol+test).
 */
test.describe("Price War vs-bot", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("creates match and bot locks within 15s; match is unrated", async ({
    page,
    request,
  }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    const matchId = await startVsBotMatch(page);

    await expect(page.getByRole("button", { name: /Review & lock/i })).toBeVisible();

    let opponentLocked = false;
    for (let i = 0; i < 30; i++) {
      const res = await request.get(`/api/pricewar/match/${matchId}/view`);
      if (res.ok()) {
        const view = await res.json();
        if (view.opponentHasLocked) {
          opponentLocked = true;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    expect(opponentLocked).toBe(true);

    const summaryRes = await request.get(`/api/pricewar/match/${matchId}/summary`);
    expect(summaryRes.ok()).toBe(true);
    const summary = await summaryRes.json();
    expect(summary.isRated).toBe(false);
  });
});
