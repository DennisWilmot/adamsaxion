import type { PlayerView } from "@adamsaxion/pricewar-types";

export function getMatchEndPath(matchId: string, view: PlayerView): string {
  if (view.phase !== "completed") {
    return `/play/match/${matchId}/decide`;
  }

  if (view.outcome.kind === "win") {
    const lost = view.outcome.winner !== view.me.slot;
    if (lost && view.outcome.reason === "bankruptcy") {
      return `/play/match/${matchId}/bankruptcy`;
    }
    if (
      lost &&
      (view.outcome.reason === "forfeit_on_abandonment" ||
        view.outcome.reason === "forfeit_on_timeout")
    ) {
      return `/play/match/${matchId}/abandoned`;
    }
  }

  return `/play/match/${matchId}/postmatch`;
}
