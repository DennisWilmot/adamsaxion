"use client";

import { CD } from "../../design-system/tokens";

export function RecentMatch({
  won,
  opp,
  score,
  delta,
}: {
  won?: boolean;
  opp: string;
  score: string;
  delta: number | null;
}) {
  const hasResult = won !== undefined;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: CD.cardstock,
        border: `1px solid ${CD.rule}`,
        borderRadius: 10,
      }}
    >
      {hasResult && (
        <span
          style={{
            width: 6,
            height: 36,
            borderRadius: 3,
            background: won ? CD.green : CD.red,
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: CD.ink, fontWeight: 600 }}>{opp}</div>
        <div style={{ fontSize: 12, color: CD.ink3 }}>{score}</div>
      </div>
      {delta != null && (
        <span
          className="num"
          style={{
            fontSize: 14,
            color: delta >= 0 ? CD.green : CD.red,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {delta >= 0 ? "+" : ""}
          {delta}
        </span>
      )}
    </div>
  );
}
