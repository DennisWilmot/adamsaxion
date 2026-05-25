"use client";

import type { LockForecastLine } from "@adamsaxion/pricewar-engine";
import { CD } from "../design-system/tokens";

const SECTION_LABEL: Record<LockForecastLine["kind"], string> = {
  immediate: "This round (immediate)",
  delayed: "Next report (private)",
  risk: "Risks",
};

const SECTION_COLOR: Record<LockForecastLine["kind"], string> = {
  immediate: CD.ink,
  delayed: CD.ink2,
  risk: CD.red,
};

export function LockForecastPanel({ lines }: { lines: LockForecastLine[] }) {
  if (lines.length === 0) return null;

  const grouped: Record<LockForecastLine["kind"], LockForecastLine[]> = {
    immediate: [],
    delayed: [],
    risk: [],
  };
  for (const line of lines) {
    grouped[line.kind].push(line);
  }

  const order: LockForecastLine["kind"][] = ["immediate", "delayed", "risk"];

  return (
    <div
      style={{
        marginTop: 16,
        padding: "14px 16px",
        background: CD.paper,
        borderRadius: 10,
        border: `1px solid ${CD.rule}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: CD.ink3,
          marginBottom: 10,
        }}
      >
        Lock forecast
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {order.map((kind) => {
          const items = grouped[kind];
          if (items.length === 0) return null;
          return (
            <div key={kind}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: SECTION_COLOR[kind],
                  marginBottom: 6,
                }}
              >
                {SECTION_LABEL[kind]}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: CD.ink2, lineHeight: 1.45 }}>
                {items.map((line, i) => (
                  <li key={`${kind}-${i}`}>{line.text}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: CD.ink3, marginTop: 12, marginBottom: 0, lineHeight: 1.4 }}>
        Forecasts show likely effects — not guaranteed outcomes. Stochastic events can still shift the round.
      </p>
    </div>
  );
}
