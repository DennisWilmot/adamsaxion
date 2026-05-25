import { test, expect, type Browser } from "@playwright/test";
import {
  findActiveMatch,
  forceAbandon,
  joinQueue,
  loginAs,
  waitForMatchPhase,
} from "./helpers/auth";

async function queueAs(
  browser: Browser,
  email: string,
  password: string
): Promise<{
  matchId: string | null;
  request: import("@playwright/test").APIRequestContext;
  page: import("@playwright/test").Page;
}> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAs(page, email, password);
  const data = await joinQueue(page, "coffee-shop", "blitz");
  return {
    matchId: data.matched ? data.matchId : null,
    request: context.request,
    page,
  };
}

/**
 * Story 11 — disconnect + clock/grace expiry awards opponent a forfeit win.
 */
test.describe("Price War abandonment forfeit", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("abandoning player forfeits; opponent wins", async ({ browser }) => {
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

    await carol.page.goto(`/play/match/${matchId}/decide`);
    await dan.page.goto(`/play/match/${matchId}/decide`);

    await waitForMatchPhase(carol.request, matchId!, "decide");

    const abandonResult = await forceAbandon(dan.request, matchId!);
    expect(abandonResult.phase).toBe("completed");

    let carolView: {
      phase: string;
      me?: { slot: string };
      outcome?: { kind: string; reason?: string; winner?: string };
    } | null = null;
    for (let i = 0; i < 20; i++) {
      const res = await carol.request.get(`/api/pricewar/match/${matchId}/view`);
      if (res.ok()) {
        carolView = await res.json();
        if (carolView?.phase === "completed") break;
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    expect(carolView?.phase).toBe("completed");
    expect(carolView?.outcome?.kind).toBe("win");
    expect(carolView?.outcome?.reason).toBe("forfeit_on_abandonment");
    expect(carolView?.outcome?.winner).toBe(carolView?.me?.slot);

    await dan.page.close().catch(() => {});
    await carol.page.close().catch(() => {});
  });
});
