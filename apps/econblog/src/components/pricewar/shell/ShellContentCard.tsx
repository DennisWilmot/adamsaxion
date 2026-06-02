"use client";

import type { ReactNode } from "react";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";

export function ShellContentCard({
  children,
  minHeight,
  padding,
  fullBleed,
  overflow,
}: {
  children: ReactNode;
  minHeight?: number | string;
  padding?: number;
  fullBleed?: boolean;
  overflow?: "hidden" | "auto" | "visible";
}) {
  const surface = fullBleed ? SHELL.content : SHELL.frame;

  return (
    <div style={{ padding: 10 }}>
      <div
        style={{
          background: surface.bg,
          border: `1px solid ${surface.border}`,
          borderRadius: fullBleed ? 0 : SHELL.frame.radius,
          padding: fullBleed ? 0 : (padding ?? SHELL.frame.pad),
          maxWidth: SHELL.frame.maxWidth,
          margin: "0 auto",
          ...(minHeight != null ? { minHeight } : {}),
          ...(overflow ? { overflow } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
