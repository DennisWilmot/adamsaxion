import type { Domain } from "@adamsaxion/pricewar-types";
import { DOMAINS } from "@adamsaxion/pricewar-types";
import { CD } from "./tokens";

const DOMAIN_LABELS: Record<Domain, string> = {
  sales: "Sales",
  procurement: "Procurement",
  operations: "Operations",
  hr: "HR",
  marketing: "Marketing",
  finance: "Finance",
};

export function DomainStripe({ domain }: { domain: Domain }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
        background: CD.d[domain].c,
        borderRadius: "14px 0 0 14px",
      }}
    />
  );
}

export function DomainGlyph({ domain, size = 28 }: { domain: Domain; size?: number }) {
  const g = CD.d[domain];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: g.soft,
        color: g.c,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-cd-serif)",
        fontSize: size * 0.7,
        lineHeight: 1,
        fontStyle: "italic",
      }}
    >
      {g.glyph}
    </div>
  );
}

export function DomainTag({ domain }: { domain: Domain }) {
  const g = CD.d[domain];
  const label = DOMAIN_LABELS[domain];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px 3px 6px",
        background: g.soft,
        color: g.c,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: 999,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: g.c }} />
      {label}
    </span>
  );
}

export interface DomainTabsProps {
  active: Domain;
  onPick: (domain: Domain) => void;
  domains?: Domain[];
}

export function DomainTabs({ active, onPick, domains = [...DOMAINS] }: DomainTabsProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: 2,
        padding: 4,
        borderRadius: 12,
        background: CD.paperDeep,
        border: `1px solid ${CD.rule}`,
      }}
    >
      {domains.map((k) => {
        const isActive = k === active;
        const g = CD.d[k];
        return (
          <button
            key={k}
            type="button"
            onClick={() => onPick(k)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: isActive ? CD.paper : "transparent",
              color: isActive ? CD.ink : CD.ink3,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.01em",
              boxShadow: isActive ? `inset 0 0 0 1px ${CD.rule}` : "none",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: g.c,
                opacity: isActive ? 1 : 0.5,
              }}
            />
            {DOMAIN_LABELS[k]}
          </button>
        );
      })}
    </div>
  );
}

export function RoundDots({ total = 8, current = 1 }: { total?: number; current?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const past = idx < current;
        const now = idx === current;
        return (
          <div
            key={i}
            style={{
              width: now ? 10 : 7,
              height: now ? 10 : 7,
              borderRadius: 999,
              background: past ? CD.ink : now ? CD.primary : "transparent",
              border: `1.4px solid ${past ? CD.ink : now ? CD.primary : CD.ink4}`,
            }}
          />
        );
      })}
    </div>
  );
}
