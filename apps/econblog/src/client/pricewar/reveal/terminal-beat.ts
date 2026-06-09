import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { SoundCue } from "@/client/pricewar/audio/cues";

export type TerminalCause =
  | "timeout"
  | "bankruptcy"
  | "abandonment"
  | "forfeit"
  | "completion"
  | "draw";

export type TerminalResult = "win" | "loss" | "draw";

export type TerminalBeat = {
  cause: TerminalCause;
  result: TerminalResult;
  /** Short stamp shown in the trigger beat, e.g. "TIME'S UP". */
  stamp: string;
  /** One-line headline for the trigger beat. */
  headline: string;
  /** Accent tone for the beat visuals. */
  tone: "win" | "loss" | "neutral";
  /** Cue played on the trigger beat. */
  triggerCue: SoundCue;
  /** Cue played as the beat resolves into the end screen. */
  resolveCue: SoundCue;
  /** Whether this ending is dramatic (gets the full beat) or quiet (forfeit). */
  dramatic: boolean;
};

/**
 * Derives the per-cause terminal beat from a completed match's outcome, framed
 * from the viewer's perspective. Returns null if the match isn't terminal.
 */
export function deriveTerminalBeat(view: PlayerView): TerminalBeat | null {
  if (view.phase !== "completed") return null;
  const outcome = view.outcome;
  const opp = view.opponent.displayName.split(" ")[0] ?? "Opponent";

  if (outcome.kind === "draw") {
    return {
      cause: "draw",
      result: "draw",
      stamp: "DEAD HEAT",
      headline: "The match ends level.",
      tone: "neutral",
      triggerCue: "draw",
      resolveCue: "draw",
      dramatic: true,
    };
  }

  if (outcome.kind !== "win") return null;
  const iWon = outcome.winner === view.me.slot;
  const result: TerminalResult = iWon ? "win" : "loss";
  const tone: "win" | "loss" = iWon ? "win" : "loss";

  switch (outcome.reason) {
    case "forfeit_on_timeout":
      return {
        cause: "timeout",
        result,
        stamp: "TIME'S UP",
        headline: iWon ? `${opp} ran out of time.` : "You ran out of time.",
        tone,
        triggerCue: "clock.expire",
        resolveCue: iWon ? "match.win" : "match.lose",
        dramatic: true,
      };
    case "bankruptcy":
      return {
        cause: "bankruptcy",
        result,
        stamp: "BANKRUPT",
        headline: iWon ? `${opp} went bankrupt.` : "You went bankrupt.",
        tone,
        triggerCue: "cash.drain",
        resolveCue: iWon ? "match.win" : "match.lose",
        dramatic: true,
      };
    case "forfeit_on_abandonment":
      if (iWon) {
        return {
          cause: "abandonment",
          result,
          stamp: "OPPONENT LEFT",
          headline: `${opp} left the match.`,
          tone,
          triggerCue: "opponent.leave",
          resolveCue: "match.win",
          dramatic: true,
        };
      }
      return {
        cause: "forfeit",
        result,
        stamp: "FORFEIT",
        headline: "You forfeited the match.",
        tone: "loss",
        triggerCue: "forfeit.confirm",
        resolveCue: "match.lose",
        dramatic: false,
      };
    case "victory_points":
    default:
      return {
        cause: "completion",
        result,
        stamp: iWon ? "MATCH WON" : "MATCH LOST",
        headline: iWon ? "You win the match." : "You lose the match.",
        tone,
        triggerCue: iWon ? "match.win" : "match.lose",
        resolveCue: iWon ? "match.win" : "match.lose",
        dramatic: true,
      };
  }
}
