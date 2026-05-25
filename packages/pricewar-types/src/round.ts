import type { PlayerSlot } from "./match";

export interface RoundReport {
  round: number;
  publicSummary: string;
  publicEvents: Array<{
    description: string;
    impact: "neutral" | "positive" | "negative";
  }>;
  privateSummary: {
    A: string;
    B: string;
  };
  deltas: {
    A: {
      cashDelta: number;
      demandSatisfied: number;
      reputationDelta: number;
      moraleDelta: number;
    };
    B: {
      cashDelta: number;
      demandSatisfied: number;
      reputationDelta: number;
      moraleDelta: number;
    };
  };
}

export type { PlayerSlot };
