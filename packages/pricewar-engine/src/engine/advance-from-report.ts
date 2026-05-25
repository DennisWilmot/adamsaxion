import type { MatchState } from "@adamsaxion/pricewar-types";

/** Host calls this when the player leaves the report screen for the next decide phase. */
export function advanceFromReportToDecide(state: MatchState): MatchState {
  if (state.phase !== "report") return state;

  const next = structuredClone(state);
  const resolvedRound = next.market.lastResolvedRound ?? next.market.currentRound;

  if (resolvedRound >= next.market.totalRounds) {
    return next;
  }

  next.market.currentRound = resolvedRound + 1;
  next.phase = "decide";
  next.updatedAt = new Date(0).toISOString();
  return next;
}
