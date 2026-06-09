"use client";

import { useEffect, useRef } from "react";
import { useGameAudio } from "@/client/pricewar/audio/useGameAudio";
import { useStagedReveal } from "./useStagedReveal";

export type RoundResult = "win" | "loss" | "neutral";

export type RoundReveal = {
  /** 0 = anticipation, 1 = moves revealed, 2 = consequences, 3 = verdict/done. */
  stage: number;
  /** Whether the head-to-head board should show revealed values. */
  boardReveal: boolean;
  /** Whether consequence visuals (bars/numbers) should animate in. */
  showConsequences: boolean;
  /** Whether the verdict + continue affordance should show. */
  showVerdict: boolean;
  /** True during the deliberate "opponent is deciding" dwell. */
  anticipating: boolean;
  /** Fast-forward to the settled verdict (tap-to-skip). */
  skip: () => void;
};

/**
 * Round-level presentation state machine. When the report panel appears for a
 * freshly resolved round it plays: anticipation dwell → opponent move reveal →
 * consequences → verdict, decoupled from the (already-instant) data. Replays
 * only for newly resolved rounds; revisiting an old report shows it settled.
 *
 * The verdict additionally waits for `dataReady` (the round's report payload,
 * which is fetched separately). That keeps the resolved card from appearing and
 * then popping its "what happened" content in a beat later, which resized the
 * card and threw the player off.
 */
export function useRoundReveal({
  enabled,
  resolvedRound,
  roundResult = "neutral",
  dataReady = true,
}: {
  enabled: boolean;
  resolvedRound: number;
  roundResult?: RoundResult;
  dataReady?: boolean;
}): RoundReveal {
  const { play, startLoop, stopLoop } = useGameAudio();
  const revealedRoundRef = useRef<number | null>(null);
  const startedRoundRef = useRef<number | null>(null);
  const verdictPlayedRef = useRef<number | null>(null);
  const alreadyRevealed = revealedRoundRef.current === resolvedRound;

  // Latch the reveal: once it begins for a round, keep it running through to
  // completion even if `enabled` momentarily drops (a transient route/cache
  // flicker). Without this the anticipation would restart and the board would
  // re-animate, which reads as "flickering back into decide" with the price
  // bouncing between values.
  if (enabled && !alreadyRevealed && resolvedRound > 0) {
    startedRoundRef.current = resolvedRound;
  }
  const active =
    !alreadyRevealed &&
    resolvedRound > 0 &&
    startedRoundRef.current === resolvedRound;

  const { stage, done, skip } = useStagedReveal({
    steps: [700, 450, 850],
    resetKey: resolvedRound,
    enabled: active,
    onStage: (s) => {
      if (s === 0) startLoop("opponent.thinking");
      if (s === 1) {
        stopLoop("opponent.thinking");
        play("reveal.flip");
      }
      if (s === 2) play("bar.fill");
    },
    onComplete: () => {
      stopLoop("opponent.thinking");
    },
  });

  // The verdict lands only when an active reveal's timeline has finished AND the
  // round's report data is loaded — so the resolved card renders complete, in
  // one motion. `verdictReachedNow` is the real completion edge (drives sound +
  // latch); `showVerdict` also stays true once latched.
  const verdictReachedNow = active && done && dataReady;
  const verdictShown = alreadyRevealed || verdictReachedNow;

  useEffect(() => {
    if (!verdictReachedNow || resolvedRound <= 0) return;
    if (verdictPlayedRef.current === resolvedRound) return;
    verdictPlayedRef.current = resolvedRound;
    revealedRoundRef.current = resolvedRound;
    stopLoop("opponent.thinking");
    if (roundResult === "win") play("round.win");
    else if (roundResult === "loss") play("round.lose");
    else play("round.neutral");
  }, [verdictReachedNow, resolvedRound, roundResult, play, stopLoop]);

  const settled = alreadyRevealed || !enabled;
  // Board/consequence visuals follow the timeline; only the verdict card waits
  // on data. While the timeline is done but data is still loading, hold the
  // board fully revealed (stage 3) under the anticipation overlay.
  const effStage = settled ? 3 : stage;

  return {
    stage: effStage,
    boardReveal: effStage >= 1,
    showConsequences: effStage >= 2,
    showVerdict: verdictShown,
    anticipating: effStage === 0,
    skip,
  };
}
