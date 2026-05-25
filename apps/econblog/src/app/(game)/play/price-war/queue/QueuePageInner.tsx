"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueueScreen } from "@/components/pricewar/screens/QueueScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

type QueueStatus =
  | {
      inQueue: true;
      elapsedSec: number;
      botFallbackInSec: number;
      secondsUntilBotFallback: number;
    }
  | { inQueue: false; matched?: boolean; matchId?: string; botFallback?: boolean; phase?: string };

export default function QueuePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playModeId = searchParams.get("mode") ?? "blitz";
  const [elapsedSec, setElapsedSec] = useState(0);
  const [fallbackSec, setFallbackSec] = useState(playModeId === "blitz" ? 30 : playModeId === "rapid" ? 45 : 60);
  const [secondsUntilBotFallback, setSecondsUntilBotFallback] = useState(fallbackSec);
  const [matchingBot, setMatchingBot] = useState(false);
  const { showApiError } = usePriceWarError();

  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", playModeId],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/rating/coffee-shop?playModeId=${playModeId}`);
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number }>;
    },
  });

  const pollStatus = useCallback(async () => {
    const res = await fetch("/api/pricewar/matchmaking/status");
    if (!res.ok) return;
    const data = (await res.json()) as QueueStatus;

    if (data.inQueue) {
      setElapsedSec(data.elapsedSec ?? 0);
      setFallbackSec(data.botFallbackInSec ?? 60);
      const remaining = data.secondsUntilBotFallback ?? 0;
      setSecondsUntilBotFallback(remaining);
      setMatchingBot(remaining <= 0);
      return;
    }

    if (data.matched && data.matchId) {
      router.push(priceWarPaths.match.briefing(data.matchId));
    }
  }, [router]);

  useEffect(() => {
    void pollStatus();
    const poll = setInterval(() => {
      void pollStatus();
    }, 2000);
    return () => clearInterval(poll);
  }, [pollStatus]);

  async function cancel() {
    await fetch("/api/pricewar/matchmaking/cancel", { method: "POST" });
    router.push(priceWarPaths.lobby);
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
    if (res.ok) {
      router.push(priceWarPaths.match.briefing(data.matchId));
    } else {
      showApiError(data, "Could not start bot match");
    }
  }

  return (
    <QueueScreen
      playModeId={playModeId}
      elo={ratingQuery.data?.rating ?? null}
      elapsedSec={elapsedSec}
      fallbackSec={fallbackSec}
      secondsUntilBotFallback={secondsUntilBotFallback}
      matchingBot={matchingBot}
      onCancel={cancel}
      onPlayBot={() => {
        void playBotInstead();
      }}
    />
  );
}
