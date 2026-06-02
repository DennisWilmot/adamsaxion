"use client";

import { CoachBubble } from "../design-system/CoachBubble";
import { MarginBtn, MT } from "../design-system/margin-kit";

const PREP_LINES = [
  "Warming the espresso machine",
  "Pre-heating the oven",
  "Balancing the books",
];

export interface QueuePanelProps {
  playModeId: string;
  elapsedSec: number;
  onCancel: () => void;
  enteringMatch?: boolean;
}

/** Queue content for use inside MarginShellFrame (no full-page wrapper). */
export function QueuePanel({
  playModeId,
  elapsedSec,
  onCancel,
  enteringMatch = false,
}: QueuePanelProps) {
  if (enteringMatch) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        style={{
          minHeight: 560,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: MT.card,
            border: `1px solid ${MT.rule}`,
            borderRadius: 18,
            padding: "40px 30px",
            textAlign: "center",
          }}
        >
          <h2 className="serif" style={{ fontSize: 27, color: MT.ink, fontWeight: 700 }}>
            Match found
          </h2>
          <p style={{ fontSize: 13.5, color: MT.ink3, marginTop: 8 }}>Opening briefing…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20, padding: "24px 0" }}>
      <div
        style={{
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: MT.card,
            border: `1px solid ${MT.rule}`,
            borderRadius: 18,
            padding: "40px 30px",
            textAlign: "center",
          }}
        >
        <h2 className="serif" style={{ fontSize: 27, color: MT.ink, fontWeight: 700 }}>
          Looking for an opponent…
        </h2>
        <div style={{ fontSize: 13.5, color: MT.ink3, marginTop: 5, textTransform: "capitalize" }}>
          {playModeId} · Coffee Shop
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            margin: "26px auto 0",
            maxWidth: 320,
            textAlign: "left",
          }}
        >
          {PREP_LINES.map((line, i) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                opacity: i === 0 ? 1 : 0.5,
              }}
            >
              {i === 0 ? (
                <span style={{ display: "inline-flex", gap: 3 }}>
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="mtq-dot"
                      style={{ width: 6, height: 6, borderRadius: 99, background: MT.blue }}
                    />
                  ))}
                </span>
              ) : (
                <span style={{ width: 16, textAlign: "center", color: MT.ink4 }}>○</span>
              )}
              <span
                className="serif"
                style={{
                  fontSize: 15.5,
                  fontStyle: "italic",
                  color: i === 0 ? MT.ink : MT.ink3,
                }}
              >
                {line}…
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <span className="mono" style={{ fontSize: 12, color: MT.ink3 }}>
            {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:
            {String(elapsedSec % 60).padStart(2, "0")}
          </span>
        </div>

        <div style={{ marginTop: 28 }}>
          <MarginBtn kind="danger" size="md" onClick={onCancel}>
            Cancel search
          </MarginBtn>
        </div>
        </div>
      </div>

      <CoachBubble label="Prof. Aldo · While we wait">
        While you wait, think about your plan. Will you charge more, compete on price, or mix it up?
      </CoachBubble>
    </div>
  );
}

export function markBriefingPending(matchId: string) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`pricewar:briefing:${matchId}`);
  }
}
