"use client";

import { CD } from "../../design-system/tokens";

export function EventPill({
  label,
  impact,
  description,
}: {
  label: string;
  impact: "neutral" | "positive" | "negative";
  description?: string;
}) {
  const tone =
    impact === "positive" ? CD.green : impact === "negative" ? CD.red : CD.ink2;

  return (
    <span
      title={description ?? label}
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
        cursor: description ? "help" : "default",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: tone,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
