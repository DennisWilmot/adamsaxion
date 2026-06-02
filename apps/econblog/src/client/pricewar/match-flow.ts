import type { PlayerView } from "@adamsaxion/pricewar-types";
import { shouldRedirectToPhasePath } from "./match-routing";

/** User-visible copy while async work is in flight. */
export const MATCH_LOADING = {
  view: "Loading match…",
  briefing: "Loading briefing…",
  starting: "Starting Round 1…",
  decide: "Loading round…",
  review: "Loading review…",
  submitting: "Locking your moves…",
  waiting: "Waiting for opponent…",
  resolving: "Resolving the round…",
  report: "Loading round report…",
  continuing: "Preparing next round…",
  postmatch: "Loading results…",
  terminal: "Loading match outcome…",
  syncing: "Syncing match…",
  lobby: "Starting match…",
  queue: "Finding a game…",
  playAgain: "Finding a game…",
} as const;

export type MatchFlowGate = {
  id: string;
  screen: string;
  trigger: string;
  api?: string;
  next: string;
  loadingMessage: (typeof MATCH_LOADING)[keyof typeof MATCH_LOADING];
};

/**
 * Decision gates from lobby through terminal screens.
 * Order follows the happy-path player journey.
 */
export const MATCH_FLOW_GATES: MatchFlowGate[] = [
  {
    id: "lobby-queue",
    screen: "Lobby",
    trigger: "Play",
    api: "POST /api/pricewar/matchmaking/queue",
    next: "Queue or match briefing",
    loadingMessage: MATCH_LOADING.queue,
  },
  {
    id: "queue-match",
    screen: "Queue",
    trigger: "Poll until matched",
    api: "GET /api/pricewar/matchmaking/status",
    next: "Briefing",
    loadingMessage: MATCH_LOADING.queue,
  },
  {
    id: "briefing-begin",
    screen: "Briefing",
    trigger: "Begin Round 1",
    api: "POST /api/pricewar/match/[id]/start",
    next: "Decide",
    loadingMessage: MATCH_LOADING.starting,
  },
  {
    id: "decide-review",
    screen: "Decide",
    trigger: "Review & lock",
    next: "Review",
    loadingMessage: MATCH_LOADING.review,
  },
  {
    id: "review-submit",
    screen: "Review",
    trigger: "Confirm lock",
    api: "POST /api/pricewar/match/[id]/submit",
    next: "Waiting, Report, or terminal",
    loadingMessage: MATCH_LOADING.submitting,
  },
  {
    id: "waiting-resolve",
    screen: "Waiting",
    trigger: "Opponent submits / SSE round_resolved",
    api: "GET /api/pricewar/match/[id]/events",
    next: "Report",
    loadingMessage: MATCH_LOADING.resolving,
  },
  {
    id: "report-continue",
    screen: "Report",
    trigger: "Continue to next round",
    api: "POST /api/pricewar/match/[id]/continue",
    next: "Decide or Post-match",
    loadingMessage: MATCH_LOADING.continuing,
  },
  {
    id: "phase-sync",
    screen: "Any match route",
    trigger: "View phase ≠ current URL",
    next: "Canonical phase route",
    loadingMessage: MATCH_LOADING.syncing,
  },
  {
    id: "postmatch-play-again",
    screen: "Post-match",
    trigger: "Play again",
    api: "POST /api/pricewar/matchmaking/queue",
    next: "Queue or Briefing",
    loadingMessage: MATCH_LOADING.playAgain,
  },
];

/** Loading copy while the client redirects to the server phase route. */
export function getPhaseSyncLoadingMessage(
  pathname: string,
  view: PlayerView
): string | null {
  if (!shouldRedirectToPhasePath(pathname, view)) {
    return null;
  }

  switch (view.phase) {
    case "briefing":
      return MATCH_LOADING.briefing;
    case "report":
      return MATCH_LOADING.report;
    case "completed":
      return MATCH_LOADING.postmatch;
    case "decide":
    case "resolving":
      return pathname.includes("/review")
        ? MATCH_LOADING.review
        : MATCH_LOADING.decide;
    default:
      return MATCH_LOADING.syncing;
  }
}

/** True when pathname is valid for the current phase (no redirect needed). */
export function isOnPhasePath(pathname: string, view: PlayerView): boolean {
  return !shouldRedirectToPhasePath(pathname, view);
}
