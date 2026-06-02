import type { HistoryMatch } from "./history-match";
import {
  buildCoachInsight,
  didLoseHistoryMatch,
  didWinHistoryMatch,
  formatBattleDetail,
  formatRelativeTime,
  getLastCompletedMatch,
  getHistoryMatchHref,
  isActiveHistoryMatch,
  playModeLabel,
} from "./history-match";

export type { HistoryMatch };
export {
  buildCoachInsight,
  formatBattleDetail,
  formatRelativeTime,
  getLastCompletedMatch,
  getHistoryMatchHref,
  isActiveHistoryMatch,
  playModeLabel,
  didWinHistoryMatch,
  didLoseHistoryMatch,
};

export type LobbyPresence = {
  onlineNow: number;
  blitzQueue: number;
  rapidQueue: number;
  avgWaitSec: number;
};

export function computeLobbyStats(matches: HistoryMatch[]) {
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let streakType: "win" | "loss" | null = null;

  for (const m of matches) {
    if (m.phase !== "completed") continue;
    const won = didWinHistoryMatch(m);
    if (won) wins++;
    else if (didLoseHistoryMatch(m)) losses++;

    if (streakType === null) {
      streakType = won ? "win" : "loss";
      streak = 1;
    } else if ((won && streakType === "win") || (!won && streakType === "loss")) {
      streak++;
    } else {
      break;
    }
  }

  return {
    wins,
    losses,
    streak: streakType === "win" ? streak : 0,
  };
}
