import type { PlayerView } from "@adamsaxion/pricewar-types";
import { logMarginShellGroup } from "./margin-shell-debug";
import {
  getReportRoundFromPath,
  isMatchRootPath,
  isMatchSessionPath,
  isTerminalMatchPath,
  panelFromMatchPath,
} from "./match-shell-paths";
import { getMatchEndPath, getMatchPhasePath, shouldRedirectToPhasePath } from "./match-routing";

export function explainPhaseRedirect(pathname: string, matchId: string, view: PlayerView | null) {
  const pathPanel = panelFromMatchPath(pathname);
  const reportRound = getReportRoundFromPath(pathname);

  if (!view) {
    return {
      pathname,
      matchId,
      viewLoaded: false,
      pathPanel,
      reportRound,
      isTerminalPath: isTerminalMatchPath(pathname),
      isMatchSessionPath: isMatchSessionPath(pathname),
      isMatchRootPath: isMatchRootPath(pathname),
      shouldRedirect: false,
      redirectTarget: null,
      redirectReason: "view not loaded",
    };
  }

  const shouldRedirect = shouldRedirectToPhasePath(pathname, view);
  let redirectReason = "path matches phase";

  if (isTerminalMatchPath(pathname)) {
    if (view.phase === "completed") {
      const canonical = getMatchEndPath(matchId, view);
      redirectReason =
        pathname === canonical ? "canonical terminal path" : "wrong terminal path";
    } else {
      redirectReason = "on terminal path (view not completed)";
    }
  } else if (view.phase === "completed") {
    redirectReason = "phase completed → canonical terminal";
  } else if (pathPanel === "review" && view.phase === "decide" && !view.meHasLocked) {
    redirectReason = "review allowed during decide";
  } else if (
    pathPanel === "waiting" &&
    (view.meHasLocked || view.phase === "resolving")
  ) {
    redirectReason = "waiting allowed while locked/resolving";
  } else if (pathPanel === "waiting") {
    redirectReason = "waiting path invalid for current phase";
  } else if (pathPanel === "briefing" && view.phase === "briefing") {
    redirectReason = "briefing allowed";
  } else if (pathPanel === "decide" && view.phase === "decide" && !view.meHasLocked) {
    redirectReason = "decide path allowed";
  } else if (pathPanel === "report" && view.phase === "report") {
    const resolvedRound = view.market.lastResolvedRound ?? view.market.currentRound;
    redirectReason =
      reportRound != null && reportRound === resolvedRound
        ? "report round matches view"
        : "report round stale";
  } else if (pathPanel != null) {
    redirectReason = `sub-route "${pathPanel}" invalid for phase "${view.phase}"`;
  } else if (isMatchRootPath(pathname) && view.phase === "briefing" && view.playModeId !== "tutorial") {
    redirectReason = "match root → briefing";
  } else if (isMatchRootPath(pathname) && (view.meHasLocked || view.phase === "resolving")) {
    redirectReason = "match root → waiting while locked";
  } else if (isMatchRootPath(pathname)) {
    redirectReason = "match root ok";
  } else {
    redirectReason = "unknown path";
  }

  return {
    pathname,
    matchId,
    viewLoaded: true,
    phase: view.phase,
    meHasLocked: view.meHasLocked,
    currentRound: view.market.currentRound,
    lastResolvedRound: view.market.lastResolvedRound,
    pathPanel,
    reportRound,
    isTerminalPath: isTerminalMatchPath(pathname),
    isMatchSessionPath: isMatchSessionPath(pathname),
    isMatchRootPath: isMatchRootPath(pathname),
    shouldRedirect,
    redirectTarget: shouldRedirect ? getMatchPhasePath(matchId, view) : null,
    redirectReason,
  };
}

export function logPhaseRedirect(
  area: string,
  pathname: string,
  matchId: string,
  view: PlayerView | null,
  extra?: Record<string, unknown>
): void {
  logMarginShellGroup(area, "phase redirect check", {
    ...explainPhaseRedirect(pathname, matchId, view),
    ...extra,
  });
}
