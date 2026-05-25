"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type QueueStatus =
  | { inQueue: true; elapsedSec: number; botFallbackInSec: number }
  | { inQueue: false; matched?: boolean; matchId?: string; phase?: string };

function matchPath(matchId: string, phase?: string) {
  if (phase === "waiting_for_opponent") {
    return `/play/match/${matchId}/waiting`;
  }
  return `/play/match/${matchId}/decide`;
}

export default function QueuePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playModeId = searchParams.get("mode") ?? "blitz";
  const [elapsedSec, setElapsedSec] = useState(0);
  const [fallbackSec, setFallbackSec] = useState(60);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch("/api/pricewar/matchmaking/status");
      if (!res.ok) return;
      const data = (await res.json()) as QueueStatus;

      if (data.inQueue) {
        setElapsedSec(data.elapsedSec ?? 0);
        setFallbackSec(data.botFallbackInSec ?? 60);
        return;
      }

      if (data.matched && data.matchId) {
        router.push(matchPath(data.matchId, data.phase));
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [router]);

  async function cancel() {
    await fetch("/api/pricewar/matchmaking/cancel", { method: "POST" });
    router.push("/play");
  }

  async function playBotInstead() {
    await fetch("/api/pricewar/matchmaking/cancel", { method: "POST" });
    const res = await fetch("/api/pricewar/match/vs-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: "coffee-shop",
        playModeId,
        botPersonalityId: "bot.budget",
      }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/play/match/${data.matchId}/decide`);
  }

  const progress = Math.min(100, (elapsedSec / fallbackSec) * 100);

  return (
    <Card className="mx-auto max-w-lg bg-surface-raised">
      <CardContent className="space-y-xl py-3xl text-center">
        <p className="font-display text-xl font-bold">Searching for opponent…</p>
        <p className="text-sm text-foreground-muted capitalize">{playModeId} · Coffee Shop</p>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-foreground-muted">
          {Math.max(0, fallbackSec - elapsedSec)}s until bot fallback offered
        </p>
        <div className="flex flex-col gap-md sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={cancel}>
            Cancel
          </Button>
          {elapsedSec >= fallbackSec && (
            <Button onClick={playBotInstead}>Play a bot instead</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
