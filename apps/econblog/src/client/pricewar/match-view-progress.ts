import type { PlayerView } from "@adamsaxion/pricewar-types";

/**
 * Monotonic progress rank for a match view. Higher = further along the match.
 * Used to reject stale views (e.g. an in-flight `/view` poll that read
 * pre-resolution data and lands after the SSE update) so displayed values never
 * bounce backwards (old → new → old) during a reveal.
 *
 * Ordering within a round: briefing < decide(neither) < decide(opp-locked) <
 * decide(me-locked) < decide(both) < resolving < report < completed. Lock flags
 * are part of the rank so an in-flight poll that read a pre-lock snapshot can't
 * un-lock a player on a tie (which showed up as "opponent is deciding" flashing
 * back after both had locked). Across rounds, `currentRound` dominates so
 * advancing to the next round is always forward progress.
 */
function phaseRank(view: PlayerView): number {
  switch (view.phase) {
    case "waiting_for_opponent":
      return 0;
    case "briefing":
      return 1;
    case "decide":
      if (view.meHasLocked && view.opponentHasLocked) return 5;
      if (view.meHasLocked) return 4;
      if (view.opponentHasLocked) return 3;
      return 2;
    case "resolving":
      return 6;
    case "report":
      return 7;
    case "completed":
      return 8;
    default:
      return 0;
  }
}

export function viewProgress(view: PlayerView): number {
  return view.market.currentRound * 100 + phaseRank(view);
}

/**
 * Returns the view that should win when reconciling an incoming update against
 * the currently-cached view. Equal progress keeps the incoming value (so
 * same-phase updates like "opponent locked" still apply); strictly older
 * incoming values are rejected in favor of the cached one.
 */
export function pickNewerView<T extends PlayerView>(
  prev: T | undefined,
  incoming: T
): T {
  if (!prev) return incoming;
  return viewProgress(incoming) >= viewProgress(prev) ? incoming : prev;
}
