"use client";

import { CD } from "../design-system/tokens";

const AUSTERITY_THRESHOLD = 500;

export function isAusterityMode(cash: number) {
  return cash < AUSTERITY_THRESHOLD;
}

export function AusterityBanner({ cash }: { cash: number }) {
  return (
    <div
      style={{
        marginTop: 18,
        position: "relative",
        overflow: "hidden",
        background: "oklch(0.94 0.03 25)",
        border: `1px solid ${CD.red}`,
        borderRadius: 14,
        padding: "14px 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: CD.red,
            color: CD.paper,
            display: "grid",
            placeItems: "center",
            fontSize: 22,
            fontStyle: "italic",
            fontFamily: "var(--font-cd-serif), serif",
            flexShrink: 0,
          }}
        >
          !
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="tab" style={{ color: CD.red }}>
            Austerity mode · cash below ${AUSTERITY_THRESHOLD}
          </div>
          <div
            className="serif"
            style={{ fontSize: 22, color: CD.ink, lineHeight: 1.2, marginTop: 2 }}
          >
            Only cheap moves are on the menu.
          </div>
          <div style={{ fontSize: 13, color: CD.ink2, marginTop: 4 }}>
            Spend caps to keep you in the game. Find ${AUSTERITY_THRESHOLD - 200}+ in cash to lift the
            limit.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tab">Cash</div>
          <div className="num serif" style={{ fontSize: 28, color: CD.red, lineHeight: 1 }}>
            ${cash.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
