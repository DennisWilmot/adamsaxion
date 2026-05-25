import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 16 — bot transparency toggle.
 *
 * `NEXT_PUBLIC_BOT_TRANSPARENT` (see apps/econblog/.env.example) controls whether
 * the UI labels bot opponents explicitly. When false (default), bots present as
 * human persona names only. The flag is build-time / server env — this spec
 * asserts current default behavior only (no runtime env flip).
 *
 * MatchHeaderStrip shows clock, cash, and opponent price — not the opponent name.
 * Bot persona names appear in lobby/waiting UI; vs-bot skips that phase.
 */
test.describe("Price War bot transparency", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("TC-16.1: default env hides bot label in match chrome", async ({
    page,
    request,
  }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    const matchId = await startVsBotMatch(page);

    await expect(page.getByRole("button", { name: /Review & lock/i })).toBeVisible();

    const viewRes = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(viewRes.ok()).toBe(true);
    const view = await viewRes.json();
    expect(view.opponent.isBot).toBe(true);

    const header = page.locator(".mb-xl").first();
    await expect(header.getByText(/^Bot$/)).toHaveCount(0);
    await expect(header.getByText(/Bot ·/)).toHaveCount(0);
    await expect(page.getByText(/Bot ·/)).toHaveCount(0);

    await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  });
});
