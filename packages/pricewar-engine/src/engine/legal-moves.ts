import type {
  MatchState,
  MoveDefinition,
  MoveId,
  PlayerSlot,
  ScenarioConfig,
  SubmittedMove,
} from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_MOVES, getActionCatalogEntry, MOVE_BY_ID } from "../actions/catalog";
import { findConflicts } from "../simulation/conflicts";
import { COSTS, getSim, moraleUnit, repUnit, hiringCost } from "../simulation/player-sim";
import { hasActionHandler } from "../actions/handlers/registry";
import { validateMoves } from "./validate";

export interface LegalMoveStatus {
  id: MoveId;
  available: boolean;
  reason?: string;
}

function defaultInputForMove(move: MoveDefinition, currentPrice?: number): Record<string, unknown> {
  const spec = move.input;
  switch (spec.kind) {
    case "slider":
      return { newPrice: currentPrice ?? spec.min };
    case "amount":
      return { amount: spec.min };
    case "stepper":
      return { units: spec.default ?? spec.min };
    case "toggle":
      return { enabled: spec.default ?? true };
    case "singleChoice":
      return { choiceId: spec.options[0]?.id ?? "" };
    case "mode":
      return { modeId: spec.modes[0]?.id ?? "" };
    default:
      return {};
  }
}

function prerequisiteFailure(
  state: MatchState,
  slot: PlayerSlot,
  moveId: MoveId
): string | null {
  const entry = getActionCatalogEntry(moveId);
  if (!entry?.prerequisite || entry.prerequisite === "Always available") {
    return null;
  }

  const priv = state.playersPrivate[slot];
  const sim = getSim(state, slot);
  const round = state.market.currentRound;

  if (sim.cooldownUntilRound[moveId] != null && sim.cooldownUntilRound[moveId]! > round) {
    return entry.prerequisite;
  }
  if (sim.usedOncePerMatch[moveId]) {
    return entry.prerequisite;
  }

  switch (moveId) {
    case "sales.s04":
      if (sim.flashSaleActiveRound === round - 1) return entry.prerequisite;
      break;
    case "sales.s05":
      if (repUnit(priv.reputation) < 0.6) return entry.prerequisite;
      break;
    case "sales.s06":
      if (sim.menuBreadth < 2 || priv.cash < 30) return entry.prerequisite;
      break;
    case "procurement.p02":
      if (sim.supplierTier <= 1) return entry.prerequisite;
      break;
    case "procurement.p04":
      if (sim.inventoryBuffer <= 0) return entry.prerequisite;
      break;
    case "procurement.p05":
      if (priv.cash < COSTS.exclusiveDeal || sim.supplierTier < 3) return entry.prerequisite;
      break;
    case "operations.o05":
      if (sim.rdProjectRoundsRemaining > 0 || sim.equipmentLevel >= 5 || priv.cash < COSTS.equipmentUpgrade) {
        return entry.prerequisite;
      }
      break;
    case "operations.o06":
      if (sim.equipmentLevel < 2) return entry.prerequisite;
      break;
    case "operations.o07":
      if (sim.rdProjectRoundsRemaining > 0 || priv.cash < COSTS.rdProject || priv.staffCount < 2) {
        return entry.prerequisite;
      }
      break;
    case "operations.o08":
      if (moraleUnit(priv.morale) < 0.3 || (sim.overtimeLastRound > 0 && sim.overtimeLastRound === round - 1)) {
        return entry.prerequisite;
      }
      break;
    case "hr.h02":
      if (priv.staffCount <= 1) return entry.prerequisite;
      break;
    case "hr.h08":
      if (priv.staffCount < 3 || priv.cash < COSTS.restructure) return entry.prerequisite;
      break;
    case "hr.h01":
      if (priv.cash < hiringCost(sim.wagePerWorker)) return entry.prerequisite;
      break;
    case "marketing.m03":
      if (!sim.loyaltyProgramActive) return entry.prerequisite;
      break;
    case "finance.f02":
      if (sim.debt <= 0) return entry.prerequisite;
      break;
    case "finance.f04":
      if (!sim.cashReserveMode) return entry.prerequisite;
      break;
    case "finance.f06":
      if (priv.cash <= 50) return entry.prerequisite;
      break;
    default:
      break;
  }

  return null;
}

export function evaluateLegalMoves(
  state: MatchState,
  slot: PlayerSlot,
  draft: SubmittedMove[],
  scenario: ScenarioConfig
): LegalMoveStatus[] {
  const priv = state.playersPrivate[slot];
  const draftedIds = new Set(draft.map((m) => m.moveId));

  return COFFEE_SHOP_MOVES.map((move) => {
    if (draftedIds.has(move.id)) {
      return { id: move.id, available: true };
    }

    if (draft.length >= 3) {
      return { id: move.id, available: false, reason: "Hand full — remove a move first." };
    }

    if (!hasActionHandler(move.id) && !scenario.allowStubbedMoves) {
      return { id: move.id, available: false, reason: "Not available in ranked play." };
    }

    const prereq = prerequisiteFailure(state, slot, move.id);
    if (prereq) {
      return { id: move.id, available: false, reason: prereq };
    }

    const draftIds = draft.map((m) => m.moveId);
    const hardConflicts = findConflicts([...draftIds, move.id]).filter((c) => c.type === "hard");
    if (hardConflicts.length > 0) {
      return { id: move.id, available: false, reason: hardConflicts[0]!.reason };
    }

    const testMoves: SubmittedMove[] = [
      ...draft,
      {
        moveId: move.id,
        input: defaultInputForMove(move, state.playersPublic[slot].currentPrice),
        draftedAt: new Date(0).toISOString(),
      },
    ];

    const err = validateMoves(state, slot, testMoves, scenario);
    if (err) {
      const message = err.message !== "Move rejected." ? err.message : undefined;
      return { id: move.id, available: false, ...(message ? { reason: message } : {}) };
    }

    const def = MOVE_BY_ID.get(move.id);
    if (def?.input.kind === "amount") {
      const minSpend = def.input.min;
      if (minSpend > priv.cash) {
        return { id: move.id, available: false, reason: `Need at least $${minSpend} cash.` };
      }
    }

    return { id: move.id, available: true };
  });
}
