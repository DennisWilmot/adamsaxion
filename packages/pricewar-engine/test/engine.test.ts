import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  resolveTurn,
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
    expect(first.nextState.market.currentRound).toBe(2);
  });
});

describe("toPlayerView", () => {
  it("never exposes opponent private state", () => {
    const state = createInitialMatchState({
      matchId: "test-match-2" as never,
      playModeId: "blitz",
      rngSeed: "seed-2",
      playerAName: "Alice",
      playerBName: "Bob",
    });

    const view = toPlayerView(state, "A");
    expect(view.opponent).not.toHaveProperty("cash");
    expect(view.opponent).not.toHaveProperty("inventory");
    expect(view.opponent).not.toHaveProperty("morale");
    expect(view.me.cash).toBe(state.playersPrivate.A.cash);
  });
});
