"use client";

import type { ReactNode } from "react";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";
import { CD } from "@/components/pricewar/design-system/tokens";

export function ActionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: SHELL.card.bg,
        border: `1px solid ${SHELL.card.border}`,
        borderRadius: SHELL.card.radius,
        padding: SHELL.card.pad,
      }}
    >
      <div className="tab">{eyebrow}</div>
      <h2
        className="serif"
        style={{ fontSize: SHELL.type.h2Panel, color: CD.ink, margin: "4px 0 10px", lineHeight: 1.08 }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
