import type { MatchState, PlayerSlot } from "@adamsaxion/pricewar-types";
import type { PlayerView } from "@adamsaxion/pricewar-types";

export function toPlayerView(
  state: MatchState,
  slot: PlayerSlot,
  options?: { opponentHasLocked?: boolean }
): PlayerView {
  const other: PlayerSlot = slot === "A" ? "B" : "A";

  return {
    matchId: state.matchId,
    scenarioId: state.scenarioId,
    playModeId: state.playModeId,
    phase: state.phase,
    outcome: state.outcome,
    market: state.market,
    me: {
      ...state.playersPublic[slot],
      ...state.playersPrivate[slot],
      slot,
    },
    opponent: state.playersPublic[other],
    myClockMs: state.clocks[slot].remainingMs,
    opponentClockMs: state.clocks[other].remainingMs,
    opponentHasLocked: options?.opponentHasLocked ?? false,
  };
}
