import type {
  MatchState,
  PlayerSlot,
  SubmittedMove,
  GameError,
  ScenarioConfig,
} from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "../actions/catalog";
import { hasActionHandler } from "../actions/handlers/registry";
import { findConflicts } from "../simulation/conflicts";
import { COFFEE_SHOP_SIM } from "../simulation/config";
import { estimateActionCost } from "../simulation/player-sim";

const CASH_RESERVE_ALLOWED = new Set([
  "sales.s01",
  "sales.s03",
  "procurement.p02",
  "procurement.p04",
  "operations.o01",
  "operations.o02",
  "operations.o03",
  "operations.o04",
  "hr.h02",
  "hr.h04",
  "hr.h06",
  "marketing.m01",
  "marketing.m03",
  "finance.f01",
  "finance.f04",
]);

export function validateMoves(
  state: MatchState,
  slot: PlayerSlot,
  moves: SubmittedMove[],
  scenario: ScenarioConfig
): GameError | null {
  if (moves.length > 3) {
    return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
  }

  const priv = state.playersPrivate[slot] as typeof state.playersPrivate[typeof slot] & {
    cashReserveMode?: boolean;
    wagePerWorker?: number;
    equipmentLevel?: number;
  };
  const playerCash = priv.cash;
  const cashReserveMode = priv.cashReserveMode === true;
  const domainCounts = new Map<string, number>();
  const moveIds = moves.map((m) => m.moveId);
  let committedSpend = 0;

  const hardConflicts = findConflicts(moveIds).filter((c) => c.type === "hard");
  if (hardConflicts.length > 0) {
    return { code: "MOVE_NOT_ALLOWED", message: hardConflicts[0]!.reason };
  }

  for (const move of moves) {
    const def = MOVE_BY_ID.get(move.moveId);
    if (!def) {
      return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
    }

    if (!hasActionHandler(move.moveId) && !scenario.allowStubbedMoves) {
      return {
        code: "UNIMPLEMENTED_MOVE",
        message: `Move ${move.moveId} is not available in ranked play yet.`,
      };
    }

    if (cashReserveMode && !CASH_RESERVE_ALLOWED.has(move.moveId)) {
      return {
        code: "MOVE_NOT_ALLOWED",
        message: "Cash reserve mode blocks non-essential spending. Exit reserve mode to use this move.",
      };
    }
    if (
      cashReserveMode &&
      move.moveId === "marketing.m01" &&
      ((move.input as { amount?: number })?.amount ?? 0) > 0
    ) {
      return {
        code: "MOVE_NOT_ALLOWED",
        message: "Cash reserve mode only allows marketing to be set to $0.",
      };
    }

    if (scenario.maxActionsPerDomain != null) {
      const count = (domainCounts.get(def.domain) ?? 0) + 1;
      domainCounts.set(def.domain, count);
      if (count > scenario.maxActionsPerDomain) {
        return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
      }
    }

    const estimatedSpend =
      move.moveId === "finance.f01" || def.input.kind === "slider"
        ? 0
        : estimateActionCost(move.moveId, move.input, {
            wagePerWorker: priv.wagePerWorker ?? COFFEE_SHOP_SIM.startingWagePerWorker,
            staffCount: priv.staffCount,
            equipmentLevel: priv.equipmentLevel ?? 1,
          });
    committedSpend += estimatedSpend;
    if (committedSpend > playerCash) {
      return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
    }
  }

  return null;
}
