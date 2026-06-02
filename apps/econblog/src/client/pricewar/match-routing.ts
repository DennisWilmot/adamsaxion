import type { PlayerView } from "@adamsaxion/pricewar-types";
import { priceWarPaths } from "@/lib/games/routes";
import {
  getReportRoundFromPath,
  isMatchRootPath,
  isTerminalMatchPath,
  panelFromMatchPath,
  TERMINAL_MATCH_SEGMENTS,
} from "./match-shell-paths";

export { TERMINAL_MATCH_SEGMENTS as TERMINAL_SEGMENTS, isMatchRootPath };

/** Terminal screen when `phase === "completed"`. */
export function getMatchEndPath(matchId: string, view: PlayerView): string {
  if (view.phase !== "completed") {
    return priceWarPaths.match.root(matchId);
  }

  if (view.outcome.kind === "win") {
    const iWon = view.outcome.winner === view.me.slot;
    const { reason } = view.outcome;

    if (!iWon && reason === "bankruptcy") {
      return priceWarPaths.match.bankruptcy(matchId);
    }

    if (iWon && reason === "forfeit_on_abandonment") {
      return priceWarPaths.match.abandoned(matchId);
    }
  }

  return priceWarPaths.match.postmatch(matchId);
}

/** Canonical route for the match's current server phase. */
export function getMatchPhasePath(matchId: string, view: PlayerView): string {
  switch (view.phase) {
    case "waiting_for_opponent":
      return priceWarPaths.match.root(matchId);
    case "briefing":
      return view.playModeId === "tutorial"
        ? priceWarPaths.match.root(matchId)
        : priceWarPaths.match.briefing(matchId);
    case "decide":
      return priceWarPaths.match.root(matchId);
    case "resolving":
      return priceWarPaths.match.waiting(matchId);
    case "report": {
      const round = view.market.lastResolvedRound ?? view.market.currentRound;
      return priceWarPaths.match.report(matchId, round);
    }
    case "completed":
      return getMatchEndPath(matchId, view);
    default:
      return priceWarPaths.match.root(matchId);
  }
}

/** True when pathname is a decide-phase sub-route (review, waiting, briefing). */
export function isDecideSubRoute(pathname: string): boolean {
  return (
    pathname.includes("/review") ||
    pathname.includes("/waiting") ||
    pathname.includes("/briefing")
  );
}

/** True when pathname is the report screen for the latest resolved round. */
export function isActiveReportPath(pathname: string, view: PlayerView): boolean {
  if (panelFromMatchPath(pathname) !== "report") return false;
  const reportRound = getReportRoundFromPath(pathname);
  const resolvedRound = view.market.lastResolvedRound ?? view.market.currentRound;
  return reportRound != null && reportRound === resolvedRound;
}

/** Whether the client should redirect away from the current pathname for this view. */
export function shouldRedirectToPhasePath(pathname: string, view: PlayerView): boolean {
  if (view.phase === "completed") {
    const canonical = getMatchEndPath(view.matchId, view);
    if (isTerminalMatchPath(pathname)) {
      return pathname !== canonical;
    }
    return true;
  }

  if (isTerminalMatchPath(pathname)) {
    return false;
  }

  const pathPanel = panelFromMatchPath(pathname);

  if (pathPanel === "review" && view.phase === "decide" && !view.meHasLocked) {
    return false;
  }
  if (
    pathPanel === "waiting" &&
    (view.meHasLocked || view.phase === "resolving" || view.phase === "decide")
  ) {
    return view.meHasLocked || view.phase === "resolving" ? false : true;
  }
  if (pathPanel === "briefing" && view.phase === "briefing") {
    return false;
  }
  if (pathPanel === "decide" && view.phase === "decide" && !view.meHasLocked) {
    return false;
  }
  if (isActiveReportPath(pathname, view)) {
    return false;
  }
  if (panelFromMatchPath(pathname) === "report") {
    return true;
  }

  if (pathPanel != null) {
    return true;
  }

  if (isMatchRootPath(pathname)) {
    if (view.meHasLocked || view.phase === "resolving") {
      return true;
    }
    if (view.phase === "briefing" && view.playModeId !== "tutorial") {
      return true;
    }
    return false;
  }

  return false;
}
