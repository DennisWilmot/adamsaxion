"use client";

import type { Domain } from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "@adamsaxion/pricewar-engine";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import { DomainGlyphIcon, DOMAIN_GLYPH_KIND } from "@/components/pricewar/design-system/domain-glyphs";
import { MT } from "@/components/pricewar/design-system/margin-kit";
import { CD } from "@/components/pricewar/design-system/tokens";
import { formatMoveInputSummary } from "../../moves/move-input";

export function ReviewMoveCard({ move }: { move: SubmittedMove }) {
  const def = MOVE_BY_ID.get(move.moveId);
  if (!def) return null;
  const domain = def.domain as Domain;
  const accent = CD.d[domain].c;
  const summary = formatMoveInputSummary(def, move.input);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 11,
        background: MT.paper2,
        border: `1px solid ${MT.rule}`,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <DomainGlyphIcon kind={DOMAIN_GLYPH_KIND[domain]} color={accent} size={16} />
        <span style={{ fontSize: 14, fontWeight: 600, color: MT.ink }}>{def.name}</span>
      </div>
      <span className="mono" style={{ fontSize: 12, color: MT.ink3, flexShrink: 0 }}>
        {summary}
      </span>
    </div>
  );
}
