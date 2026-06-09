import { toPlayerView } from "@adamsaxion/pricewar-engine";
import type { MatchId, MatchState, PlayerSlot, PlayerView } from "@adamsaxion/pricewar-types";
import { getOpponentPresentation, getSubmission } from "./repository";

/** Player view plus the server-enriched opponent metadata the client renders. */
export type EnrichedPlayerView = PlayerView & {
  opponentRating?: number | null;
  syntheticOpponentId?: string | null;
};

/**
 * Apply opponent-identity masking + presentation enrichment so that every code
 * path (GET /view, POST /submit response, SSE payloads) produces an identical
 * view shape. Without this, views pushed over SSE would leak `isBot` and drop
 * the opponent rating that the canonical /view response exposes.
 */
export async function enrichOpponentView(
  matchId: MatchId,
  slot: PlayerSlot,
  view: PlayerView,
  options?: { debug?: boolean }
): Promise<EnrichedPlayerView> {
  const presentation = await getOpponentPresentation(matchId, slot);
  if (!options?.debug) {
    view.opponent = { ...view.opponent, isBot: false };
  }
  return {
    ...view,
    opponentRating: presentation?.ratingAtStart ?? null,
    syntheticOpponentId: presentation?.syntheticOpponentId ?? null,
  };
}

/** Build the masked, enriched player view for `slot`, including lock flags. */
export async function buildPlayerView(
  matchId: MatchId,
  slot: PlayerSlot,
  state: MatchState,
  options?: { debug?: boolean }
): Promise<EnrichedPlayerView> {
  const round = state.market.currentRound;
  const otherSlot: PlayerSlot = slot === "A" ? "B" : "A";
  const mySubmission = await getSubmission(matchId, round, slot);
  const opponentSubmission = await getSubmission(matchId, round, otherSlot);
  const view = toPlayerView(state, slot, {
    opponentHasLocked: Boolean(opponentSubmission),
    meHasLocked: Boolean(mySubmission),
  });
  return enrichOpponentView(matchId, slot, view, options);
}
