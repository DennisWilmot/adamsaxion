import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 15 — admin re-resolve replays stored submissions with the current engine.
 * Requires admin+test in ADMIN_EMAILS and a seeded player (carol+test).
 */
test.describe("Price War determinism", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("TC-15.2: admin re-resolve reports no diff for a fresh match", async ({
    page,
    request,
  }) => {
    const playerEmail = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const playerPassword = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";
    const adminEmail =
      process.env.PRICEWAR_E2E_ADMIN_EMAIL ?? "admin+test@adamsaxion.dev";
    const adminPassword =
      process.env.PRICEWAR_E2E_ADMIN_PASSWORD ?? "TestAdmin123!";

    await loginAs(page, playerEmail, playerPassword);
    const matchId = await startVsBotMatch(page);

    await loginAs(page, adminEmail, adminPassword, "/admin/pricewar");

    const res = await request.post(
      `/api/pricewar/admin/matches/${matchId}/re-resolve`
    );
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body.matchId).toBe(matchId);
    expect(body.matches).toBe(true);
    expect(body.diffs).toEqual([]);

    await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  });
});
