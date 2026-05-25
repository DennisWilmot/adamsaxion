export type ScenarioId = string & { readonly __brand: "ScenarioId" };

export const COFFEE_SHOP_SCENARIO_ID = "coffee-shop" as ScenarioId;

export interface ScenarioConfig {
  id: ScenarioId;
  version: string;
  label: string;
  shortDescription: string;
  totalRounds: number;
  availableDomains: readonly string[];
  victoryConditions: Array<{
    kind: "highest_cash" | "first_bankruptcy" | "highest_brand_at_end";
    weight?: number;
  }>;
  balancing: Record<string, number>;
}
