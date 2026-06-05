"use client";

import { X } from "lucide-react";
import { Eyebrow, MT } from "@/components/pricewar/design-system/margin-kit";
import { MARGIN_RULES_SECTIONS } from "@/lib/games/margin-rules-content";
import { MARGIN_GAME_NAME } from "@/lib/games/routes";

const PANEL_WIDTH = 348;

export function MarginRulesSidePanel({
  id,
  onClose,
}: {
  id?: string;
  onClose: () => void;
}) {
  return (
    <aside
      id={id}
      aria-label={`${MARGIN_GAME_NAME} rules`}
      style={{
        width: PANEL_WIDTH,
        flexShrink: 0,
        height: "calc(100dvh - var(--header-height) - 52px)",
        minHeight: 520,
        overflowY: "auto",
        background: MT.paper2,
        borderLeft: `1px solid ${MT.rule}`,
        padding: "16px 18px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <Eyebrow>Reference</Eyebrow>
          <h2
            className="serif"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: MT.ink,
              marginTop: 6,
              lineHeight: 1.15,
            }}
          >
            How {MARGIN_GAME_NAME} works
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rules"
          className="mt-press"
          style={{
            display: "grid",
            placeItems: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${MT.rule}`,
            background: MT.card,
            color: MT.ink2,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MARGIN_RULES_SECTIONS.map((section) => (
          <section
            key={section.title}
            style={{
              background: MT.card,
              border: `1px solid ${MT.rule}`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: MT.ink, margin: 0 }}>
              {section.title}
            </h3>
            {section.body ? (
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: MT.ink2,
                  margin: "8px 0 0",
                }}
              >
                {section.body}
              </p>
            ) : null}
            {section.bullets && section.bullets.length > 0 ? (
              <ul
                style={{
                  margin: section.body ? "10px 0 0" : "8px 0 0",
                  paddingLeft: 18,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: MT.ink2,
                }}
              >
                {section.bullets.map((item) => (
                  <li key={item} style={{ marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </aside>
  );
}
