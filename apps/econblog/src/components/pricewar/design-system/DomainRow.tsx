"use client";

import type { Domain } from "@adamsaxion/pricewar-types";
import { CD } from "./tokens";
import { DOMAIN_GLYPH_KIND, DomainGlyphIcon } from "./domain-glyphs";

export function DomainRow({
  active,
  domains,
  onPick,
}: {
  active: Domain;
  domains: Domain[];
  onPick: (domain: Domain) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Domains"
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      {domains.map((domain) => {
        const selected = domain === active;
        const accent = CD.d[domain];
        return (
          <button
            key={domain}
            type="button"
            role="tab"
            aria-selected={selected}
            title={domain}
            onClick={() => onPick(domain)}
            className="mt-tile mt-press"
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: selected ? accent.soft : CD.paperDeep,
              border: `1.5px solid ${selected ? accent.c : CD.rule}`,
              boxShadow: selected ? `0 0 0 3px ${accent.soft}` : "none",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flex: "0 0 auto",
              padding: 0,
            }}
          >
            <DomainGlyphIcon
              kind={DOMAIN_GLYPH_KIND[domain]}
              color={selected ? accent.c : CD.ink3}
              size={20}
            />
          </button>
        );
      })}
    </div>
  );
}
