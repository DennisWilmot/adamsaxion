"use client";

import type { Domain } from "@adamsaxion/pricewar-types";

export type DomainGlyphKind = "price" | "menu" | "gear" | "team" | "promo" | "coin";

/** Engine domain → flat monoline glyph (margin-gamev2 kit). */
export const DOMAIN_GLYPH_KIND: Record<Domain, DomainGlyphKind> = {
  sales: "price",
  procurement: "menu",
  operations: "gear",
  hr: "team",
  marketing: "promo",
  finance: "coin",
};

export function DomainGlyphIcon({
  kind,
  color,
  size = 18,
}: {
  kind: DomainGlyphKind;
  color: string;
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { display: "block" },
  };

  switch (kind) {
    case "price":
      return (
        <svg {...p} aria-hidden>
          <path d="M12 3v18" />
          <path d="M16.5 7.5C16.5 5.6 14.5 4.5 12 4.5S7.5 5.6 7.5 7.5 9.5 10.5 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.1-4.5-3" />
        </svg>
      );
    case "menu":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "gear":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 4.5V3M12 21v-1.5M5.6 5.6 4.5 4.5M19.5 19.5l-1.1-1.1M4.5 12H3M21 12h-1.5M5.6 18.4 4.5 19.5M19.5 4.5l-1.1 1.1" />
        </svg>
      );
    case "team":
      return (
        <svg {...p} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c0-3 2.6-5 5.5-5s5.5 2 5.5 5" />
          <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14c2.3.5 4 2.4 4 5" />
        </svg>
      );
    case "promo":
      return (
        <svg {...p} aria-hidden>
          <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M15 9a4 4 0 0 1 0 6" />
          <path d="M17.5 6.5a7 7 0 0 1 0 11" />
        </svg>
      );
    case "coin":
      return (
        <svg {...p} aria-hidden>
          <ellipse cx="12" cy="6.5" rx="7" ry="3" />
          <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
        </svg>
      );
    default:
      return null;
  }
}
