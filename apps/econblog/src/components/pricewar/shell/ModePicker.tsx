"use client";

import { useRef, useState } from "react";
import { PLAY_MODES } from "@adamsaxion/pricewar-engine";
import { MarginBtn, MT, StatusDot } from "@/components/pricewar/design-system/margin-kit";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";

const LOBBY_MODES = PLAY_MODES.filter((m) => m.id !== "blitz-e2e" && m.id !== "tutorial");

const MODE_DOTS: Record<string, string> = {
  blitz: MT.blue,
  rapid: "#c2410c",
  standard: MT.blue,
};

export function ModePicker({
  selectedMode,
  onSelectMode,
  isPaid,
}: {
  selectedMode: string;
  onSelectMode: (modeId: string) => void;
  isPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected =
    LOBBY_MODES.find((m) => m.id === selectedMode) ??
    LOBBY_MODES.find((m) => m.id === DEFAULT_MARGIN_PLAY_MODE) ??
    LOBBY_MODES[0];
  const tier = isPaid ? "paid" : "free";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="mt-press"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 14px",
          borderRadius: 999,
          border: `1px solid ${MT.rule}`,
          background: MT.card,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          color: MT.ink,
        }}
      >
        <StatusDot color={MODE_DOTS[selected?.id ?? DEFAULT_MARGIN_PLAY_MODE] ?? MT.blue} />
        {selected?.label ?? "Rapid"}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={MT.ink3}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 20,
            width: 232,
            background: MT.card,
            border: `1px solid ${MT.rule}`,
            borderRadius: 13,
            padding: 5,
            boxShadow: "0 16px 40px -18px rgba(15,30,60,.4)",
          }}
        >
          {LOBBY_MODES.map((mode) => {
            const locked = !mode.availableToTiers.includes(tier);
            const isSelected = mode.id === selectedMode;
            return (
              <button
                key={mode.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  onSelectMode(mode.id);
                  setOpen(false);
                }}
                className="mt-press"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 11px",
                  borderRadius: 9,
                  cursor: locked ? "not-allowed" : "pointer",
                  background: isSelected ? MT.blueSoft : "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  opacity: locked ? 0.5 : 1,
                }}
              >
                <StatusDot color={MODE_DOTS[mode.id] ?? MT.ink3} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: MT.ink }}>{mode.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: MT.ink3, marginTop: 1 }}>
                    {mode.shortLabel}
                    {mode.clock?.kind === "chess"
                      ? ` · ${Math.round(mode.clock.perPlayerMs / 60000)} min match`
                      : mode.clock
                        ? " · timed"
                        : " · coached"}
                    {locked ? " · locked" : ""}
                  </div>
                </div>
                {isSelected && (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={MT.blue}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
