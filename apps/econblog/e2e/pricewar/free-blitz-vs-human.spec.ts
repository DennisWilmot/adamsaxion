import { test, expect, type Browser } from "@playwright/test";
import { loginAs } from "./helpers/auth";

async function joinQueue(
  browser: Browser,
  email: string,
  password: string
): Promise<{ matchId: string | null; request: import("@playwright/test").APIRequestContext }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAs(page, email, password);
  const res = await context.request.post("/api/pricewar/matchmaking/queue", {
    data: { scenarioId: "coffee-shop", playModeId: "blitz" },
  });
  expect(res.ok()).toBe(true);
  const data = await res.json();
  return { matchId: data.matched ? (data.matchId as string) : null, request: context.request };
}

async function findActiveMatch(
  request: import("@playwright/test").APIRequestContext,
  attempts = 20
): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const res = await request.get("/api/pricewar/history");
    if (res.ok()) {
      const { matches } = await res.json();
      const active = matches?.find(
        (m: { phase: string; outcomeKind: string; matchId: string }) =>
          m.outcomeKind === "in_progress" || m.phase !== "completed"
      );
      if (active?.matchId) return active.matchId as string;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("No active match found in history");
}

/**
 * Story 1 — free Blitz human matchmaking pairs two users.
 * Full 8-round completion is covered by engine replay tests.
 */
test.describe("Price War free Blitz vs human", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("alice and bob match into the same unrated PvP game", async ({ browser }) => {
    const alice = await joinQueue(
      browser,
      process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev",
      process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!"
    );

    const bob = await joinQueue(
      browser,
      process.env.PRICEWAR_E2E_BOB_EMAIL ?? "bob+test@adamsaxion.dev",
      process.env.PRICEWAR_E2E_BOB_PASSWORD ?? "TestBob123!"
    );

    const matchId =
      alice.matchId ?? bob.matchId ?? (await findActiveMatch(alice.request));
    expect(matchId).toBeTruthy();

    if (!bob.matchId) {
      const bobMatchId = await findActiveMatch(bob.request);
      expect(bobMatchId).toBe(matchId);
    }

    for (const req of [alice.request, bob.request]) {
      const summaryRes = await req.get(`/api/pricewar/match/${matchId}/summary`);
      expect(summaryRes.ok()).toBe(true);
      const summary = await summaryRes.json();
      expect(summary.isRated).toBe(false);
    }
  });
});
