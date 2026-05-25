"use client";

import { CD } from "../../design-system/tokens";

export function WeatherChip({
  label,
  delta,
}: {
  kind?: string;
  label: string;
  delta?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: CD.paperDeep,
        border: `1px solid ${CD.rule}`,
        fontSize: 12,
        color: CD.ink2,
      }}
    >
      <span>{label}</span>
      {delta != null && (
        <span className="num" style={{ color: delta >= 0 ? CD.green : CD.red, fontWeight: 600 }}>
          {delta >= 0 ? "+" : ""}
          {delta}%
        </span>
      )}
    </span>
  );
}
