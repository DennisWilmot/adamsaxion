import type { APIRequestContext, Page } from "@playwright/test";
import { PLAY_HUB, priceWarPaths } from "../../../src/lib/games/routes";

export async function loginAs(
  page: Page,
  email: string,
  password: string,
  next = PLAY_HUB
) {
  await page.goto(`/auth?next=${encodeURIComponent(next)}`);
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(next);
}

export async function startVsBotMatch(page: Page) {
  await page.goto(priceWarPaths.lobby);
  await page.getByRole("button", { name: "Play vs bot" }).first().click();
  await page.waitForURL(/\/play\/price-war\/match\/[^/]+\/decide/);
  const matchId = page.url().match(/\/play\/price-war\/match\/([^/]+)\/decide/)?.[1];
  return matchId!;
}

export async function startE2eBlitzMatch(request: APIRequestContext) {
  const res = await request.post("/api/pricewar/match/vs-bot", {
    data: {
      scenarioId: "coffee-shop",
      playModeId: "blitz-e2e",
      botPersonalityId: "bot.budget",
    },
  });
  if (!res.ok()) {
    throw new Error(`Failed to start E2E match: ${await res.text()}`);
  }
  const data = await res.json();
  return data.matchId as string;
}

export async function expireClock(request: APIRequestContext, matchId: string) {
  const res = await request.post(`/api/pricewar/e2e/match/${matchId}/expire-clock`);
  if (!res.ok()) {
    throw new Error(`expire-clock failed: ${await res.text()}`);
  }
  return res.json() as Promise<{ phase: string }>;
}

export async function waitForRound(
  request: APIRequestContext,
  matchId: string,
  round: number,
  attempts = 20
) {
  for (let i = 0; i < attempts; i++) {
    const res = await request.get(`/api/pricewar/match/${matchId}/view`);
    if (res.ok()) {
      const view = await res.json();
      if (view.market?.currentRound === round && view.phase === "decide") {
        return view;
      }
      if (view.phase === "completed") return view;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for round ${round}`);
}

export async function joinQueue(
  page: Page,
  scenarioId: string,
  playModeId: string
) {
  const res = await page.request.post("/api/pricewar/matchmaking/queue", {
    data: { scenarioId, playModeId },
  });
  if (!res.ok()) {
    throw new Error(`Failed to join queue: ${await res.text()}`);
  }
  return res.json() as Promise<{ matchId: string | null; matched: boolean }>;
}

export async function findActiveMatch(
  request: APIRequestContext,
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

export async function forfeitMatch(request: APIRequestContext, matchId: string) {
  const res = await request.post(`/api/pricewar/match/${matchId}/forfeit`);
  if (!res.ok()) {
    throw new Error(`Forfeit failed: ${await res.text()}`);
  }
}

export async function forceAbandon(request: APIRequestContext, matchId: string) {
  const res = await request.post(`/api/pricewar/e2e/match/${matchId}/force-abandon`);
  if (!res.ok()) {
    throw new Error(`force-abandon failed: ${await res.text()}`);
  }
  return res.json() as Promise<{ phase: string }>;
}

export async function waitForMatchPhase(
  request: APIRequestContext,
  matchId: string,
  phase: string,
  attempts = 30
) {
  for (let i = 0; i < attempts; i++) {
    const res = await request.get(`/api/pricewar/match/${matchId}/view`);
    if (res.ok()) {
      const view = await res.json();
      if (view.phase === phase) return view;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for phase ${phase}`);
}
