import type { PlayerView } from "@adamsaxion/pricewar-types";
import { priceWarPaths } from "@/lib/games/routes";

/** Terminal screen when `phase === "completed"`. */
export function getMatchEndPath(matchId: string, view: PlayerView): string {
  if (view.phase !== "completed") {
    return priceWarPaths.match.decide(matchId);
  }

  if (view.outcome.kind === "win") {
    const lost = view.outcome.winner !== view.me.slot;
    if (lost && view.outcome.reason === "bankruptcy") {
      return priceWarPaths.match.bankruptcy(matchId);
    }
    if (
      lost &&
      (view.outcome.reason === "forfeit_on_abandonment" ||
        view.outcome.reason === "forfeit_on_timeout")
    ) {
      return priceWarPaths.match.abandoned(matchId);
    }
  }

  return priceWarPaths.match.postmatch(matchId);
}

/** Canonical route for the match's current server phase. */
export function getMatchPhasePath(matchId: string, view: PlayerView): string {
  switch (view.phase) {
    case "waiting_for_opponent":
      return priceWarPaths.match.decide(matchId);
    case "briefing":
      return priceWarPaths.match.briefing(matchId);
    case "decide":
    case "resolving":
      return priceWarPaths.match.decide(matchId);
    case "report": {
      const reportRound = view.market.lastResolvedRound ?? view.market.currentRound;
      return priceWarPaths.match.report(matchId, reportRound);
    }
    case "completed":
      return getMatchEndPath(matchId, view);
    default:
      return priceWarPaths.match.decide(matchId);
  }
}

const TERMINAL_SEGMENTS = ["/postmatch", "/bankruptcy", "/abandoned"] as const;

/** True when pathname is a decide-phase sub-route (review, waiting, briefing). */
export function isDecideSubRoute(pathname: string): boolean {
  return (
    pathname.includes("/review") ||
    pathname.includes("/waiting") ||
    pathname.includes("/briefing")
  );
}

/** Whether the client should redirect away from the current pathname for this view. */
export function shouldRedirectToPhasePath(pathname: string, view: PlayerView): boolean {
  if (view.phase === "report" && !pathname.includes("/report/")) {
    return true;
  }
  if (view.phase === "completed") {
    const onTerminal = TERMINAL_SEGMENTS.some((seg) => pathname.includes(seg));
    return !onTerminal;
  }
  if (view.phase === "decide" && pathname.includes("/report/")) {
    return true;
  }
  return false;
}
