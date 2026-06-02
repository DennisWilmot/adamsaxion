"use client";

import { Cash, Eyebrow, MT } from "@/components/pricewar/design-system/margin-kit";

/** v2 reference: financial distress below this cash level (`AusterityDecide`). */
export const AUSTERITY_THRESHOLD = 200;

export function isAusterityMode(cash: number) {
  return cash < AUSTERITY_THRESHOLD;
}

export function AusterityBanner({ cash }: { cash: number }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#fdf3e2,#fbe8cc)",
        border: `2px solid ${MT.warnLine}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <Eyebrow style={{ color: MT.warnInk }}>⚠ Financial distress</Eyebrow>
          <h3
            className="serif"
            style={{ fontSize: 19, color: MT.ink, fontWeight: 700, marginTop: 4, lineHeight: 1.15 }}
          >
            You&apos;re in austerity.
          </h3>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <Cash v={cash} size={26} color="#c2410c" />
          <div style={{ fontSize: 10.5, color: MT.warnInk, marginTop: 2 }}>floor at $0</div>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: "#7a5a12", lineHeight: 1.45, margin: "10px 0 0" }}>
        Below the ${AUSTERITY_THRESHOLD} threshold: no actions above $50 upfront, no hiring, no equipment,
        no R&amp;D until cash recovers.
      </p>
    </div>
  );
}
