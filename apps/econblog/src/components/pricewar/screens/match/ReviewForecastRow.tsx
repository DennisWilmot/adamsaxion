"use client";

import type { LockForecastLine } from "@adamsaxion/pricewar-engine";
import { MT } from "@/components/pricewar/design-system/margin-kit";
import { MatchReviewIcon } from "./MatchReviewIcon";
import { MATCH_REVIEW_ASSETS } from "./match-review-icons";

const ROW_META: Record<
  LockForecastLine["kind"],
  { label: string; stripe: string; soft: string; icon: string }
> = {
  immediate: {
    label: "This round",
    stripe: MT.blue,
    soft: MT.blueSoft,
    icon: MATCH_REVIEW_ASSETS.forecastImmediate,
  },
  delayed: {
    label: "Next round",
    stripe: MT.ink2,
    soft: MT.paper2,
    icon: MATCH_REVIEW_ASSETS.forecastDelayed,
  },
  caution: {
    label: "Watch out for",
    stripe: "#b45309",
    soft: MT.warnSoft,
    icon: MATCH_REVIEW_ASSETS.forecastCaution,
  },
  risk: {
    label: "Fix before locking",
    stripe: MT.red,
    soft: MT.redSoft,
    icon: MATCH_REVIEW_ASSETS.forecastCaution,
  },
};

const KIND_ORDER: LockForecastLine["kind"][] = [
  "immediate",
  "delayed",
  "caution",
  "risk",
];

export function ReviewForecastRows({ lines }: { lines: LockForecastLine[] }) {
  if (lines.length === 0) return null;

  const sorted = [...lines].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map((line, i) => {
        const meta = ROW_META[line.kind];
        return (
          <div
            key={`${line.kind}-${i}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "11px 14px",
              borderRadius: 11,
              background: MT.paper2,
              border: `1px solid ${MT.rule}`,
              borderLeft: `4px solid ${meta.stripe}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: meta.soft,
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                marginTop: 1,
              }}
            >
              <MatchReviewIcon src={meta.icon} alt="" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: MT.ink,
                  lineHeight: 1.25,
                }}
              >
                {meta.label}
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12.5,
                  color: MT.ink2,
                  lineHeight: 1.45,
                }}
              >
                {line.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
