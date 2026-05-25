"use client";

import { CD } from "../../design-system/tokens";

export type ScenarioKind = "coffee" | "foodtruck" | "tech" | "bookshop";

export function ScenarioArt({
  kind = "coffee",
  opacity = 1,
}: {
  kind?: ScenarioKind;
  opacity?: number;
}) {
  if (kind === "coffee") {
    return (
      <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: "block" }}>
        <g stroke={CD.ink} strokeWidth="1.4" fill="none">
          <path d="M 10 30 Q 25 18, 40 30 T 70 30 T 100 30 T 130 30 T 160 30 T 190 30" />
          <line x1="10" y1="30" x2="190" y2="30" />
        </g>
        <g fill={CD.ink}>
          <rect x="62" y="56" width="76" height="44" rx="3" />
          <rect x="80" y="46" width="40" height="14" rx="2" />
          <rect x="92" y="38" width="4" height="9" />
          <rect x="106" y="38" width="4" height="9" />
          <circle cx="86" cy="80" r="4" fill={CD.paper} />
          <circle cx="114" cy="80" r="4" fill={CD.paper} />
        </g>
        <g fill={CD.primary} opacity="0.6">
          <circle cx="34" cy="98" r="6" />
        </g>
      </svg>
    );
  }
  if (kind === "foodtruck") {
    return (
      <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: "block" }}>
        <g stroke={CD.ink} strokeWidth="1.4" fill="none">
          <rect x="30" y="42" width="120" height="50" rx="6" />
          <rect x="40" y="50" width="40" height="22" rx="2" />
          <line x1="86" y1="48" x2="86" y2="92" />
          <rect x="90" y="50" width="50" height="20" rx="2" />
        </g>
        <g fill={CD.ink}>
          <circle cx="58" cy="98" r="9" />
          <circle cx="58" cy="98" r="3" fill={CD.paper} />
          <circle cx="124" cy="98" r="9" />
          <circle cx="124" cy="98" r="3" fill={CD.paper} />
        </g>
      </svg>
    );
  }
  if (kind === "tech") {
    return (
      <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: "block" }}>
        <g stroke={CD.ink} strokeWidth="1.4" fill="none">
          <rect x="40" y="36" width="120" height="64" rx="4" />
          <line x1="40" y1="48" x2="160" y2="48" />
          <circle cx="50" cy="42" r="2" fill={CD.ink} />
          <circle cx="58" cy="42" r="2" fill={CD.ink} />
          <circle cx="66" cy="42" r="2" fill={CD.ink} />
          <line x1="52" y1="60" x2="100" y2="60" />
          <line x1="52" y1="68" x2="120" y2="68" />
          <line x1="52" y1="76" x2="86" y2="76" />
          <rect x="110" y="80" width="36" height="14" rx="2" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: "block" }}>
      <g stroke={CD.ink} strokeWidth="1.4" fill="none">
        {[40, 60, 80, 100, 120, 140].map((x, i) => (
          <rect key={x} x={x} y={50 - (i % 2) * 6} width="14" height={50 + (i % 2) * 6} />
        ))}
        <line x1="34" y1="100" x2="160" y2="100" />
      </g>
    </svg>
  );
}
