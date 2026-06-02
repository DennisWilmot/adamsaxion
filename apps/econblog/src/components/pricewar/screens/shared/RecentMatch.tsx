"use client";

import Link from "next/link";
import { CD } from "../../design-system/tokens";

export function RecentMatch({
  href,
  active,
  won,
  opp,
  score,
  detail,
  delta,
  rated,
}: {
  href?: string;
  active?: boolean;
  won?: boolean;
  opp: string;
  score: string;
  detail?: string;
  delta: number | null;
  rated?: boolean;
}) {
  const hasResult = won !== undefined;
  const showUnrated = rated === false && hasResult;
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: active ? CD.paperDeep : CD.cardstock,
        border: `1px solid ${active ? CD.primary : CD.rule}`,
        borderRadius: 10,
        cursor: href ? "pointer" : "default",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: active ? `0 0 0 1px ${CD.primary}22` : "none",
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
      {active && (
        <span
          style={{
            width: 6,
            height: 36,
            borderRadius: 3,
            background: CD.primary,
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, color: CD.ink, fontWeight: 600 }}>{opp}</div>
          {active && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: CD.primary,
              }}
            >
              Continue
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: CD.ink3, marginTop: 2 }}>{score}</div>
        {detail && (
          <div style={{ fontSize: 11, color: CD.ink2, marginTop: 4, lineHeight: 1.35 }}>{detail}</div>
        )}
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
      {showUnrated && (
        <span style={{ fontSize: 11, color: CD.ink3, flexShrink: 0 }}>Unrated</span>
      )}
      {href && (
        <span style={{ fontSize: 16, color: CD.primary, flexShrink: 0, lineHeight: 1 }} aria-hidden>
          →
        </span>
      )}
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      {inner}
    </Link>
  );
}
