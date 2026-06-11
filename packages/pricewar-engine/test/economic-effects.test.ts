import { describe, expect, it } from "vitest";
import type { MoveId, SubmittedMove } from "@adamsaxion/pricewar-types";
import {
  advanceFromReportToDecide,
  COFFEE_SHOP_SCENARIO,
  createInitialMatchState,
  getSim,
  resolveTurn,
  validateMoves,
  writeSim,
} from "../src";

function baseState(matchId = "economic-effects") {
  const state = createInitialMatchState({
    matchId: matchId as never,
    playModeId: "blitz",
    rngSeed: "economic-seed",
    playerAName: "Alice",
    playerBName: "Bob",
  });
  state.phase = "decide";
  return state;
}

function move(id: string, input: unknown = {}): SubmittedMove {
  return { moveId: id as MoveId, input, draftedAt: new Date(0).toISOString() };
}

describe("economic action effects", () => {
  it("flash sale discounts this round and restores price before next decide", () => {
    const state = baseState("flash-sale-restore");
    const before = state.playersPublic.A.currentPrice;

    const { nextState } = resolveTurn({
      state,
      submittedA: [move("sales.s04", { enabled: true })],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(nextState.playersPublic.A.currentPrice).toBe(Math.round(before * 0.6));
    const advanced = advanceFromReportToDecide(nextState);
    expect(advanced.playersPublic.A.currentPrice).toBe(before);
  });

  it("counter-marketing reduces the rival marketing demand boost", () => {
    const withoutCounter = baseState("counter-marketing");
    const withCounter = baseState("counter-marketing");

    for (const state of [withoutCounter, withCounter]) {
      state.playersPrivate.A.staffCount = 10;
      state.playersPrivate.B.staffCount = 10;
      writeSim(state.playersPrivate.B, {
        ...getSim(state, "B"),
        marketingBudgetPerRound: 160,
      });
    }

    const baseline = resolveTurn({
      state: withoutCounter,
      submittedA: [],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });
    const countered = resolveTurn({
      state: withCounter,
      submittedA: [move("marketing.m05", { enabled: true })],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(countered.report.deltas.B.demandSatisfied).toBeLessThan(
      baseline.report.deltas.B.demandSatisfied
    );
  });

  it("cash reserve mode blocks non-essential spending", () => {
    const state = baseState("cash-reserve");
    writeSim(state.playersPrivate.A, { ...getSim(state, "A"), cashReserveMode: true });

    expect(
      validateMoves(
        state,
        "A",
        [move("marketing.m06", { enabled: true })],
        COFFEE_SHOP_SCENARIO
      )?.code
    ).toBe("MOVE_NOT_ALLOWED");
    expect(validateMoves(state, "A", [move("finance.f04")], COFFEE_SHOP_SCENARIO)).toBeNull();
  });

  it("secured profit counts in final scoring", () => {
    const state = baseState("secured-profit");
    state.market.currentRound = COFFEE_SHOP_SCENARIO.totalRounds;
    state.playersPrivate.A.cash = 100;
    state.playersPrivate.B.cash = 350;
    writeSim(state.playersPrivate.A, { ...getSim(state, "A"), securedProfit: 300 });

    const { nextState } = resolveTurn({
      state,
      submittedA: [],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(nextState.outcome).toEqual({
      kind: "win",
      winner: "A",
      reason: "victory_points",
    });
  });

  it("exclusive supplier caps a simultaneous rival supplier upgrade", () => {
    const state = baseState("supplier-cap");
    writeSim(state.playersPrivate.A, { ...getSim(state, "A"), supplierTier: 3 });
    writeSim(state.playersPrivate.B, { ...getSim(state, "B"), supplierTier: 3 });

    const { nextState } = resolveTurn({
      state,
      submittedA: [move("procurement.p05", { enabled: true })],
      submittedB: [move("procurement.p01", { enabled: true })],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(getSim(nextState, "B").supplierTier).toBe(3);
    expect(getSim(nextState, "B").opponentSupplierCap).toBe(3);
  });

  it("reports real morale deltas", () => {
    const state = baseState("report-deltas");

    const { report } = resolveTurn({
      state,
      submittedA: [move("operations.o08", { enabled: true })],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(report.deltas.A.moraleDelta).toBeLessThan(0);
  });
});
