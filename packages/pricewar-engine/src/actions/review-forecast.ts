import type { MatchState, MoveId, PlayerSlot, SubmittedMove, ScenarioConfig } from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID, lockForecastForMoves } from "../actions/catalog";
import { hasActionHandler } from "../actions/handlers/registry";
import { findConflicts } from "../simulation/conflicts";
import { getSim } from "../simulation/player-sim";
import type { LockForecastLine } from "../actions/catalog-types";

export function staticForecastForMoves(moveIds: string[]): LockForecastLine[] {
  return lockForecastForMoves(moveIds);
}

export function reviewForecastForDraft(
  state: MatchState,
  slot: PlayerSlot,
  submittedMoves: SubmittedMove[],
  scenario: ScenarioConfig
): LockForecastLine[] {
  const lines = staticForecastForMoves(submittedMoves.map((m) => m.moveId));
  const priv = state.playersPrivate[slot];
  const sim = getSim(state, slot);
  const round = state.market.currentRound;
  const moveIds = submittedMoves.map((m) => m.moveId);

  for (const move of submittedMoves) {
    if (!hasActionHandler(move.moveId) && !scenario.allowStubbedMoves) {
      lines.push({ kind: "risk", text: `${move.moveId} is not enabled for ranked play yet.` });
    }
  }

  const hard = findConflicts(moveIds).filter((c) => c.type === "hard");
  for (const c of hard) {
    lines.push({ kind: "risk", text: c.reason });
  }

  if (sim.cashReserveMode) {
    lines.push({ kind: "immediate", text: "Cash reserve mode limits non-essential spending." });
  }

  if (moveIds.includes("operations.o08" as MoveId) && sim.overtimeLastRound === round - 1) {
    lines.push({ kind: "risk", text: "Cannot run overtime two rounds in a row." });
  }

  if (moveIds.includes("operations.o08" as MoveId) && priv.morale < 30) {
    lines.push({ kind: "risk", text: "Morale too low for overtime." });
  }

  if (round >= state.market.totalRounds) {
    lines.push({ kind: "risk", text: "Final round — long-payoff moves may not fully land." });
  }

  for (const move of submittedMoves) {
    const def = MOVE_BY_ID.get(move.moveId);
    if (def?.input.kind === "amount") {
      const spend = (move.input as { amount?: number })?.amount ?? 0;
      if (spend > priv.cash) {
        lines.push({ kind: "risk", text: `Insufficient cash for ${def.name}.` });
      }
    }
  }

  if (moveIds.includes("sales.s01" as MoveId)) {
    const oppPrice = state.playersPublic[slot === "A" ? "B" : "A"].currentPrice;
    lines.push({
      kind: "delayed",
      text: `Opponent is at ${oppPrice}¢ — allocation shifts after lock.`,
    });
  }

  return lines;
}
