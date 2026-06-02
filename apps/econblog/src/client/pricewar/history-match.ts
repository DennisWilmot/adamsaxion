import type { MatchPhase, PlayerSlot, PlayerView } from "@adamsaxion/pricewar-types";
import { getMatchEndPath, getMatchPhasePath } from "@/client/pricewar/match-routing";
import { priceWarPaths } from "@/lib/games/routes";

export interface HistoryMatch {
  matchId: string;
  phase: string;
  playModeId: string;
  outcomeKind: string;
  outcomeReason: string | null;
  outcomeWinnerSlot?: string | null;
  ratingDelta: number | null;
  updatedAt: string;
  slot?: "A" | "B";
  currentRound?: number;
  totalRounds?: number;
  lastResolvedRound?: number;
  remainingMs?: number | null;
  opponentName?: string;
  opponentIsBot?: boolean;
  myCash?: number;
}

const ACTIVE_PHASES = new Set([
  "waiting_for_opponent",
  "briefing",
  "decide",
  "resolving",
  "report",
]);

export function isActiveHistoryMatch(m: HistoryMatch): boolean {
  return ACTIVE_PHASES.has(m.phase);
}

export function formatMatchClock(ms: number | null | undefined): string {
  if (ms == null) return "—";
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case "briefing":
      return "Briefing";
    case "decide":
      return "Your turn";
    case "resolving":
      return "Resolving";
    case "report":
      return "Round report";
    case "waiting_for_opponent":
      return "Waiting";
    default:
      return phase.replaceAll("_", " ");
  }
}

export function formatHistoryMatchSubtitle(m: HistoryMatch): string {
  if (m.phase === "completed") {
    if (m.outcomeKind === "draw") return "Draw";

    const won = didWinHistoryMatch(m);
    const lost = didLoseHistoryMatch(m);
    const result = won ? "Win" : lost ? "Loss" : "Completed";
    const reason = formatOutcomeReason(m, won);
    return reason ? `${result} · ${reason}` : result;
  }

  const round = m.currentRound ?? 1;
  const total = m.totalRounds ?? 8;
  const parts = [
    `Round ${round}/${total}`,
    phaseLabel(m.phase),
  ];

  if (m.opponentName) {
    parts.push(`vs ${m.opponentName}`);
  }
  if (m.remainingMs != null) {
    parts.push(`${formatMatchClock(m.remainingMs)} on clock`);
  }
  if (m.myCash != null) {
    parts.push(`$${m.myCash.toLocaleString()}`);
  }

  return parts.join(" · ");
}

function formatOutcomeReason(m: HistoryMatch, won: boolean): string {
  switch (m.outcomeReason) {
    case "forfeit_on_abandonment":
      return won ? "opponent left" : "disconnected";
    case "forfeit_on_timeout":
      return won ? "opponent timed out" : "timed out";
    case "bankruptcy":
      return "bankruptcy";
    case "victory_points":
      return "most cash";
    default:
      return m.outcomeReason?.replaceAll("_", " ") ?? "";
  }
}

function matchOutcomeForHistory(m: HistoryMatch): PlayerView["outcome"] {
  if (m.phase !== "completed") return { kind: "in_progress" };
  if (m.outcomeKind === "draw") return { kind: "draw" };
  if (m.outcomeKind === "win" && m.outcomeWinnerSlot) {
    return {
      kind: "win",
      winner: m.outcomeWinnerSlot as PlayerSlot,
      reason: (m.outcomeReason ?? "victory_points") as
        | "victory_points"
        | "bankruptcy"
        | "forfeit_on_timeout"
        | "forfeit_on_abandonment",
    };
  }
  return { kind: "in_progress" };
}

export function didWinHistoryMatch(m: HistoryMatch): boolean {
  return (
    m.phase === "completed" &&
    m.outcomeKind === "win" &&
    m.outcomeWinnerSlot != null &&
    m.outcomeWinnerSlot === m.slot
  );
}

export function didLoseHistoryMatch(m: HistoryMatch): boolean {
  return (
    m.phase === "completed" &&
    m.outcomeKind === "win" &&
    m.outcomeWinnerSlot != null &&
    m.outcomeWinnerSlot !== m.slot
  );
}

function minimalViewForHistory(m: HistoryMatch): PlayerView {
  return {
    matchId: m.matchId,
    scenarioId: "coffee-shop",
    playModeId: m.playModeId,
    phase: m.phase as MatchPhase,
    outcome: matchOutcomeForHistory(m),
    market: {
      currentRound: m.currentRound ?? 1,
      lastResolvedRound: m.lastResolvedRound ?? 0,
      totalRounds: m.totalRounds ?? 8,
      marketDemandIndex: 50,
      weatherIndex: 0,
      eventLog: [],
    },
    me: {
      slot: m.slot ?? "A",
      displayName: "You",
      currentPrice: 450,
      brandTier: 2,
      isBot: false,
      cash: m.myCash ?? 500,
      inventory: 200,
      staffCount: 3,
      reputation: 30,
      morale: 70,
      activePolicies: [],
      activeConditions: [],
    },
    opponent: {
      slot: m.slot === "A" ? "B" : "A",
      displayName: m.opponentName ?? "Opponent",
      currentPrice: 450,
      brandTier: 2,
      isBot: false,
    },
    myClockMs: m.remainingMs ?? 0,
    myClockTickingSince: null,
    opponentClockMs: 0,
    opponentHasLocked: false,
    meHasLocked: false,
  };
}

export function getHistoryMatchHref(m: HistoryMatch): string {
  if (isActiveHistoryMatch(m)) {
    return priceWarPaths.match.root(m.matchId);
  }
  if (m.phase === "completed") {
    return getMatchEndPath(m.matchId, minimalViewForHistory(m));
  }
  return getMatchPhasePath(m.matchId, minimalViewForHistory(m));
}

export function playModeLabel(playModeId: string): string {
  switch (playModeId) {
    case "blitz":
      return "Blitz 5+0";
    case "rapid":
      return "Rapid 15+0";
    case "tutorial":
      return "Tutorial";
    default:
      return playModeId;
  }
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function formatBattleDetail(m: HistoryMatch): string {
  if (m.phase !== "completed") {
    return formatHistoryMatchSubtitle(m);
  }

  const parts: string[] = [playModeLabel(m.playModeId)];

  if (m.outcomeReason === "forfeit_on_abandonment") {
    parts.push(didWinHistoryMatch(m) ? "Opponent left" : "Disconnected");
  } else if (m.outcomeReason === "forfeit_on_timeout") {
    parts.push(didWinHistoryMatch(m) ? "Opponent timed out" : "Clock expired");
  } else if (m.outcomeReason === "bankruptcy") {
    parts.push("Bankruptcy");
  } else if (m.outcomeReason === "victory_points") {
    parts.push("Final cash");
  }

  return parts.join(" · ");
}

export function getLastCompletedMatch(matches: HistoryMatch[]): HistoryMatch | null {
  return matches.find((m) => m.phase === "completed") ?? null;
}

export function buildCoachInsight(matches: HistoryMatch[]): {
  headline: string;
  body: string;
  reviewHref: string | null;
} {
  const last = getLastCompletedMatch(matches);
  if (!last) {
    return {
      headline: "Prof. Aldo · Coach insight",
      body: "Your first match will teach you more than any tip. Start with Blitz and watch how your opponent reacts to price moves.",
      reviewHref: null,
    };
  }

  const lost = didLoseHistoryMatch(last);
  const reviewHref = getHistoryMatchHref(last);

  if (lost && last.outcomeReason === "forfeit_on_abandonment") {
    return {
      headline: "Prof. Aldo noticed a pattern",
      body: "Staying in the match matters. Even when you're behind on cash, finishing rounds teaches you how opponents respond under pressure.",
      reviewHref,
    };
  }

  if (lost) {
    return {
      headline: "Prof. Aldo noticed a pattern",
      body: "You undercut too often after losing the first round. Try charging more once and watch the response.",
      reviewHref,
    };
  }

  return {
    headline: "Prof. Aldo · Keep the pressure",
    body: "You won by reading the room, not just matching price. Review what worked before your next opponent adapts.",
    reviewHref,
  };
}
