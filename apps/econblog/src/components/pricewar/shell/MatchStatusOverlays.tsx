"use client";

import { useEffect, useState } from "react";
import { CD } from "@/components/pricewar/design-system/tokens";
import { ModalShell } from "@/components/pricewar/screens/shared/ModalShell";

function graceProgress(endsAt: string): number {
  const remaining = new Date(endsAt).getTime() - Date.now();
  const total = 60_000;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

function graceSecondsLeft(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000));
}

export function OpponentDisconnectedOverlay({
  gracePeriodEndsAt,
  onGraceExpired,
}: {
  gracePeriodEndsAt: string;
  onGraceExpired?: () => void;
}) {
  const [progress, setProgress] = useState(() => graceProgress(gracePeriodEndsAt));
  const [secondsLeft, setSecondsLeft] = useState(() => graceSecondsLeft(gracePeriodEndsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(graceProgress(gracePeriodEndsAt));
      setSecondsLeft(graceSecondsLeft(gracePeriodEndsAt));
    }, 500);
    return () => clearInterval(interval);
  }, [gracePeriodEndsAt]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onGraceExpired?.();
    }
  }, [secondsLeft, onGraceExpired]);

  return (
    <ModalShell width={440}>
      <div style={{ padding: "28px 24px", textAlign: "center" }}>
        <p className="serif" style={{ fontSize: 24, color: CD.ink, fontWeight: 600, margin: 0 }}>
          Opponent disconnected
        </p>
        <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, lineHeight: 1.5 }}>
          Their timer is running. If they do not come back in time, you win by default.
        </p>
        <div
          style={{
            marginTop: 20,
            height: 8,
            borderRadius: 999,
            background: CD.paperDeep,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: CD.primary,
              transition: "width 0.4s linear",
            }}
          />
        </div>
        <p className="num" style={{ fontSize: 12, color: CD.ink3, marginTop: 10 }}>
          {secondsLeft}s remaining
        </p>
      </div>
    </ModalShell>
  );
}
