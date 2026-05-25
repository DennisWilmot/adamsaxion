import { describe, expect, it } from "vitest";
import {
  SPREADSHEET_COSTS,
  hiringCost,
  severanceCost,
  maintenanceCost,
  performanceBonusTotal,
  inventoryBufferCost,
  estimateActionCost,
  COSTS,
} from "../src/simulation/action-costs";
import { COFFEE_SHOP_SIM } from "../src/simulation/config";
import {
  createInitialMatchState,
  resolveTurn,
  getSim,
  COFFEE_SHOP_SCENARIO,
} from "../src";

describe("spreadsheet cost alignment", () => {
  it("matches Actions Catalog fixed costs", () => {
    expect(SPREADSHEET_COSTS.menuExpand).toBe(50);
    expect(SPREADSHEET_COSTS.bundleSetup).toBe(30);
    expect(SPREADSHEET_COSTS.exclusiveSupplier).toBe(100);
    expect(SPREADSHEET_COSTS.loyaltyLaunch).toBe(40);
    expect(SPREADSHEET_COSTS.scout).toBe(25);
    expect(SPREADSHEET_COSTS.insurancePerRound).toBe(15);
  });

  it("H01 hiring cost = 1.5 × wage", () => {
    expect(hiringCost(15)).toBe(23);
    expect(hiringCost(20)).toBe(30);
  });

  it("O06 maintenance = $20 × equipment level", () => {
    expect(maintenanceCost(2)).toBe(40);
    expect(maintenanceCost(3)).toBe(60);
  });

  it("H09 bonus = $15 × staff", () => {
    expect(performanceBonusTotal(3)).toBe(45);
  });

  it("training skill gain uses 0.005 per dollar", () => {
    expect(COSTS.trainingSkillPerDollar).toBe(0.005);
  });

  it("hire worker spends spreadsheet hiring cost", () => {
    const state = createInitialMatchState({
      matchId: "cost-match" as never,
      playModeId: "blitz",
      rngSeed: "cost-seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    const { nextState, adminTrace } = resolveTurn({
      state,
      submittedA: [
        {
          moveId: "hr.h01",
          input: { units: 1 },
          draftedAt: new Date(0).toISOString(),
        },
      ],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });
    const expected = hiringCost(COFFEE_SHOP_SIM.startingWagePerWorker);
    const hireEvent = adminTrace.find(
      (e) => e.type === "move_resolved" && e.moveId === "hr.h01"
    );
    expect(hireEvent?.deltas.cash).toBe(-expected);
    expect(nextState.playersPrivate.A.staffCount).toBe(4);
  });

  it("restructure spends $30", () => {
    const state = createInitialMatchState({
      matchId: "restructure-match" as never,
      playModeId: "blitz",
      rngSeed: "restructure-seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state.playersPrivate.A.staffCount = 3;
    state.playersPrivate.A.cash = 500;
    const { adminTrace } = resolveTurn({
      state,
      submittedA: [
        { moveId: "hr.h08", input: { enabled: true }, draftedAt: new Date(0).toISOString() },
      ],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });
    const event = adminTrace.find((e) => e.type === "move_resolved" && e.moveId === "hr.h08");
    expect(event?.deltas.cash).toBe(-SPREADSHEET_COSTS.restructure);
  });

  it("estimateActionCost matches handler for key moves", () => {
    expect(estimateActionCost("sales.s07", {})).toBe(30);
    expect(estimateActionCost("procurement.p03", {})).toBe(inventoryBufferCost(2));
    expect(estimateActionCost("operations.o06", {}, { equipmentLevel: 2 })).toBe(40);
    expect(estimateActionCost("hr.h01", { units: 1 }, { wagePerWorker: 15 })).toBe(23);
  });
});
