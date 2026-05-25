import type {
  MatchId,
  MatchState,
  PlayerSlot,
  ScenarioConfig,
} from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SCENARIO_ID } from "@adamsaxion/pricewar-types";
import { ENGINE_VERSION } from "../../version";
import { COFFEE_SHOP_BALANCING } from "./balancing";
import { getPlayMode } from "../../play-modes/registry";

export const COFFEE_SHOP_SCENARIO: ScenarioConfig = {
  id: COFFEE_SHOP_SCENARIO_ID,
  version: "0.1.0",
  label: "Coffee Shop Price War",
  shortDescription: "Head-to-head coffee shop competition in a single market.",
  totalRounds: 8,
  availableDomains: [
    "sales",
    "procurement",
    "operations",
    "hr",
    "marketing",
    "finance",
  ],
  victoryConditions: [{ kind: "highest_cash", weight: 1 }],
  balancing: { ...COFFEE_SHOP_BALANCING },
};

function playerPublic(slot: PlayerSlot, displayName: string, isBot: boolean) {
  return {
    slot,
    displayName,
    currentPrice: COFFEE_SHOP_BALANCING.startingPrice,
    brandTier: 2,
    isBot,
  };
}

function playerPrivate() {
  return {
    cash: COFFEE_SHOP_BALANCING.startingCash,
    inventory: COFFEE_SHOP_BALANCING.startingInventory,
    staffCount: COFFEE_SHOP_BALANCING.startingStaffCount,
    reputation: COFFEE_SHOP_BALANCING.startingReputation,
    morale: COFFEE_SHOP_BALANCING.startingMorale,
    activePolicies: [],
    activeConditions: [],
  };
}

export function createInitialMatchState(args: {
  matchId: MatchId;
  playModeId: string;
  rngSeed: string;
  playerAName: string;
  playerBName: string;
  playerAIsBot?: boolean;
  playerBIsBot?: boolean;
}): MatchState {
  const playMode = getPlayMode(args.playModeId);
  const perPlayerMs =
    playMode?.clock?.kind === "chess" ? playMode.clock.perPlayerMs : 0;
  const now = new Date(0).toISOString();

  return {
    matchId: args.matchId,
    scenarioId: COFFEE_SHOP_SCENARIO_ID,
    scenarioVersion: COFFEE_SHOP_SCENARIO.version,
    engineVersion: ENGINE_VERSION,
    playModeId: args.playModeId,
    rngSeed: args.rngSeed,
    phase: "briefing",
    outcome: { kind: "in_progress" },
    market: {
      currentRound: 1,
      totalRounds: COFFEE_SHOP_SCENARIO.totalRounds,
      marketDemandIndex: 50,
      weatherIndex: 0,
      eventLog: [],
    },
    playersPublic: {
      A: playerPublic("A", args.playerAName, args.playerAIsBot ?? false),
      B: playerPublic("B", args.playerBName, args.playerBIsBot ?? false),
    },
    playersPrivate: {
      A: playerPrivate(),
      B: playerPrivate(),
    },
    clocks: {
      A: { remainingMs: perPlayerMs, tickingSince: null },
      B: { remainingMs: perPlayerMs, tickingSince: null },
    },
    timerMeta: {
      clockTimeoutCount: { A: 0, B: 0 },
      zeroMoveSubmissionCount: { A: 0, B: 0 },
      roundDecideStartedAt: null,
      abandonmentGraceEndsAt: { A: null, B: null },
      lobbyOpenedAt: null,
      playerConnectedAt: { A: null, B: null },
    },
    createdAt: now,
    updatedAt: now,
  };
}
