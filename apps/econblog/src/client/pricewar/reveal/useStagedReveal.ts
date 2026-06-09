"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type StagedRevealOptions = {
  /** Duration (ms) of each stage, in order. The hook advances through them. */
  steps: number[];
  /**
   * Changing this value restarts the timeline from stage 0. Use the thing that
   * identifies "a new sequence" (e.g. the resolved round number, or matchId).
   */
  resetKey: string | number;
  /** When false, the timeline holds at stage 0 (e.g. panel not visible yet). */
  enabled?: boolean;
  /** Fires once when the timeline reaches the final stage. */
  onComplete?: () => void;
  /** Fires once per stage as it begins (index of the stage that just started). */
  onStage?: (stage: number) => void;
};

export type StagedReveal = {
  /** Current stage index (0..steps.length). `steps.length` means "done". */
  stage: number;
  /** True once the timeline has finished (or was skipped). */
  done: boolean;
  /** Jump immediately to the final stage. Use for tap-to-skip. */
  skip: () => void;
};

/**
 * Drives a self-paced presentation timeline that is fully decoupled from data
 * readiness — the heart of the Margin choreography. Data can be ready instantly;
 * this hook still walks through the staged reveal so the player can follow it.
 *
 * Honors `prefers-reduced-motion` by collapsing straight to "done".
 */
export function useStagedReveal({
  steps,
  resetKey,
  enabled = true,
  onComplete,
  onStage,
}: StagedRevealOptions): StagedReveal {
  const reducedMotion = usePrefersReducedMotion();
  const total = steps.length;
  const [stage, setStage] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onStageRef = useRef(onStage);
  onStageRef.current = onStage;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const completedRef = useRef(false);

  const finish = useCallback(() => {
    setStage(total);
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [total]);

  useEffect(() => {
    completedRef.current = false;

    if (!enabled) {
      setStage(0);
      return;
    }

    if (reducedMotion) {
      finish();
      return;
    }

    setStage(0);
    onStageRef.current?.(0);

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    for (let i = 0; i < stepsRef.current.length; i++) {
      elapsed += stepsRef.current[i] ?? 0;
      const next = i + 1;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          if (next >= stepsRef.current.length) {
            finish();
          } else {
            setStage(next);
            onStageRef.current?.(next);
          }
        }, elapsed)
      );
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, enabled, reducedMotion, finish]);

  const skip = useCallback(() => finish(), [finish]);

  return { stage, done: stage >= total, skip };
}
