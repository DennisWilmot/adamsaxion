import type { MatchState, PlayerPrivateState } from "@adamsaxion/pricewar-types";
import { ENGINE_VERSION } from "../version";
import { COFFEE_SHOP_SCENARIO } from "../scenarios/coffee-shop";
import { mergeSimulationDefaults, simDefaults, writeSim } from "../simulation/player-sim";

/** Apply defaults for new fields when loading JSONB or replaying old matches. */
export function normalizeMatchState(raw: MatchState): MatchState {
  const state = structuredClone(raw);
  state.engineVersion = state.engineVersion ?? ENGINE_VERSION;
  state.scenarioVersion = state.scenarioVersion ?? COFFEE_SHOP_SCENARIO.version;
  state.market.lastResolvedRound = state.market.lastResolvedRound ?? 0;

  for (const slot of ["A", "B"] as const) {
    normalizePlayerPrivate(state.playersPrivate[slot]);
  }

  return state;
}

function normalizePlayerPrivate(priv: PlayerPrivateState): void {
  const sim = mergeSimulationDefaults(priv);
  writeSim(priv, sim);
  if (priv.inventory == null) priv.inventory = 200;
  if (!priv.activePolicies) priv.activePolicies = [];
  if (!priv.activeConditions) priv.activeConditions = [];
}

export function createNormalizedInitialPrivate(cash = 500): PlayerPrivateState {
  const base: PlayerPrivateState = {
    cash,
    inventory: 200,
    staffCount: 3,
    reputation: 30,
    morale: 70,
    activePolicies: [],
    activeConditions: [],
  };
  writeSim(base, simDefaults());
  return base;
}
