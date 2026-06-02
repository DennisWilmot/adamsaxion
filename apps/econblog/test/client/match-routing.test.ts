import assert from "node:assert/strict";
import { test } from "node:test";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { shouldRedirectToPhasePath, getMatchEndPath } from "@/client/pricewar/match-routing";
import { priceWarPaths } from "@/lib/games/routes";

function view(overrides: Partial<PlayerView> & Pick<PlayerView, "phase">): PlayerView {
  return {
    matchId: "m1",
    scenarioId: "coffee-shop",
    playModeId: "blitz",
    phase: overrides.phase,
    me: {
      slot: "A",
      cash: 500,
      currentPrice: 400,
    },
    opponent: {
      displayName: "Riley",
      currentPrice: 400,
      isBot: true,
    },
    opponentHasLocked: false,
    meHasLocked: false,
    market: {
      currentRound: 2,
      totalRounds: 8,
      lastResolvedRound: 1,
      ...(overrides.market ?? {}),
    },
    myClockMs: 300000,
    myClockTickingSince: null,
    outcome: { kind: "ongoing" },
    ...overrides,
  } as PlayerView;
}

test("keeps review sub-route during decide phase", () => {
  const pathname = "/play/price-war/match/m1/review";
  assert.equal(shouldRedirectToPhasePath(pathname, view({ phase: "decide" })), false);
});

test("redirects review sub-route after lock-in", () => {
  const pathname = "/play/price-war/match/m1/review";
  assert.equal(
    shouldRedirectToPhasePath(pathname, view({ phase: "decide", meHasLocked: true })),
    true
  );
});

test("keeps report sub-route for the active report round", () => {
  const pathname = "/play/price-war/match/m1/report/2";
  assert.equal(
    shouldRedirectToPhasePath(
      pathname,
      view({
        phase: "report",
        market: { currentRound: 2, totalRounds: 8, lastResolvedRound: 2 },
      })
    ),
    false
  );
});

test("keeps report sub-route while reading, even if match already advanced", () => {
  const pathname = "/play/price-war/match/m1/report/2";
  assert.equal(
    shouldRedirectToPhasePath(
      pathname,
      view({
        phase: "decide",
        market: { currentRound: 3, totalRounds: 8, lastResolvedRound: 2 },
      })
    ),
    false
  );
});

test("redirects stale report sub-route once the round advances", () => {
  const pathname = "/play/price-war/match/m1/report/1";
  assert.equal(
    shouldRedirectToPhasePath(
      pathname,
      view({
        phase: "report",
        market: { currentRound: 2, totalRounds: 8, lastResolvedRound: 2 },
      })
    ),
    true
  );
});

test("redirects match root to briefing when phase is briefing", () => {
  const pathname = "/play/price-war/match/m1";
  assert.equal(
    shouldRedirectToPhasePath(pathname, view({ phase: "briefing", playModeId: "blitz" })),
    true
  );
});

test("keeps briefing sub-route during briefing phase", () => {
  const pathname = "/play/price-war/match/m1/briefing";
  assert.equal(
    shouldRedirectToPhasePath(pathname, view({ phase: "briefing", playModeId: "blitz" })),
    false
  );
});

test("redirects match root to waiting once locked in", () => {
  const pathname = "/play/price-war/match/m1";
  assert.equal(
    shouldRedirectToPhasePath(pathname, view({ phase: "decide", meHasLocked: true })),
    true
  );
});

test("keeps terminal route while completed view is still loading", () => {
  const stale = view({ phase: "decide" });
  const pathname = "/play/price-war/match/m1/postmatch";
  assert.equal(shouldRedirectToPhasePath(pathname, stale), false);
});

test("keeps postmatch sub-route during completed phase", () => {
  const pathname = "/play/price-war/match/m1/postmatch";
  assert.equal(shouldRedirectToPhasePath(pathname, view({ phase: "completed" })), false);
});

test("redirects in-session route to terminal when phase is completed", () => {
  const pathname = "/play/price-war/match/m1/review";
  assert.equal(shouldRedirectToPhasePath(pathname, view({ phase: "completed" })), true);
});

test("timeout loss routes to postmatch, not abandoned", () => {
  assert.equal(
    getMatchEndPath(
      "m1",
      view({
        phase: "completed",
        outcome: { kind: "win", winner: "B", reason: "forfeit_on_timeout" },
      })
    ),
    priceWarPaths.match.postmatch("m1")
  );
});

test("abandonment win routes to abandoned", () => {
  assert.equal(
    getMatchEndPath(
      "m1",
      view({
        phase: "completed",
        outcome: { kind: "win", winner: "A", reason: "forfeit_on_abandonment" },
      })
    ),
    priceWarPaths.match.abandoned("m1")
  );
});

test("timeout win routes to postmatch", () => {
  assert.equal(
    getMatchEndPath(
      "m1",
      view({
        phase: "completed",
        outcome: { kind: "win", winner: "A", reason: "forfeit_on_timeout" },
      })
    ),
    priceWarPaths.match.postmatch("m1")
  );
});
