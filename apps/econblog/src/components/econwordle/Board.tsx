"use client";

import type { CSSProperties } from "react";
import type { LetterState } from "@/lib/econwordle/engine";

export interface ScoredRow {
  guess: string;
  states: LetterState[];
}

type TileVisual = "empty" | "active" | LetterState;

const TILE_BG: Record<LetterState, string> = {
  correct: "var(--color-success)",
  present: "var(--color-gold)",
  absent: "var(--color-foreground-muted)",
};

function Tile({ letter, visual }: { letter: string; visual: TileVisual }) {
  const scored = visual === "correct" || visual === "present" || visual === "absent";
  const style: CSSProperties = scored
    ? { background: TILE_BG[visual], borderColor: TILE_BG[visual], color: "#fff" }
    : {};

  return (
    <div
      className={`flex aspect-square w-full items-center justify-center rounded-md border-2 font-display text-2xl font-bold uppercase tabular-nums transition-colors sm:text-3xl ${
        scored
          ? ""
          : visual === "active"
            ? "border-border bg-surface-raised text-foreground"
            : "border-border-subtle bg-surface-sunken text-foreground"
      }`}
      style={style}
    >
      {letter}
    </div>
  );
}

export function Board({
  length,
  rows,
  currentGuess,
  maxGuesses,
  shake,
}: {
  length: number;
  rows: ScoredRow[];
  currentGuess: string;
  maxGuesses: number;
  shake: boolean;
}) {
  const activeRowIndex = rows.length;

  return (
    <div
      className="mx-auto grid w-full gap-1.5"
      style={{ maxWidth: `${length * 3.5}rem`, gridTemplateRows: `repeat(${maxGuesses}, 1fr)` }}
    >
      {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
        const scored = rows[rowIndex];
        const isActive = rowIndex === activeRowIndex;
        const isShaking = isActive && shake;

        return (
          <div
            key={rowIndex}
            className={`grid gap-1.5 ${isShaking ? "animate-[ew-shake_0.4s_ease-in-out]" : ""}`}
            style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}
          >
            {Array.from({ length }).map((_, col) => {
              if (scored) {
                return (
                  <Tile
                    key={col}
                    letter={scored.guess[col] ?? ""}
                    visual={scored.states[col] ?? "absent"}
                  />
                );
              }
              if (isActive) {
                const ch = currentGuess[col] ?? "";
                return <Tile key={col} letter={ch} visual={ch ? "active" : "empty"} />;
              }
              return <Tile key={col} letter="" visual="empty" />;
            })}
          </div>
        );
      })}
    </div>
  );
}
