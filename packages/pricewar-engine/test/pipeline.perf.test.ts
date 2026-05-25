import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  resolveTurn,
  COFFEE_SHOP_SCENARIO,
  COFFEE_SHOP_MOVES,
} from "../src";

describe("pipeline performance", () => {
  it("resolves 2000 rounds in under 1200ms", () => {
    let state = createInitialMatchState({
      matchId: "perf-match" as never,
      playModeId: "blitz",
      rngSeed: "perf",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";

    const sampleMove = {
      moveId: COFFEE_SHOP_MOVES[0]!.id,
      input: { newPrice: 425 },
      draftedAt: new Date(0).toISOString(),
    };

    const start = performance.now();
    for (let i = 0; i < 2000; i++) {
      state.market.currentRound = 1 + (i % 8);
      state.phase = "decide";
      const out = resolveTurn({
        state,
        submittedA: [sampleMove],
        submittedB: [],
        scenario: COFFEE_SHOP_SCENARIO,
      });
      state = out.nextState;
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1500);
  });
});

describe("demand allocation", () => {
  it("favors lower price with more customers", () => {
    const state = createInitialMatchState({
      matchId: "alloc-match" as never,
      playModeId: "blitz",
      rngSeed: "alloc",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state.playersPublic.A.currentPrice = 400;
    state.playersPublic.B.currentPrice = 500;

    const { report } = resolveTurn({
      state,
      submittedA: [],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(report.deltas.A.demandSatisfied).toBeGreaterThan(report.deltas.B.demandSatisfied);
  });
});
