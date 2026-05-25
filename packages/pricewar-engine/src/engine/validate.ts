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

export function validateMoves(
  state: MatchState,
  slot: PlayerSlot,
  moves: SubmittedMove[],
  scenario: ScenarioConfig
): GameError | null {
  if (moves.length > 3) {
    return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
  }

  const playerCash = state.playersPrivate[slot].cash;
  const domainCounts = new Map<string, number>();
  const moveIds = moves.map((m) => m.moveId);

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

    if (scenario.maxActionsPerDomain != null) {
      const count = (domainCounts.get(def.domain) ?? 0) + 1;
      domainCounts.set(def.domain, count);
      if (count > scenario.maxActionsPerDomain) {
        return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
      }
    }

    if (def.input.kind === "amount") {
      const input = move.input as { amount?: number };
      const spend = input?.amount ?? 0;
      if (spend > playerCash) {
        return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
      }
    }
  }

  return null;
}
