import type { PlayerPrivateState, PlayerSlot, MatchState } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SIM } from "./config";

export type DeploymentMode = "speed" | "quality" | "balanced" | "customer";

export interface OpponentIntelEntry {
  attribute: string;
  value: number;
  confidence: number;
  roundObserved: number;
}

export interface SimulationFields {
  wagePerWorker: number;
  avgSkill: number;
  menuBreadth: number;
  supplierTier: number;
  inventoryBuffer: number;
  productQuality: number;
  equipmentLevel: number;
  localSourcing: boolean;
  trainingBudgetPerRound: number;
  deploymentMode: DeploymentMode;
  marketingBudgetPerRound: number;
  debt: number;
  securedProfit: number;
  cashReserveMode: boolean;
  insuranceActive: boolean;
  loyaltyProgramActive: boolean;
  premiumPositioning: boolean;
  priceMatchRoundsRemaining: number;
  bundleRoundsRemaining: number;
  bulkDiscountRoundsRemaining: number;
  rdProjectRoundsRemaining: number;
  rebranded: boolean;
  flashSaleActiveRound: number | null;
  surgePricingActive: boolean;
  exclusiveSupplierDeal: boolean;
  opponentSupplierCap: number | null;
  reviewScore: number;
  overtimeLastRound: number;
  targetedCampaignRounds: number;
  targetedCampaignSegment: string | null;
  momentumBoostRounds: number;
  usedOncePerMatch: Record<string, boolean>;
  cooldownUntilRound: Record<string, number>;
  opponentIntel: OpponentIntelEntry[];
  poachAttempt: boolean;
  counterMarketingActive: boolean;
  overtimeThisRound: boolean;
  totalCapacity: number;
  capacityPerWorker: number;
  roundsAtSupplierTier: number;
  equipmentDepreciationRound: number;
}

const DEFAULTS: SimulationFields = {
  wagePerWorker: COFFEE_SHOP_SIM.startingWagePerWorker,
  avgSkill: COFFEE_SHOP_SIM.startingSkill,
  menuBreadth: 2,
  supplierTier: 2,
  inventoryBuffer: 0,
  productQuality: 0.55,
  equipmentLevel: 1,
  localSourcing: false,
  trainingBudgetPerRound: 0,
  deploymentMode: "balanced",
  marketingBudgetPerRound: 0,
  debt: 0,
  securedProfit: 0,
  cashReserveMode: false,
  insuranceActive: false,
  loyaltyProgramActive: false,
  premiumPositioning: false,
  priceMatchRoundsRemaining: 0,
  bundleRoundsRemaining: 0,
  bulkDiscountRoundsRemaining: 0,
  rdProjectRoundsRemaining: 0,
  rebranded: false,
  flashSaleActiveRound: null,
  surgePricingActive: false,
  exclusiveSupplierDeal: false,
  opponentSupplierCap: null,
  reviewScore: 3.8,
  overtimeLastRound: 0,
  targetedCampaignRounds: 0,
  targetedCampaignSegment: null,
  momentumBoostRounds: 0,
  usedOncePerMatch: {},
  cooldownUntilRound: {},
  opponentIntel: [],
  poachAttempt: false,
  counterMarketingActive: false,
  overtimeThisRound: false,
  totalCapacity: COFFEE_SHOP_SIM.startingStaff * 15,
  capacityPerWorker: 15,
  roundsAtSupplierTier: 3,
  equipmentDepreciationRound: 0,
};

export function simDefaults(): SimulationFields {
  return structuredClone(DEFAULTS);
}

export function mergeSimulationDefaults(priv: PlayerPrivateState): SimulationFields {
  const ext = priv as PlayerPrivateState & Partial<SimulationFields>;
  return { ...structuredClone(DEFAULTS), ...pickSim(ext) };
}

function pickSim(ext: Partial<SimulationFields>): Partial<SimulationFields> {
  const out: Partial<SimulationFields> = {};
  for (const key of Object.keys(DEFAULTS) as (keyof SimulationFields)[]) {
    if (ext[key] !== undefined) {
      (out as Record<string, unknown>)[key] = ext[key];
    }
  }
  return out;
}

export function writeSim(priv: PlayerPrivateState, sim: SimulationFields): void {
  Object.assign(priv, sim);
}

export function getSim(state: MatchState, slot: PlayerSlot): SimulationFields {
  return mergeSimulationDefaults(state.playersPrivate[slot]);
}

export function moraleUnit(morale: number): number {
  return morale > 1 ? morale / 100 : morale;
}

export function setMorale(priv: PlayerPrivateState, unit: number): void {
  priv.morale = priv.morale > 1 ? Math.round(Math.max(0, Math.min(1, unit)) * 100) : Math.max(0, Math.min(1, unit));
}

export function repUnit(reputation: number): number {
  return reputation > 1 ? reputation / 100 : reputation;
}

export function setRep(priv: PlayerPrivateState, unit: number): void {
  priv.reputation =
    priv.reputation > 1 ? Math.round(Math.max(0, Math.min(1, unit)) * 100) : Math.max(0, Math.min(1, unit));
}

export { COSTS, SPREADSHEET_COSTS, estimateActionCost, hiringCost, severanceCost, maintenanceCost, performanceBonusTotal, inventoryBufferCost } from "./action-costs";
export type { ActionCostContext } from "./action-costs";
