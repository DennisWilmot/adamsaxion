import type { ActionHandler, ActionHandlerContext } from "./types";
import type { PlayerSlot } from "@adamsaxion/pricewar-types";
import {
  getSim,
  writeSim,
  setMorale,
  setRep,
  moraleUnit,
  repUnit,
  COSTS,
  hiringCost,
  severanceCost,
  maintenanceCost,
  performanceBonusTotal,
  inventoryBufferCost,
  mergeSimulationDefaults,
  type SimulationFields,
  type DeploymentMode,
} from "../../simulation/player-sim";
import { scratch } from "./scratch-access";

// ── input readers ────────────────────────────────────────────────────────────

function readAmount(input: unknown, fallback = 0): number {
  const v = (input as { amount?: number })?.amount;
  return typeof v === "number" && v >= 0 ? v : fallback;
}

function readNewPrice(input: unknown): number | null {
  const v = (input as { newPrice?: number })?.newPrice;
  return typeof v === "number" ? v : null;
}

function readUnits(input: unknown, fallback = 1): number {
  const v = (input as { units?: number })?.units;
  return typeof v === "number" && v > 0 ? Math.floor(v) : fallback;
}

function readChoice(input: unknown, fallback: string): string {
  const v = (input as { choice?: string })?.choice;
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function readEnabled(input: unknown): boolean {
  const v = (input as { enabled?: boolean })?.enabled;
  return v === true;
}

// ── context helpers ──────────────────────────────────────────────────────────

function other(slot: PlayerSlot): PlayerSlot {
  return slot === "A" ? "B" : "A";
}

function spend(ctx: ActionHandlerContext, slot: PlayerSlot, amount: number): boolean {
  if (amount <= 0) return true;
  const priv = ctx.state.playersPrivate[slot];
  if (priv.cash < amount) return false;
  priv.cash -= amount;
  return true;
}

function pushResolved(
  ctx: ActionHandlerContext,
  slot: PlayerSlot,
  moveId: string,
  deltas: Record<string, number>
): void {
  ctx.events.push({ t: ctx.nextEventT(), type: "move_resolved", player: slot, moveId, deltas });
}

function notePublic(ctx: ActionHandlerContext, slot: PlayerSlot, text: string): void {
  scratch().publicActions[slot].push(text);
}

function notePrivate(ctx: ActionHandlerContext, slot: PlayerSlot, text: string): void {
  scratch().privateActionNotes[slot].push(text);
}

function onCooldown(sim: SimulationFields, key: string, round: number): boolean {
  return (sim.cooldownUntilRound[key] ?? 0) > round;
}

function setCooldown(sim: SimulationFields, key: string, _round: number, untilRound: number): void {
  sim.cooldownUntilRound[key] = untilRound;
}

function oncePerMatch(sim: SimulationFields, key: string): boolean {
  return sim.usedOncePerMatch[key] === true;
}

function markOnce(sim: SimulationFields, key: string): void {
  sim.usedOncePerMatch[key] = true;
}

function withSim(ctx: ActionHandlerContext, fn: (sim: SimulationFields) => Record<string, number>): void {
  const priv = ctx.state.playersPrivate[ctx.slot];
  const sim = getSim(ctx.state, ctx.slot);
  const deltas = fn(sim);
  writeSim(priv, sim);
  pushResolved(ctx, ctx.slot, ctx.move.moveId, deltas);
}

function avgMarketPrice(ctx: ActionHandlerContext): number {
  const a = ctx.actionBaseline.playersPublic.A.currentPrice;
  const b = ctx.actionBaseline.playersPublic.B.currentPrice;
  return Math.max(1, (a + b) / 2);
}

// ── sales ────────────────────────────────────────────────────────────────────

const salesS01: ActionHandler = (ctx) => {
  const price = readNewPrice(ctx.move.input);
  if (price == null) {
    pushResolved(ctx, ctx.slot, ctx.move.moveId, {});
    return;
  }
  const prev = ctx.state.playersPublic[ctx.slot].currentPrice;
  ctx.state.playersPublic[ctx.slot].currentPrice = price;
  pushResolved(ctx, ctx.slot, ctx.move.moveId, { currentPrice: price - prev });
};

const salesS02: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.menuBreadth >= 5 || onCooldown(sim, "sales.s02", ctx.round)) return {};
    const cost = COSTS.menuExpand;
    if (!spend(ctx, ctx.slot, cost)) return {};
    if (sim.avgSkill < sim.menuBreadth * 0.2) {
      sim.productQuality = Math.max(0.1, sim.productQuality - 0.05);
      notePrivate(ctx, ctx.slot, "Menu complexity penalty applied.");
    }
    sim.menuBreadth += 1;
    setCooldown(sim, "sales.s02", ctx.round, ctx.round + 1);
    return { menuBreadth: 1, cash: -cost };
  });
};

const salesS03: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.menuBreadth <= 1) return {};
    sim.menuBreadth -= 1;
    sim.productQuality = Math.min(1, sim.productQuality + 0.03);
    return { menuBreadth: -1 };
  });
};

const salesS04: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (onCooldown(sim, "sales.s04", ctx.round) || sim.flashSaleActiveRound === ctx.round - 1) return {};
    if (ctx.state.playersPrivate[ctx.slot].cash <= 0) return {};
    const pub = ctx.state.playersPublic[ctx.slot];
    const prev = pub.currentPrice;
    pub.currentPrice = Math.round(prev * 0.6);
    sim.flashSaleActiveRound = ctx.round;
    setCooldown(sim, "sales.s04", ctx.round, ctx.round + COSTS.flashSaleCooldownRounds);
    scratch().demandBoost[ctx.slot] += 0.25;
    notePublic(ctx, ctx.slot, "Flash sale: prices cut 40% this round.");
    return { currentPrice: pub.currentPrice - prev, demandBoost: 0.25 };
  });
};

const salesS05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (onCooldown(sim, "sales.s05", ctx.round)) return {};
    sim.priceMatchRoundsRemaining = 2;
    setCooldown(sim, "sales.s05", ctx.round, ctx.round + 2);
    notePublic(ctx, ctx.slot, "Price match guarantee announced.");
    return { priceMatchRoundsRemaining: 2 };
  });
};

const salesS06: ActionHandler = (ctx) => {
  const priv = ctx.state.playersPrivate[ctx.slot];
  if (repUnit(priv.reputation) < 0.6) {
    pushResolved(ctx, ctx.slot, ctx.move.moveId, {});
    return;
  }
  withSim(ctx, (sim) => {
    sim.premiumPositioning = true;
    const floor = Math.round(avgMarketPrice(ctx) * 1.5);
    const pub = ctx.state.playersPublic[ctx.slot];
    if (pub.currentPrice < floor) pub.currentPrice = floor;
    return { premiumPositioning: 1, priceFloor: floor };
  });
};

const salesS07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.menuBreadth < 2 || !spend(ctx, ctx.slot, COSTS.bundleSetup)) return {};
    sim.bundleRoundsRemaining = 3;
    scratch().revenueMultiplier[ctx.slot] *= 0.85;
    return { bundleRoundsRemaining: 3, cash: -COSTS.bundleSetup };
  });
};

const salesS08: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    sim.surgePricingActive = true;
    return { surgePricingActive: 1 };
  });
};

// ── procurement ──────────────────────────────────────────────────────────────

const procurementP01: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.supplierTier >= 5) return {};
    sim.supplierTier += 1;
    sim.roundsAtSupplierTier = 0;
    sim.productQuality = Math.min(1, sim.productQuality + 0.04);
    scratch().inputCostMultiplier[ctx.slot] *= 1.08;
    return { supplierTier: 1, productQuality: 0.04 };
  });
};

const procurementP02: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.supplierTier <= 1) return {};
    sim.supplierTier -= 1;
    sim.roundsAtSupplierTier = 0;
    sim.productQuality = Math.max(0.1, sim.productQuality - 0.04);
    scratch().inputCostMultiplier[ctx.slot] *= 0.92;
    return { supplierTier: -1, productQuality: -0.04 };
  });
};

const procurementP03: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const cost = inventoryBufferCost(2);
    if (!spend(ctx, ctx.slot, cost)) return {};
    sim.inventoryBuffer += 2;
    return { inventoryBuffer: 2, cash: -cost };
  });
};

const procurementP04: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.inventoryBuffer < 2) return {};
    sim.inventoryBuffer -= 2;
    const refund = inventoryBufferCost(2);
    ctx.state.playersPrivate[ctx.slot].cash += refund;
    return { inventoryBuffer: -2, cash: refund };
  });
};

const procurementP05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (oncePerMatch(sim, "procurement.p05") || sim.supplierTier < 3) return {};
    if (!spend(ctx, ctx.slot, COSTS.exclusiveDeal)) return {};
    markOnce(sim, "procurement.p05");
    sim.exclusiveSupplierDeal = true;
    sim.supplierTier = Math.max(sim.supplierTier, 4);
    sim.opponentSupplierCap = 3;
    const oppSim = getSim(ctx.state, other(ctx.slot));
    oppSim.opponentSupplierCap = 3;
    writeSim(ctx.state.playersPrivate[other(ctx.slot)], oppSim);
    return { exclusiveSupplierDeal: 1, cash: -COSTS.exclusiveDeal };
  });
};

const procurementP06: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.roundsAtSupplierTier < 3 || !spend(ctx, ctx.slot, COSTS.bulkDiscount)) return {};
    sim.bulkDiscountRoundsRemaining = 4;
    scratch().inputCostMultiplier[ctx.slot] *= 0.9;
    return { bulkDiscountRoundsRemaining: 4, cash: -COSTS.bulkDiscount };
  });
};

const procurementP07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    sim.localSourcing = true;
    // Downtown scenario: +10% cost, +5% quality
    scratch().inputCostMultiplier[ctx.slot] *= 1.1;
    sim.productQuality = Math.min(1, sim.productQuality + 0.05);
    return { localSourcing: 1, inputCostMultiplier: 1.1 };
  });
};

// ── operations ───────────────────────────────────────────────────────────────

function setDeployment(ctx: ActionHandlerContext, mode: DeploymentMode): void {
  withSim(ctx, (sim) => {
    if (mode === "customer" && ctx.state.playersPrivate[ctx.slot].staffCount < 2) return {};
    sim.deploymentMode = mode;
    return { deploymentMode: 1 };
  });
}

const operationsO01: ActionHandler = (ctx) => setDeployment(ctx, "speed");
const operationsO02: ActionHandler = (ctx) => setDeployment(ctx, "quality");
const operationsO03: ActionHandler = (ctx) => setDeployment(ctx, "balanced");
const operationsO04: ActionHandler = (ctx) => setDeployment(ctx, "customer");

const operationsO05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.equipmentLevel >= 5 || onCooldown(sim, "equipment", ctx.round)) return {};
    if (!spend(ctx, ctx.slot, COSTS.equipmentUpgrade)) return {};
    sim.equipmentLevel += 1;
    sim.capacityPerWorker += 2;
    sim.totalCapacity = ctx.state.playersPrivate[ctx.slot].staffCount * sim.capacityPerWorker;
    setCooldown(sim, "equipment", ctx.round, ctx.round + 2);
    return { equipmentLevel: 1, cash: -COSTS.equipmentUpgrade };
  });
};

const operationsO06: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.equipmentLevel < 2) return {};
    const cost = maintenanceCost(sim.equipmentLevel);
    if (!spend(ctx, ctx.slot, cost)) return {};
    sim.equipmentDepreciationRound = ctx.round;
    return { equipmentDepreciationRound: ctx.round, cash: -cost };
  });
};

const operationsO07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.rdProjectRoundsRemaining > 0) return {};
    if (ctx.state.playersPrivate[ctx.slot].staffCount < 2) return {};
    if (!spend(ctx, ctx.slot, COSTS.rdProject)) return {};
    sim.rdProjectRoundsRemaining = 4;
    return { rdProjectRoundsRemaining: 4, cash: -COSTS.rdProject };
  });
};

const operationsO08: ActionHandler = (ctx) => {
  const priv = ctx.state.playersPrivate[ctx.slot];
  const sim = getSim(ctx.state, ctx.slot);
  if (moraleUnit(priv.morale) < 0.3 || (sim.overtimeLastRound > 0 && sim.overtimeLastRound === ctx.round - 1)) {
    pushResolved(ctx, ctx.slot, ctx.move.moveId, {});
    return;
  }
  sim.overtimeThisRound = true;
  sim.overtimeLastRound = ctx.round;
  sim.totalCapacity = Math.round(sim.totalCapacity * 1.3);
  setMorale(priv, moraleUnit(priv.morale) - 0.08);
  writeSim(priv, sim);
  pushResolved(ctx, ctx.slot, ctx.move.moveId, { overtime: 1, morale: -0.08 });
};

// ── hr ───────────────────────────────────────────────────────────────────────

const hrH01: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const cost = hiringCost(sim.wagePerWorker);
    if (!spend(ctx, ctx.slot, cost)) return {};
    const priv = ctx.state.playersPrivate[ctx.slot];
    priv.staffCount += 1;
    sim.avgSkill = (sim.avgSkill * (priv.staffCount - 1) + 0.3) / priv.staffCount;
    sim.totalCapacity = priv.staffCount * sim.capacityPerWorker;
    return { staffCount: 1, cash: -cost };
  });
};

const hrH02: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const priv = ctx.state.playersPrivate[ctx.slot];
    if (priv.staffCount <= 1) return {};
    const cost = severanceCost(sim.wagePerWorker);
    if (!spend(ctx, ctx.slot, cost)) return {};
    priv.staffCount -= 1;
    sim.totalCapacity = priv.staffCount * sim.capacityPerWorker;
    setMorale(priv, moraleUnit(priv.morale) - 0.05);
    return { staffCount: -1, cash: -cost, morale: -0.05 };
  });
};

const hrH03: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const raise = readAmount(ctx.move.input, 1);
    sim.wagePerWorker += raise;
    const priv = ctx.state.playersPrivate[ctx.slot];
    setMorale(priv, Math.min(1, moraleUnit(priv.morale) + raise * 0.005));
    return { wagePerWorker: raise };
  });
};

const hrH04: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const cut = readAmount(ctx.move.input, 1);
    sim.wagePerWorker = Math.max(8, sim.wagePerWorker - cut);
    const priv = ctx.state.playersPrivate[ctx.slot];
    setMorale(priv, Math.max(0, moraleUnit(priv.morale) - cut * 0.008));
    return { wagePerWorker: -cut };
  });
};

const hrH05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const budget = readAmount(ctx.move.input, 0);
    sim.trainingBudgetPerRound = budget;
    return { trainingBudgetPerRound: budget };
  });
};

const hrH06: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.trainingBudgetPerRound <= 0) return {};
    sim.trainingBudgetPerRound = 0;
    return { trainingBudgetPerRound: 0 };
  });
};

const hrH07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (onCooldown(sim, "hr.h07", ctx.round)) return {};
    if (!spend(ctx, ctx.slot, COSTS.poach)) return {};
    scratch().poachAttempt[ctx.slot] = true;
    sim.poachAttempt = true;
    setCooldown(sim, "hr.h07", ctx.round, ctx.round + 3);
    notePrivate(ctx, ctx.slot, "Poach attempt initiated.");
    return { poachAttempt: 1, cash: -COSTS.poach };
  });
};

const hrH08: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const priv = ctx.state.playersPrivate[ctx.slot];
    if (priv.staffCount < 3 || !spend(ctx, ctx.slot, COSTS.restructure)) return {};
    sim.avgSkill = 0.45;
    setMorale(priv, Math.max(0, moraleUnit(priv.morale) - 0.03));
    return { avgSkill: 0.45, morale: -0.03, cash: -COSTS.restructure };
  });
};

const hrH09: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const priv = ctx.state.playersPrivate[ctx.slot];
    const cost = performanceBonusTotal(priv.staffCount);
    if (!spend(ctx, ctx.slot, cost)) return {};
    setMorale(priv, Math.min(1, moraleUnit(priv.morale) + 0.08));
    return { morale: 0.08, cash: -cost };
  });
};

// ── marketing ────────────────────────────────────────────────────────────────

const marketingM01: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const budget = readAmount(ctx.move.input, 0);
    sim.marketingBudgetPerRound = budget;
    scratch().marketingBoost[ctx.slot] = budget > 0 ? Math.min(0.5, budget / 200) : 0;
    return { marketingBudgetPerRound: budget };
  });
};

const marketingM02: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (sim.loyaltyProgramActive || !spend(ctx, ctx.slot, COSTS.loyaltyLaunch)) return {};
    sim.loyaltyProgramActive = true;
    return { loyaltyProgramActive: 1, cash: -COSTS.loyaltyLaunch };
  });
};

const marketingM03: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!sim.loyaltyProgramActive) return {};
    sim.loyaltyProgramActive = false;
    return { loyaltyProgramActive: 0 };
  });
};

const marketingM04: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!spend(ctx, ctx.slot, COSTS.targetedCampaign)) return {};
    sim.targetedCampaignRounds = 2;
    sim.targetedCampaignSegment = readChoice(ctx.move.input, "value_seekers");
    scratch().demandBoost[ctx.slot] += 0.15;
    return { targetedCampaignRounds: 2, cash: -COSTS.targetedCampaign };
  });
};

const marketingM05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const opp = other(ctx.slot);
    const oppSim = mergeSimulationDefaults(ctx.actionBaseline.playersPrivate[opp]);
    if (oppSim.marketingBudgetPerRound <= 0 || !spend(ctx, ctx.slot, COSTS.counterMarketing)) return {};
    scratch().counterMarketing[ctx.slot] = true;
    sim.counterMarketingActive = true;
    return { counterMarketingActive: 1, cash: -COSTS.counterMarketing };
  });
};

const marketingM06: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!spend(ctx, ctx.slot, COSTS.sponsorEvent)) return {};
    scratch().streetTrafficBoost += 0.4;
    const priv = ctx.state.playersPrivate[ctx.slot];
    setRep(priv, Math.min(1, repUnit(priv.reputation) + 0.05));
    return { streetTrafficBoost: 0.4, reputation: 0.05, cash: -COSTS.sponsorEvent };
  });
};

const marketingM07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (oncePerMatch(sim, "marketing.m07") || !spend(ctx, ctx.slot, COSTS.rebrand)) return {};
    markOnce(sim, "marketing.m07");
    sim.rebranded = true;
    sim.totalCapacity = Math.round(sim.totalCapacity * 0.8);
    sim.momentumBoostRounds = 3;
    return { rebranded: 1, cash: -COSTS.rebrand, momentumBoostRounds: 3 };
  });
};

// ── finance ──────────────────────────────────────────────────────────────────

const financeF01: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const amount = readAmount(ctx.move.input, 50);
    const creditLimit = 500;
    if (amount <= 0 || sim.debt + amount > creditLimit) return {};
    sim.debt += amount;
    ctx.state.playersPrivate[ctx.slot].cash += amount;
    return { debt: amount, cash: amount };
  });
};

const financeF02: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const amount = readAmount(ctx.move.input, 50);
    if (sim.debt <= 0 || amount <= 0) return {};
    const repay = Math.min(amount, sim.debt, ctx.state.playersPrivate[ctx.slot].cash);
    if (repay <= 0 || !spend(ctx, ctx.slot, repay)) return {};
    sim.debt -= repay;
    return { debt: -repay, cash: -repay };
  });
};

const financeF03: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    sim.cashReserveMode = true;
    return { cashReserveMode: 1 };
  });
};

const financeF04: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!sim.cashReserveMode) return {};
    sim.cashReserveMode = false;
    return { cashReserveMode: 0 };
  });
};

const financeF05: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!spend(ctx, ctx.slot, COSTS.insurancePerRound)) return {};
    sim.insuranceActive = true;
    return { insuranceActive: 1, cash: -COSTS.insurancePerRound };
  });
};

const financeF06: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    const priv = ctx.state.playersPrivate[ctx.slot];
    const amount = Math.max(COSTS.minDividend, readAmount(ctx.move.input, COSTS.minDividend));
    if (priv.cash <= amount || !spend(ctx, ctx.slot, amount)) return {};
    sim.securedProfit += amount;
    return { securedProfit: amount, cash: -amount };
  });
};

const financeF07: ActionHandler = (ctx) => {
  withSim(ctx, (sim) => {
    if (!spend(ctx, ctx.slot, COSTS.scout)) return {};
    const attr = readChoice(ctx.move.input, "cash");
    const opp = other(ctx.slot);
    const basePriv = ctx.actionBaseline.playersPrivate[opp];
    const baseSim = mergeSimulationDefaults(basePriv);
    let value = 0;
    switch (attr) {
      case "cash":
        value = basePriv.cash;
        break;
      case "staffCount":
        value = basePriv.staffCount;
        break;
      case "reputation":
        value = repUnit(basePriv.reputation);
        break;
      case "supplierTier":
        value = baseSim.supplierTier;
        break;
      case "morale":
        value = moraleUnit(basePriv.morale);
        break;
      case "debt":
        value = baseSim.debt;
        break;
      default:
        value = basePriv.cash;
    }
    sim.opponentIntel.push({ attribute: attr, value, confidence: 1, roundObserved: ctx.round });
    notePrivate(ctx, ctx.slot, `Scouted opponent ${attr}: ~${value.toFixed(1)}`);
    return { scout: 1, cash: -COSTS.scout };
  });
};

// ── export ───────────────────────────────────────────────────────────────────

export const ALL_ACTION_HANDLERS: Record<string, ActionHandler> = {
  "sales.s01": salesS01,
  "sales.s02": salesS02,
  "sales.s03": salesS03,
  "sales.s04": salesS04,
  "sales.s05": salesS05,
  "sales.s06": salesS06,
  "sales.s07": salesS07,
  "sales.s08": salesS08,
  "procurement.p01": procurementP01,
  "procurement.p02": procurementP02,
  "procurement.p03": procurementP03,
  "procurement.p04": procurementP04,
  "procurement.p05": procurementP05,
  "procurement.p06": procurementP06,
  "procurement.p07": procurementP07,
  "operations.o01": operationsO01,
  "operations.o02": operationsO02,
  "operations.o03": operationsO03,
  "operations.o04": operationsO04,
  "operations.o05": operationsO05,
  "operations.o06": operationsO06,
  "operations.o07": operationsO07,
  "operations.o08": operationsO08,
  "hr.h01": hrH01,
  "hr.h02": hrH02,
  "hr.h03": hrH03,
  "hr.h04": hrH04,
  "hr.h05": hrH05,
  "hr.h06": hrH06,
  "hr.h07": hrH07,
  "hr.h08": hrH08,
  "hr.h09": hrH09,
  "marketing.m01": marketingM01,
  "marketing.m02": marketingM02,
  "marketing.m03": marketingM03,
  "marketing.m04": marketingM04,
  "marketing.m05": marketingM05,
  "marketing.m06": marketingM06,
  "marketing.m07": marketingM07,
  "finance.f01": financeF01,
  "finance.f02": financeF02,
  "finance.f03": financeF03,
  "finance.f04": financeF04,
  "finance.f05": financeF05,
  "finance.f06": financeF06,
  "finance.f07": financeF07,
};
