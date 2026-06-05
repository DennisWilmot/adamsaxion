"use client";

import type { CSSProperties } from "react";
import type { ScoredGuess } from "@/lib/econwordle/engine";

type TileVisual = "empty" | "active" | "correct" | "present" | "absent" | "invalid";

const TILE_BG: Record<Exclude<TileVisual, "empty" | "active">, string> = {
  correct: "var(--color-success)",
  present: "var(--color-gold)",
  absent: "var(--color-foreground-muted)",
  invalid: "var(--color-error)",
};

function Tile({ letter, visual }: { letter: string; visual: TileVisual }) {
  const scored =
    visual === "correct" ||
    visual === "present" ||
    visual === "absent" ||
    visual === "invalid";
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
  lengthRevealed,
  hiddenLength,
}: {
  length: number;
  rows: ScoredGuess[];
  currentGuess: string;
  maxGuesses: number;
  shake: boolean;
  lengthRevealed: boolean;
  hiddenLength: number;
}) {
  const activeRowIndex = rows.length;
  const boardLength = lengthRevealed ? length : hiddenLength;

  return (
    <div
      className="mx-auto grid w-full gap-1.5"
      style={{
        maxWidth: `${boardLength * 3.5}rem`,
        gridTemplateRows: `repeat(${maxGuesses}, 1fr)`,
      }}
    >
      {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
        const scored = rows[rowIndex];
        const isActive = rowIndex === activeRowIndex;
        const isShaking = isActive && shake;
        const rowLength = scored ? length : boardLength;

        return (
          <div
            key={rowIndex}
            className={`grid gap-1.5 ${isShaking ? "animate-[ew-shake_0.4s_ease-in-out]" : ""}`}
            style={{ gridTemplateColumns: `repeat(${rowLength}, 1fr)` }}
          >
            {Array.from({ length: rowLength }).map((_, col) => {
              if (scored) {
                const letter = scored.guess[col] ?? "";
                const visual = scored.invalid
                  ? "invalid"
                  : (scored.states[col] ?? "absent");
                return <Tile key={col} letter={letter} visual={visual} />;
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
