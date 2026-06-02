/** Human PvP match where Elo is tracked (see finalizeMatchRatings). */
export function isRatedMatchContext(args: {
  playModeId: string;
  opponentIsBot: boolean;
}): boolean {
  if (args.playModeId === "tutorial") return false;
  if (args.opponentIsBot) return false;
  return true;
}

/** Whether the UI may show this player's own rating / rank (paid + rated flag on client). */
export function canShowOwnRating(isPaid: boolean, ratedEnabled: boolean): boolean {
  return isPaid && ratedEnabled;
}

export function isHistoryMatchRated(m: {
  phase: string;
  ratingDelta: number | null;
  playModeId?: string;
}): boolean {
  return m.phase === "completed" && m.ratingDelta != null;
}
