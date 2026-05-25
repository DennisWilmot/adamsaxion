import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  resolveTurn,
  advanceFromReportToDecide,
  toPlayerView,
  COFFEE_SHOP_SCENARIO,
} from "../src";

describe("resolveTurn", () => {
  it("resolves a round deterministically", () => {
    const state = createInitialMatchState({
      matchId: "test-match-1" as never,
      playModeId: "blitz",
      rngSeed: "seed-1",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    state.phase = "decide";

    const input = {
      state,
      submittedA: [],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    };

    const first = resolveTurn(input);
    const second = resolveTurn(input);

    expect(first).toEqual(second);
    expect(first.nextState.phase).toBe("report");
    expect(first.nextState.market.currentRound).toBe(1);
    expect(first.nextState.market.lastResolvedRound).toBe(1);

    const advanced = advanceFromReportToDecide(first.nextState);
    expect(advanced.phase).toBe("decide");
    expect(advanced.market.currentRound).toBe(2);
  });
});

describe("toPlayerView", () => {
  const sensitivePrivateKeys = [
    "cash",
    "inventory",
    "morale",
    "staffCount",
    "reputation",
    "activePolicies",
    "activeConditions",
    "wagePerWorker",
  ] as const;

  function expectNoPrivateLeak(view: ReturnType<typeof toPlayerView>, opponentPrivate: Record<string, unknown>) {
    for (const key of sensitivePrivateKeys) {
      expect(view.opponent).not.toHaveProperty(key);
      expect(opponentPrivate[key]).toBeDefined();
    }
  }

  it("never exposes opponent private state", () => {
    const state = createInitialMatchState({
      matchId: "test-match-2" as never,
      playModeId: "blitz",
      rngSeed: "seed-2",
      playerAName: "Alice",
      playerBName: "Bob",
    });

    const view = toPlayerView(state, "A");
    expectNoPrivateLeak(view, state.playersPrivate.B as Record<string, unknown>);
    expect(view.me.cash).toBe(state.playersPrivate.A.cash);
  });

  it("includes opponent public signals", () => {
    const state = createInitialMatchState({
      matchId: "test-match-3" as never,
      playModeId: "blitz",
      rngSeed: "seed-3",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    state.playersPublic.B.currentPrice = 425;

    const view = toPlayerView(state, "A");
    expect(view.opponent.currentPrice).toBe(425);
    expect(view.opponent.displayName).toBe("Bob");
  });
});
