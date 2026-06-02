"use client";

import { Delete } from "lucide-react";
import type { CSSProperties } from "react";
import type { LetterState } from "@/lib/econwordle/engine";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

const KEY_BG: Record<LetterState, string> = {
  correct: "var(--color-success)",
  present: "var(--color-gold)",
  absent: "var(--color-foreground-muted)",
};

export const ENTER_KEY = "ENTER";
export const BACK_KEY = "BACK";

function Key({
  label,
  state,
  wide,
  accent,
  disabled,
  onPress,
}: {
  label: React.ReactNode;
  state?: LetterState | undefined;
  wide?: boolean;
  accent?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const style: CSSProperties = state
    ? { background: KEY_BG[state], borderColor: KEY_BG[state], color: "#fff" }
    : {};

  const base =
    "flex h-12 min-w-0 items-center justify-center rounded-md border font-body font-semibold uppercase transition-colors disabled:opacity-50 sm:h-14";
  const tone = state
    ? ""
    : accent
      ? "border-primary bg-primary text-surface-raised hover:bg-primary-hover"
      : "border-border bg-surface-raised text-foreground hover:bg-surface-sunken";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      className={`${base} ${tone} ${wide ? "flex-[1.6] text-[10px] sm:text-xs" : "flex-1 text-xs sm:text-sm"}`}
      style={style}
    >
      {label}
    </button>
  );
}

export function Keyboard({
  keyStates,
  disabled,
  onKey,
}: {
  keyStates: Record<string, LetterState>;
  disabled: boolean;
  onKey: (key: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[34rem] select-none flex-col gap-1.5">
      {ROWS.map((row, i) => (
        <div key={row} className="flex w-full gap-1 sm:gap-1.5">
          {i === 1 && <span className="hidden flex-[0.5] sm:block" />}
          {i === 2 && (
            <Key label="Enter" wide accent disabled={disabled} onPress={() => onKey(ENTER_KEY)} />
          )}
          {row.split("").map((ch) => (
            <Key
              key={ch}
              label={ch}
              state={keyStates[ch]}
              disabled={disabled}
              onPress={() => onKey(ch)}
            />
          ))}
          {i === 1 && <span className="hidden flex-[0.5] sm:block" />}
          {i === 2 && (
            <Key
              label={<Delete className="size-4" />}
              wide
              disabled={disabled}
              onPress={() => onKey(BACK_KEY)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
