import { describe, expect, it } from "vitest";
import type { AdminTraceEvent, MoveId, SubmittedMove } from "@adamsaxion/pricewar-types";
import {
  createInitialMatchState,
  resolveTurn,
  getSim,
  writeSim,
  COFFEE_SHOP_SCENARIO,
} from "../src";

function baseState() {
  const state = createInitialMatchState({
    matchId: "golden-match" as never,
    playModeId: "blitz",
    rngSeed: "golden-seed",
    playerAName: "Alice",
    playerBName: "Bob",
  });
  state.phase = "decide";
  return state;
}

function move(id: string, input: unknown): SubmittedMove {
  return { moveId: id as MoveId, input, draftedAt: new Date(0).toISOString() };
}

function patchSim(
  state: ReturnType<typeof baseState>,
  slot: "A" | "B",
  patch: Partial<ReturnType<typeof getSim>>
) {
  writeSim(state.playersPrivate[slot], { ...getSim(state, slot), ...patch });
}

function resolveA(state: ReturnType<typeof baseState>, submittedA: SubmittedMove[]) {
  return resolveTurn({
    state,
    submittedA,
    submittedB: [],
    scenario: COFFEE_SHOP_SCENARIO,
  });
}

function expectMoveResolved(trace: AdminTraceEvent[], moveId: string) {
  expect(trace.some((e) => e.type === "move_resolved" && e.moveId === moveId)).toBe(true);
}

describe("golden action outcomes", () => {
  describe("sales", () => {
    it("sales.s01 sets public price", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("sales.s01", { newPrice: 425 })]);
      expect(nextState.playersPublic.A.currentPrice).toBe(425);
      expectMoveResolved(adminTrace, "sales.s01");
    });

    it("sales.s02 expands menu breadth", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("sales.s02", {})]);
      expect(getSim(nextState, "A").menuBreadth).toBe(3);
      expectMoveResolved(adminTrace, "sales.s02");
    });

    it("sales.s03 simplifies menu after expansion", () => {
      const state = baseState();
      patchSim(state, "A", { menuBreadth: 3 });
      const { nextState, adminTrace } = resolveA(state, [move("sales.s03", {})]);
      expect(getSim(nextState, "A").menuBreadth).toBe(2);
      expectMoveResolved(adminTrace, "sales.s03");
    });

    it("sales.s04 activates flash sale round", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("sales.s04", { enabled: true })]);
      expect(getSim(nextState, "A").flashSaleActiveRound).toBe(1);
      expectMoveResolved(adminTrace, "sales.s04");
    });

    it("sales.s05 commits to price match", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("sales.s05", { enabled: true })]);
      expect(getSim(nextState, "A").priceMatchRoundsRemaining).toBe(2);
      expectMoveResolved(adminTrace, "sales.s05");
    });

    it("sales.s06 enables premium positioning when reputation is high enough", () => {
      const state = baseState();
      state.playersPrivate.A.reputation = 65;
      const { nextState, adminTrace } = resolveA(state, [move("sales.s06", {})]);
      expect(getSim(nextState, "A").premiumPositioning).toBe(true);
      expectMoveResolved(adminTrace, "sales.s06");
    });

    it("sales.s07 launches bundle offer", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("sales.s07", {})]);
      // Handler sets 3; finance step ticks down once at end of round.
      expect(getSim(nextState, "A").bundleRoundsRemaining).toBe(2);
      expectMoveResolved(adminTrace, "sales.s07");
    });
  });

  describe("procurement", () => {
    it("procurement.p01 raises supplier tier", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("procurement.p01", { enabled: true })]);
      expect(getSim(nextState, "A").supplierTier).toBeGreaterThan(2);
      expectMoveResolved(adminTrace, "procurement.p01");
    });

    it("procurement.p03 increases inventory buffer", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("procurement.p03", {})]);
      expect(getSim(nextState, "A").inventoryBuffer).toBe(2);
      expectMoveResolved(adminTrace, "procurement.p03");
    });

    it("procurement.p05 locks exclusive supplier deal", () => {
      const state = baseState();
      patchSim(state, "A", { supplierTier: 3 });
      const { nextState, adminTrace } = resolveA(state, [move("procurement.p05", { enabled: true })]);
      const sim = getSim(nextState, "A");
      expect(sim.exclusiveSupplierDeal).toBe(true);
      expect(sim.supplierTier).toBeGreaterThanOrEqual(4);
      expectMoveResolved(adminTrace, "procurement.p05");
    });
  });

  describe("operations", () => {
    it("operations.o01 sets speed deployment mode", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("operations.o01", {})]);
      expect(getSim(nextState, "A").deploymentMode).toBe("speed");
      expectMoveResolved(adminTrace, "operations.o01");
    });

    it("operations.o07 starts R&D project", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("operations.o07", { choice: "quality" })]);
      expect(getSim(nextState, "A").rdProjectRoundsRemaining).toBe(4);
      expectMoveResolved(adminTrace, "operations.o07");
    });

    it("operations.o08 reduces morale when eligible", () => {
      const state = baseState();
      state.playersPrivate.A.morale = 70;
      const { nextState, adminTrace } = resolveA(state, [move("operations.o08", { enabled: true })]);
      expect(nextState.playersPrivate.A.morale).toBeLessThan(70);
      expectMoveResolved(adminTrace, "operations.o08");
    });
  });

  describe("hr", () => {
    it("hr.h01 increases staff when affordable", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("hr.h01", { units: 1 })]);
      expect(nextState.playersPrivate.A.staffCount).toBe(4);
      expectMoveResolved(adminTrace, "hr.h01");
    });

    it("hr.h03 raises wages", () => {
      const before = getSim(baseState(), "A").wagePerWorker;
      const { nextState, adminTrace } = resolveA(baseState(), [move("hr.h03", { amount: 2 })]);
      expect(getSim(nextState, "A").wagePerWorker).toBe(before + 2);
      expectMoveResolved(adminTrace, "hr.h03");
    });

    it("hr.h07 initiates poach attempt with cooldown", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("hr.h07", { enabled: true })]);
      expect(getSim(nextState, "A").cooldownUntilRound["hr.h07"]).toBe(4);
      expectMoveResolved(adminTrace, "hr.h07");
    });

    it("hr.h09 pays performance bonus and lifts morale", () => {
      const state = baseState();
      state.playersPrivate.A.morale = 60;
      const { nextState, adminTrace } = resolveA(state, [move("hr.h09", {})]);
      expect(nextState.playersPrivate.A.morale).toBeGreaterThan(60);
      expectMoveResolved(adminTrace, "hr.h09");
    });
  });

  describe("marketing", () => {
    it("marketing.m01 sets marketing budget and spends in finance", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("marketing.m01", { amount: 40 })]);
      expect(getSim(nextState, "A").marketingBudgetPerRound).toBe(40);
      expectMoveResolved(adminTrace, "marketing.m01");
    });

    it("marketing.m02 activates loyalty program", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("marketing.m02", { enabled: true })]);
      expect(getSim(nextState, "A").loyaltyProgramActive).toBe(true);
      expectMoveResolved(adminTrace, "marketing.m02");
    });

    it("marketing.m04 runs targeted campaign", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [
        move("marketing.m04", { choice: "value_seekers" }),
      ]);
      const sim = getSim(nextState, "A");
      expect(sim.targetedCampaignRounds).toBe(2);
      expect(sim.targetedCampaignSegment).toBe("value_seekers");
      expectMoveResolved(adminTrace, "marketing.m04");
    });
  });

  describe("finance", () => {
    it("finance.f01 increases cash and debt", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("finance.f01", { units: 2 })]);
      const sim = getSim(nextState, "A");
      expect(sim.debt).toBeGreaterThan(0);
      expect(nextState.playersPrivate.A.cash).toBeGreaterThan(500);
      expectMoveResolved(adminTrace, "finance.f01");
    });

    it("finance.f03 enables cash reserve mode", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("finance.f03", {})]);
      expect(getSim(nextState, "A").cashReserveMode).toBe(true);
      expectMoveResolved(adminTrace, "finance.f03");
    });

    it("finance.f05 purchases insurance", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("finance.f05", {})]);
      expect(getSim(nextState, "A").insuranceActive).toBe(true);
      expectMoveResolved(adminTrace, "finance.f05");
    });

    it("finance.f07 adds opponent intel entry", () => {
      const { nextState, adminTrace } = resolveA(baseState(), [move("finance.f07", { choice: "staffCount" })]);
      expect(getSim(nextState, "A").opponentIntel.length).toBeGreaterThan(0);
      expectMoveResolved(adminTrace, "finance.f07");
    });
  });

  it("rejects hard conflicts at validate time", () => {
    expect(() =>
      resolveA(baseState(), [move("hr.h01", { units: 1 }), move("hr.h02", { units: 1 })])
    ).toThrow();
  });
});
