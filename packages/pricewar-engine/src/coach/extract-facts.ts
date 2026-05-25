import type { EngineEvent, MatchState, PlayerSlot } from "@adamsaxion/pricewar-types";

export interface MatchFacts {
  matchId: string;
  outcome: { winner: PlayerSlot | "draw"; reason: string };
  finalCash: Record<PlayerSlot, number>;
  turningPoints: Array<{
    round: number;
    description: string;
    impactScore: number;
  }>;
  bestMoves: Record<PlayerSlot, { round: number; moveId: string } | null>;
  worstMoves: Record<PlayerSlot, { round: number; moveId: string } | null>;
}

export function extractFacts(
  state: MatchState,
  events: EngineEvent[]
): MatchFacts {
  const turningPoints: MatchFacts["turningPoints"] = [];

  for (const event of events) {
    if (event.type === "demand_calculated") {
      const aShare = event.allocated.A;
      const bShare = event.allocated.B;
      const total = event.total || 1;
      const aPct = Math.round((aShare / total) * 100);
      turningPoints.push({
        round: findRoundForEvent(events, event.t),
        description: `Demand split ${aPct}% / ${100 - aPct}% between players.`,
        impactScore: aShare - bShare,
      });
    }
    if (event.type === "finance_settled") {
      turningPoints.push({
        round: findRoundForEvent(events, event.t),
        description: `Player ${event.player} ended the round with $${event.cashAfter.toLocaleString()} cash.`,
        impactScore: event.player === "A" ? 1 : -1,
      });
    }
  }

  const outcome =
    state.outcome.kind === "win"
      ? {
          winner: state.outcome.winner,
          reason: state.outcome.reason,
        }
      : { winner: "draw" as const, reason: "draw" };

  return {
    matchId: state.matchId,
    outcome,
    finalCash: {
      A: state.playersPrivate.A.cash,
      B: state.playersPrivate.B.cash,
    },
    turningPoints: turningPoints.slice(0, 5),
    bestMoves: { A: null, B: null },
    worstMoves: { A: null, B: null },
  };
}

function findRoundForEvent(events: EngineEvent[], t: number): number {
  let round = 1;
  for (const event of events) {
    if (event.t > t) break;
    if (event.type === "round_started") round = event.round;
  }
  return round;
}
