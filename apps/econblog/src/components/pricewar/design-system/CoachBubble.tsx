"use client";

import { AvatarCoach } from "./avatars";
import { MT } from "./margin-kit";

export interface CoachBubbleProps {
  children: React.ReactNode;
  label?: string;
  tone?: "tip" | "warn";
}

export function CoachBubble({
  children,
  label = "Prof. Aldo · Coach",
  tone = "tip",
}: CoachBubbleProps) {
  const isWarn = tone === "warn";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        background: isWarn ? MT.warnSoft : MT.coach,
        border: `1px solid ${isWarn ? MT.warnLine : MT.coachLine}`,
        borderRadius: 14,
      }}
    >
      <div style={{ flex: "0 0 auto" }}>
        <AvatarCoach size={40} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#1f2937",
            }}
          >
            Prof. Aldo
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: MT.coachInk,
              background: "#fbeeb8",
              border: "1px solid #ecd98f",
              padding: "1px 6px",
              borderRadius: 5,
            }}
          >
            Coach
          </span>
        </div>
        <div
          className="serif"
          style={{
            fontSize: 16.5,
            lineHeight: 1.36,
            fontStyle: "italic",
            color: "#2b2616",
            marginTop: 5,
            fontWeight: 500,
          }}
        >
          &ldquo;{children}&rdquo;
        </div>
        {label !== "Prof. Aldo · Coach" && (
          <div style={{ fontSize: 10, color: MT.ink3, marginTop: 4 }}>{label}</div>
        )}
      </div>
    </div>
  );
}
