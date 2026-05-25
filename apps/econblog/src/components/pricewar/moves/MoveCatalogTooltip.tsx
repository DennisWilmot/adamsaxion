"use client";

import { getActionCatalogEntry } from "@adamsaxion/pricewar-engine";
import type { MoveId } from "@adamsaxion/pricewar-types";
import { CD } from "@/components/pricewar/design-system/tokens";

export function MoveCatalogTooltip({ moveId }: { moveId: MoveId }) {
  const entry = getActionCatalogEntry(moveId);
  if (!entry) return null;

  return (
    <div
      style={{
        padding: "14px 16px",
        background: CD.ink,
        color: CD.paper,
        borderRadius: 12,
        fontSize: 12.5,
        lineHeight: 1.45,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <TooltipSection label="Mechanic" text={entry.mechanic} />
      {entry.strongWhen ? <TooltipSection label="Strong when" text={entry.strongWhen} /> : null}
      {entry.riskyWhen ? <TooltipSection label="Risky when" text={entry.riskyWhen} muted /> : null}
    </div>
  );
}

function TooltipSection({
  label,
  text,
  muted,
}: {
  label: string;
  text: string;
  muted?: boolean;
}) {
  return (
    <div style={{ marginTop: label === "Mechanic" ? 0 : 10 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: muted ? "#f0a8a8" : "rgba(255,255,255,0.55)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: muted ? "#ffd4d4" : CD.paper }}>{text}</div>
    </div>
  );
}
