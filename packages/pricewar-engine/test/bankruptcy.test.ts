import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  resolveTurn,
  COFFEE_SHOP_SCENARIO,
} from "../src";

describe("bankruptcy", () => {
  it("ends the match when cash stays at or below zero for 2 rounds", () => {
    let state = createInitialMatchState({
      matchId: "bankruptcy-test" as never,
      playModeId: "blitz",
      rngSeed: "seed-bk",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    state.phase = "decide";
    state.playersPrivate.A.cash = 50;
    state.playersPrivate.B.cash = 5000;

    const drain = (round: number) => {
      state.market.currentRound = round;
      return resolveTurn({
        state,
        submittedA: [],
        submittedB: [],
        scenario: COFFEE_SHOP_SCENARIO,
      });
    };

    state = drain(1).nextState;
    expect(state.phase).toBe("decide");
    expect(state.outcome.kind).toBe("in_progress");

    state = drain(2).nextState;
    expect(state.phase).toBe("completed");
    expect(state.outcome.kind).toBe("win");
    if (state.outcome.kind === "win") {
      expect(state.outcome.reason).toBe("bankruptcy");
      expect(state.outcome.winner).toBe("B");
    }
  });
});
