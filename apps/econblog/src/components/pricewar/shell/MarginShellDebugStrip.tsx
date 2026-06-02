"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isMarginShellDebugEnabled, logMarginShell } from "@/client/pricewar/margin-shell-debug";

/** On-screen shell state strip — visible in dev or with ?debug=1. */
export function MarginShellDebugStrip({
  matchId,
  panel,
  phase,
  shellMode,
  shouldRedirect,
}: {
  matchId?: string;
  panel?: string;
  phase?: string;
  shellMode?: string;
  shouldRedirect?: boolean | string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isMarginShellDebugEnabled()) return;
    logMarginShell("DebugStrip", "render", {
      pathname,
      matchId,
      panel,
      phase,
      shellMode,
      shouldRedirect,
    });
  }, [pathname, matchId, panel, phase, shellMode, shouldRedirect]);

  if (!isMarginShellDebugEnabled()) return null;

  const lines = [
    `path: ${pathname}`,
    matchId ? `match: ${matchId}` : null,
    panel ? `panel: ${panel}` : null,
    phase ? `phase: ${phase}` : null,
    shellMode ? `shellMode: ${shellMode}` : null,
    shouldRedirect != null ? `shouldRedirect: ${String(shouldRedirect)}` : null,
  ].filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        right: 8,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        lineHeight: 1.35,
        color: "#f8fafc",
        background: "oklch(0.22 0.03 250 / 0.92)",
        border: "1px solid #64748b",
        borderRadius: 8,
        padding: "8px 10px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <strong style={{ color: "#93c5fd" }}>MarginShell debug</strong>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
