"use client";

import { CD } from "../../design-system/tokens";

export interface ModalShellProps {
  children: React.ReactNode;
  width?: number;
  align?: "center" | "top";
  scrim?: number;
  onScrimClick?: () => void;
}

export function ModalShell({
  children,
  width = 520,
  align = "center",
  scrim = 0.35,
  onScrimClick,
}: ModalShellProps) {
  return (
    <div
      role="presentation"
      onClick={onScrimClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: `oklch(0.22 0.025 55 / ${scrim})`,
        display: "flex",
        alignItems: align === "top" ? "flex-start" : "center",
        justifyContent: "center",
        padding: 28,
        paddingTop: align === "top" ? 60 : 28,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="cd-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 18,
          boxShadow: "0 24px 60px -16px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
