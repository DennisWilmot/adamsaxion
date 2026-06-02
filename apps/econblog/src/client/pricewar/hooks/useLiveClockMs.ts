"use client";

import { useEffect, useState } from "react";

/** Smooth 1s countdown between server clock syncs. */
export function useLiveClockMs(
  remainingMs: number,
  tickingSince: string | null | undefined,
  active: boolean
): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !tickingSince) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, tickingSince]);

  if (!active || !tickingSince) return remainingMs;

  const elapsed = Math.max(0, nowMs - new Date(tickingSince).getTime());
  return Math.max(0, remainingMs - elapsed);
}
