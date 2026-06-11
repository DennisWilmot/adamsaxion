import type { MatchState } from "@adamsaxion/pricewar-types";
import { getSim, writeSim } from "../simulation/player-sim";

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
  for (const slot of ["A", "B"] as const) {
    const sim = getSim(next, slot);
    if (sim.flashSaleOriginalPriceCents != null && sim.flashSaleActiveRound != null && sim.flashSaleActiveRound <= resolvedRound) {
      next.playersPublic[slot].currentPrice = sim.flashSaleOriginalPriceCents;
      sim.flashSaleOriginalPriceCents = null;
      writeSim(next.playersPrivate[slot], sim);
    }
  }
  next.updatedAt = new Date(0).toISOString();
  return next;
}
