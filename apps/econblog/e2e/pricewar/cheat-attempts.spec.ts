import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 8 — server-side validation rejects manipulated or cross-user submits.
 * Requires seeded alice+test and bob+test (see seed-pricewar.ts).
 */
test.describe("Price War cheat attempts", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("TC-8.2: cross-user submit is rejected", async ({ browser }) => {
    const bobEmail = process.env.PRICEWAR_E2E_BOB_EMAIL ?? "bob+test@adamsaxion.dev";
    const bobPassword = process.env.PRICEWAR_E2E_BOB_PASSWORD ?? "TestBob123!";
    const aliceEmail = process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev";
    const alicePassword = process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!";

    const bobContext = await browser.newContext();
    const bobPage = await bobContext.newPage();
    await loginAs(bobPage, bobEmail, bobPassword);
    const matchId = await startVsBotMatch(bobPage);

    const aliceContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    await loginAs(alicePage, aliceEmail, alicePassword);

    const res = await aliceContext.request.post(
      `/api/pricewar/match/${matchId}/submit`,
      { data: { moves: [] } }
    );

    expect(res.ok()).toBe(false);
    // Server hides foreign matches (404) or rejects access (403).
    expect([403, 404]).toContain(res.status());
    const body = await res.json();
    expect(["FORBIDDEN", "MATCH_NOT_FOUND", "NOT_YOUR_TURN"]).toContain(body.code);

    await bobContext.request.post(`/api/pricewar/match/${matchId}/forfeit`);
    await bobContext.close();
    await aliceContext.close();
  });

  test("TC-8.1: impossible spend is rejected and state is unchanged", async ({
    page,
    request,
  }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    const matchId = await startVsBotMatch(page);

    const viewRes = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(viewRes.ok()).toBe(true);
    const before = await viewRes.json();
    const cashBefore = before.me.cash as number;

    const res = await request.post(`/api/pricewar/match/${matchId}/submit`, {
      data: {
        moves: [
          {
            moveId: "marketing.run_ad_campaign",
            input: { amount: cashBefore + 999_000 },
            draftedAt: new Date().toISOString(),
          },
        ],
      },
    });

    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(["INSUFFICIENT_RESOURCES", "INVALID_SUBMIT"]).toContain(body.code);

    const afterRes = await request.get(`/api/pricewar/match/${matchId}/view`);
    expect(afterRes.ok()).toBe(true);
    const after = await afterRes.json();
    expect(after.me.cash).toBe(cashBefore);
    expect(after.market.currentRound).toBe(before.market.currentRound);

    await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  });
});
