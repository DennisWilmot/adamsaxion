import type { PlayerView } from "@adamsaxion/pricewar-types";

/** Player view plus server-enriched opponent metadata (not in engine types). */
export type MarginMatchView = PlayerView & {
  opponentRating?: number | null;
  syntheticOpponentId?: string | null;
};
