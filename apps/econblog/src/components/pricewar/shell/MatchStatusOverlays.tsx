"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlayerView } from "@adamsaxion/pricewar-types";

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
}: {
  gracePeriodEndsAt: string;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-lg">
      <Card className="w-full max-w-md bg-surface-raised">
        <CardContent className="space-y-lg py-2xl text-center">
          <p className="font-display text-xl font-bold">Opponent disconnected</p>
          <p className="text-sm text-foreground-secondary">
            Their clock is running down. If they don&apos;t return within the grace
            period, you&apos;ll win by forfeit.
          </p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-foreground-muted">{secondsLeft}s remaining</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function MatchLobbyScreen({ view }: { view: PlayerView }) {
  const graceSec =
    view.playModeId === "rapid" ? 120 : view.playModeId === "blitz" ? 60 : 60;

  return (
    <Card className="mx-auto max-w-lg bg-surface-raised">
      <CardContent className="space-y-lg py-3xl text-center">
        <p className="font-display text-xl font-bold">Waiting for opponent</p>
        <p className="text-sm text-foreground-secondary">
          Match starts when both players are connected. No-show after {graceSec}s
          is a forfeit.
        </p>
        <p className="text-foreground-muted">
          Opponent: <strong className="text-foreground">{view.opponent.displayName}</strong>
        </p>
      </CardContent>
    </Card>
  );
}
