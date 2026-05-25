import type { MoveId } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SIM } from "./config";

/** Fixed cash costs from Actions Catalog (Coffee Shop). */
export const SPREADSHEET_COSTS = {
  menuExpand: 50,
  bundleSetup: 30,
  exclusiveSupplier: 100,
  bulkDiscountNegotiation: 20,
  equipmentUpgrade: 80,
  rdProjectDefault: 70,
  rdProjectMin: 60,
  rdProjectMax: 150,
  maintenancePerLevel: 20,
  loyaltyLaunch: 40,
  targetedCampaign: 50,
  counterMarketing: 30,
  sponsorEvent: 80,
  rebrand: 120,
  poachSigningBonus: 60,
  restructure: 30,
  performanceBonusPerWorker: 15,
  scout: 25,
  insurancePerRound: 15,
  minDividend: 50,
  loanUnit: 50,
  repayUnit: 50,
  bufferRoundCost: 10,
} as const;

/** H01: hiring_cost = 1.5 × wage_per_worker */
export function hiringCost(wagePerWorker: number): number {
  return Math.round(wagePerWorker * 1.5);
}

/** H02: severance ≈ wage × regulatory multiplier (downtown coffee ≈ 1.67×) */
export function severanceCost(wagePerWorker: number): number {
  return Math.round(wagePerWorker * (25 / COFFEE_SHOP_SIM.startingWagePerWorker));
}

/** O06: $20 per equipment level */
export function maintenanceCost(equipmentLevel: number): number {
  return SPREADSHEET_COSTS.maintenancePerLevel * equipmentLevel;
}

/** H09: $15 × staff_count */
export function performanceBonusTotal(staffCount: number): number {
  return SPREADSHEET_COSTS.performanceBonusPerWorker * staffCount;
}

/** P03: buffer × base_input_cost (2 rounds of supply at ~$10/round per buffer unit) */
export function inventoryBufferCost(units = 2): number {
  return SPREADSHEET_COSTS.bufferRoundCost * units;
}

export interface ActionCostContext {
  wagePerWorker?: number;
  staffCount?: number;
  equipmentLevel?: number;
}

/** Shared cost preview for UI + legal-moves (matches handler spend where possible). */
export function estimateActionCost(
  moveId: MoveId,
  input: unknown,
  context: ActionCostContext = {}
): number {
  const payload = input as Record<string, number | boolean | string | undefined>;
  const units = Number(payload.units ?? 1);
  const wage = context.wagePerWorker ?? COFFEE_SHOP_SIM.startingWagePerWorker;
  const staff = context.staffCount ?? COFFEE_SHOP_SIM.startingStaff;
  const equip = context.equipmentLevel ?? 1;

  switch (moveId) {
    case "sales.s02":
      return SPREADSHEET_COSTS.menuExpand * units;
    case "sales.s04":
      return 0;
    case "sales.s07":
      return SPREADSHEET_COSTS.bundleSetup;
    case "procurement.p03":
      return inventoryBufferCost(2);
    case "procurement.p05":
      return SPREADSHEET_COSTS.exclusiveSupplier;
    case "procurement.p06":
      return SPREADSHEET_COSTS.bulkDiscountNegotiation;
    case "operations.o05":
      return SPREADSHEET_COSTS.equipmentUpgrade;
    case "operations.o06":
      return maintenanceCost(equip);
    case "operations.o07":
      return typeof payload.amount === "number"
        ? Math.min(SPREADSHEET_COSTS.rdProjectMax, Math.max(SPREADSHEET_COSTS.rdProjectMin, payload.amount))
        : SPREADSHEET_COSTS.rdProjectDefault;
    case "hr.h01":
      return hiringCost(wage) * units;
    case "hr.h02":
      return severanceCost(wage) * units;
    case "hr.h07":
      return SPREADSHEET_COSTS.poachSigningBonus;
    case "hr.h08":
      return SPREADSHEET_COSTS.restructure;
    case "hr.h09":
      return performanceBonusTotal(staff);
    case "marketing.m02":
      return SPREADSHEET_COSTS.loyaltyLaunch;
    case "marketing.m04":
      return SPREADSHEET_COSTS.targetedCampaign;
    case "marketing.m05":
      return SPREADSHEET_COSTS.counterMarketing;
    case "marketing.m06":
      return SPREADSHEET_COSTS.sponsorEvent;
    case "marketing.m07":
      return SPREADSHEET_COSTS.rebrand;
    case "finance.f01":
      return units * SPREADSHEET_COSTS.loanUnit;
    case "finance.f02":
      return units * SPREADSHEET_COSTS.repayUnit;
    case "finance.f05":
      return SPREADSHEET_COSTS.insurancePerRound;
    case "finance.f06":
      return Math.max(SPREADSHEET_COSTS.minDividend, Number(payload.amount ?? SPREADSHEET_COSTS.minDividend));
    case "finance.f07":
      return SPREADSHEET_COSTS.scout;
    default:
      break;
  }

  if (typeof payload.amount === "number") {
    return payload.amount;
  }

  return 0;
}

/** Legacy alias used by handlers — keep in sync with SPREADSHEET_COSTS. */
export const COSTS = {
  hire: hiringCost(COFFEE_SHOP_SIM.startingWagePerWorker),
  severance: severanceCost(COFFEE_SHOP_SIM.startingWagePerWorker),
  poach: SPREADSHEET_COSTS.poachSigningBonus,
  loyaltyLaunch: SPREADSHEET_COSTS.loyaltyLaunch,
  targetedCampaign: SPREADSHEET_COSTS.targetedCampaign,
  counterMarketing: SPREADSHEET_COSTS.counterMarketing,
  sponsorEvent: SPREADSHEET_COSTS.sponsorEvent,
  rebrand: SPREADSHEET_COSTS.rebrand,
  bufferPerUnit: SPREADSHEET_COSTS.bufferRoundCost,
  exclusiveDeal: SPREADSHEET_COSTS.exclusiveSupplier,
  bulkDiscount: SPREADSHEET_COSTS.bulkDiscountNegotiation,
  equipmentUpgrade: SPREADSHEET_COSTS.equipmentUpgrade,
  maintenancePerLevel: SPREADSHEET_COSTS.maintenancePerLevel,
  rdProject: SPREADSHEET_COSTS.rdProjectDefault,
  performanceBonusPerWorker: SPREADSHEET_COSTS.performanceBonusPerWorker,
  scout: SPREADSHEET_COSTS.scout,
  insurancePerRound: SPREADSHEET_COSTS.insurancePerRound,
  minDividend: SPREADSHEET_COSTS.minDividend,
  menuExpand: SPREADSHEET_COSTS.menuExpand,
  bundleSetup: SPREADSHEET_COSTS.bundleSetup,
  restructure: SPREADSHEET_COSTS.restructure,
  flashSaleCooldownRounds: 2,
  trainingSkillPerDollar: 0.005,
} as const;
