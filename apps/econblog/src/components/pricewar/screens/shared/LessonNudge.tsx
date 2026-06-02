"use client";

import { useState } from "react";
import Link from "next/link";
import { MarginBtn, MT } from "@/components/pricewar/design-system/margin-kit";

function LessonGlyph({ size = 16, color = "#6b5a1f" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-5" />
      <path d="M22 10v5" />
    </svg>
  );
}

export function LessonNudge({
  topic,
  mins = 4,
  ctx,
  cta = "Learn this →",
  lessonHref = "/lessons/lesson-zero",
}: {
  topic: string;
  mins?: number;
  ctx?: string;
  cta?: string;
  lessonHref?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      style={{
        background: MT.coach,
        border: `1px solid ${MT.coachLine}`,
        borderRadius: 14,
        padding: 15,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "#fbeeb8",
            border: "1px solid #ecd98f",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <LessonGlyph />
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#6b5a1f",
            textTransform: "uppercase",
          }}
        >
          Lesson · from Prof. Aldo
        </span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 11.5, color: "#8a7430" }}>
          {mins} min
        </span>
      </div>
      <h4
        className="serif"
        style={{ fontSize: 18, color: "#2b2616", fontWeight: 700, marginTop: 10, lineHeight: 1.2 }}
      >
        {topic}
      </h4>
      {ctx && (
        <p style={{ fontSize: 12.5, color: "#5c4d2a", lineHeight: 1.45, margin: "5px 0 0" }}>{ctx}</p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <Link href={lessonHref} style={{ textDecoration: "none" }}>
          <MarginBtn kind="primary" size="sm">
            {cta}
          </MarginBtn>
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            fontSize: 12,
            color: "#8a7430",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
