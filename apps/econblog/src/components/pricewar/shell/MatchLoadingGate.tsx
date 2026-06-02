"use client";

import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { CD } from "../design-system/tokens";

export interface MatchLoadingGateProps {
  message?: string;
  /** Fixed overlay — use for in-screen async actions (lobby, review submit). */
  overlay?: boolean;
  minHeight?: string | number;
}

export function MatchLoadingGate({
  message = "Loading…",
  overlay = false,
  minHeight = "min(70vh, 520px)",
}: MatchLoadingGateProps) {
  const body = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        minHeight: overlay ? undefined : minHeight,
        padding: overlay ? 32 : "48px 24px",
      }}
    >
      <div className="cd-spinner" aria-hidden="true" />
      <p className="tab" style={{ margin: 0, color: CD.ink3 }}>
        {message}
      </p>
    </div>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.98 0.01 85 / 0.92)",
          backdropFilter: "blur(4px)",
        }}
      >
        <CafeDuelRoot style={{ width: "100%" }}>{body}</CafeDuelRoot>
      </div>
    );
  }

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%" }}>{body}</CafeDuelRoot>
  );
}
