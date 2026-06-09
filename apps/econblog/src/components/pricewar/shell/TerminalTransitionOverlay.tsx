"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { MT } from "@/components/pricewar/design-system/margin-kit";
import { useGameAudio } from "@/client/pricewar/audio/useGameAudio";
import { useStagedReveal } from "@/client/pricewar/reveal/useStagedReveal";
import { deriveTerminalBeat } from "@/client/pricewar/reveal/terminal-beat";

const TONE_COLOR: Record<"win" | "loss" | "neutral", string> = {
  win: MT.green,
  loss: MT.red,
  neutral: MT.ink2,
};

const TONE_BG: Record<"win" | "loss" | "neutral", string> = {
  win: "rgba(232, 248, 238, 0.9)",
  loss: "rgba(252, 235, 235, 0.92)",
  neutral: "rgba(244, 246, 250, 0.92)",
};

/**
 * The per-cause terminal "trigger beat" → "match-over sweep" that plays before
 * the end screen, so a match never hard-cuts to a verdict. Mounts when the match
 * becomes terminal, plays once, then calls `onDone` to reveal the end screen
 * underneath. Tap anywhere to skip. Honors reduced motion via useStagedReveal.
 */
export function TerminalTransitionOverlay({
  view,
  onDone,
}: {
  view: PlayerView;
  onDone: () => void;
}) {
  const { play } = useGameAudio();
  const beat = useMemo(() => deriveTerminalBeat(view), [view]);
  const [leaving, setLeaving] = useState(false);
  const playedTrigger = useRef(false);

  // Trigger beat, then a short "match over" sweep before handing off.
  const steps = beat?.dramatic ? [1100, 500] : [600];

  const { stage, skip } = useStagedReveal({
    steps,
    resetKey: view.matchId,
    enabled: Boolean(beat),
    onStage: (s) => {
      if (s === 0 && beat && !playedTrigger.current) {
        playedTrigger.current = true;
        play(beat.triggerCue);
      }
    },
    onComplete: () => {
      if (beat) play(beat.resolveCue);
      setLeaving(true);
      window.setTimeout(onDone, 380);
    },
  });

  useEffect(() => {
    if (!beat) onDone();
  }, [beat, onDone]);

  if (!beat) return null;

  const color = TONE_COLOR[beat.tone];

  return (
    <div
      className={`mtx-terminal-overlay${leaving ? " mtx-leaving" : ""}`}
      style={{ background: TONE_BG[beat.tone] }}
      onClick={skip}
      role="presentation"
    >
      <div
        className="mtx-stamp"
        key={`stamp-${stage === 0 ? "in" : "settled"}`}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
      >
        <span
          className="mtx-stamp-text"
          style={{
            color,
            border: `4px solid ${color}`,
            borderRadius: 14,
            padding: "8px 22px",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          {beat.stamp}
        </span>
      </div>
      <p
        className="mtx-fade-rise"
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: "clamp(18px, 4vw, 26px)",
          color: MT.ink,
          fontFamily: "var(--font-serif, Georgia, serif)",
        }}
      >
        {beat.headline}
      </p>
      <span className="mtx-skip-hint" style={{ color: MT.ink3 }}>
        Tap to continue
      </span>
    </div>
  );
}
