"use client";

import type { LockForecastLine } from "@adamsaxion/pricewar-engine";
import { CD } from "../design-system/tokens";
import { MATCH_REVIEW_ASSETS } from "./match/match-review-icons";
import { MatchReviewIcon } from "./match/MatchReviewIcon";

const SECTION_META: Record<
  LockForecastLine["kind"],
  { label: string; color: string; icon: string }
> = {
  immediate: {
    label: "This round",
    color: CD.primary,
    icon: MATCH_REVIEW_ASSETS.forecastImmediate,
  },
  delayed: {
    label: "Next round",
    color: CD.ink2,
    icon: MATCH_REVIEW_ASSETS.forecastDelayed,
  },
  caution: {
    label: "Watch out for",
    color: "#b45309",
    icon: MATCH_REVIEW_ASSETS.forecastCaution,
  },
  risk: {
    label: "Fix before locking",
    color: CD.red,
    icon: MATCH_REVIEW_ASSETS.forecastCaution,
  },
};

export function LockForecastPanel({
  lines,
  compact,
  dense,
}: {
  lines: LockForecastLine[];
  compact?: boolean;
  dense?: boolean;
  embedded?: boolean;
}) {
  if (lines.length === 0) return null;

  const grouped: Record<LockForecastLine["kind"], LockForecastLine[]> = {
    immediate: [],
    delayed: [],
    caution: [],
    risk: [],
  };
  for (const line of lines) {
    grouped[line.kind].push(line);
  }

  const order: LockForecastLine["kind"][] = ["immediate", "delayed", "caution", "risk"];
  const visible = order.filter((kind) => grouped[kind].length > 0);
  const gap = dense ? 12 : compact ? 10 : 18;
  const textSize = dense ? 12 : compact ? 11 : 13;
  const iconSize = dense ? 24 : compact ? 22 : 28;

  if (compact) {
    return (
      <div>
        <div className="tab" style={{ marginBottom: 10 }}>
          What to expect
        </div>
        <div className="cd-review-forecast-grid">
          {visible.map((kind) => {
            const items = grouped[kind];
            const meta = SECTION_META[kind];
            return (
              <div key={kind} className="cd-review-forecast-cell">
                <div className="cd-review-forecast-cell-head">
                  <MatchReviewIcon src={meta.icon} alt="" size={22} />
                  <span style={{ color: meta.color }}>{meta.label}</span>
                </div>
                {items.map((line, i) => (
                  <p key={`${kind}-${i}`}>{line.text}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="tab" style={{ marginBottom: dense ? 10 : 14 }}>
        What to expect
      </div>
      <div style={{ display: "grid", gap }}>
        {visible.map((kind) => {
          const items = grouped[kind];
          const meta = SECTION_META[kind];
          return (
            <div key={kind} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <MatchReviewIcon src={meta.icon} alt="" size={iconSize} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: meta.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  {meta.label}
                </div>
                {items.map((line, i) => (
                  <p
                    key={`${kind}-${i}`}
                    style={{
                      margin: i === 0 ? 0 : "4px 0 0",
                      fontSize: textSize,
                      color: CD.ink2,
                      lineHeight: 1.5,
                    }}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
