import type { HistoryMatch } from "./history-match";
import { formatMatchClock, getHistoryMatchHref, isActiveHistoryMatch } from "./history-match";

export type KanbanColumn = "up-next" | "submitted" | "waiting";

/** Phase-1 column bucketing from history fields only. */
export function classifyKanbanColumn(match: HistoryMatch): KanbanColumn {
  switch (match.phase) {
    case "report":
      return "up-next";
    case "decide":
    case "briefing":
      return "up-next";
    case "resolving":
      return "submitted";
    case "waiting_for_opponent":
      return "waiting";
    default:
      return "waiting";
  }
}

export type KanbanCardKind = "result" | "your-turn" | "submitted" | "waiting";

export function kanbanCardKind(match: HistoryMatch): KanbanCardKind {
  if (match.phase === "report") return "result";
  if (match.phase === "decide" || match.phase === "briefing") return "your-turn";
  if (match.phase === "resolving") return "submitted";
  return "waiting";
}

export function kanbanTimerLabel(match: HistoryMatch): string {
  if (match.phase === "report") return "view now";
  if (match.phase === "resolving") return "resolving";
  if (match.remainingMs != null) return formatMatchClock(match.remainingMs);
  return "—";
}

export function kanbanActionLabel(kind: KanbanCardKind): string | null {
  if (kind === "result") return "See result →";
  if (kind === "your-turn") return "Take turn";
  return null;
}

export function kanbanMatchesByColumn(matches: HistoryMatch[]) {
  const active = matches.filter(isActiveHistoryMatch);
  const cols: Record<KanbanColumn, HistoryMatch[]> = {
    "up-next": [],
    submitted: [],
    waiting: [],
  };
  for (const m of active) {
    cols[classifyKanbanColumn(m)].push(m);
  }
  return cols;
}

export { getHistoryMatchHref };
