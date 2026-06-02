"use client";

import type { ReactNode } from "react";
import { CoffeeBackdrop } from "@/components/pricewar/design-system/CoffeeBackdrop";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";
import { CD } from "@/components/pricewar/design-system/tokens";

export function MatchTerminalFrame({
  children,
  footer,
  embedded = false,
  backdropOpacity = 0.05,
  backdropHeight,
  align = "center",
}: {
  children: ReactNode;
  footer?: ReactNode;
  embedded?: boolean;
  backdropOpacity?: number;
  backdropHeight?: number;
  align?: "center" | "start";
}) {
  return (
    <div className={embedded ? "cd-terminal-viewport-embedded" : undefined}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          borderRadius: embedded ? SHELL.card.radius : 22,
          padding: embedded ? "28px 24px" : "40px 36px",
          textAlign: align,
        }}
      >
        <CoffeeBackdrop
          opacity={backdropOpacity}
          {...(backdropHeight != null ? { height: backdropHeight } : {})}
        />
        <div className="cd relative z-[1] text-left">{children}</div>
      </div>
      {footer ? <div className="cd relative z-[1] mt-3 text-left">{footer}</div> : null}
    </div>
  );
}
