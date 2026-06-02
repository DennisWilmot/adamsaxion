"use client";

import { CD } from "../../design-system/tokens";

const NEWS_ALERT_PREFIX = "News alert:";

function formatEventLabel(description: string): { badge: string; body: string } {
  const trimmed = description.trim();
  if (trimmed.toLowerCase().startsWith(NEWS_ALERT_PREFIX)) {
    return {
      badge: "News alert",
      body: trimmed.slice(NEWS_ALERT_PREFIX.length).trim(),
    };
  }
  return { badge: "News alert", body: trimmed };
}

export function EventPill({
  label,
  impact,
  description,
}: {
  label: string;
  impact: "neutral" | "positive" | "negative";
  description?: string;
}) {
  const tone =
    impact === "positive" ? CD.green : impact === "negative" ? CD.red : CD.ink2;

  const source = description ?? label;
  const { badge, body } = formatEventLabel(source);

  return (
    <span
      title={body}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 10,
        background: CD.paperDeep,
        border: `1px solid ${CD.rule}`,
        fontSize: 12,
        color: CD.ink2,
        cursor: "help",
        maxWidth: 420,
        textAlign: "left",
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: tone,
          flexShrink: 0,
        }}
      />
      <span>
        <strong style={{ color: CD.ink, fontWeight: 600 }}>{badge}:</strong> {body}
      </span>
    </span>
  );
}
