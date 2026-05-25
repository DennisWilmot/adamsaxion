"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LobbyScreen } from "@/components/pricewar/screens/LobbyScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

export default function PriceWarLobbyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showApiError } = usePriceWarError();

  const subscriptionQuery = useQuery({
    queryKey: ["user", "subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) return { subscription: { hasAccess: false } };
      return res.json();
    },
  });

  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", "blitz"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/rating/coffee-shop?playModeId=blitz");
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number }>;
    },
  });

  const historyQuery = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  const isPaid = subscriptionQuery.data?.subscription?.hasAccess === true;

  async function startVsBot(playModeId: string) {
    setLoading(true);
    try {
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
      if (!res.ok) {
        showApiError(data, "Could not start match");
        return;
      }
      const dest =
        playModeId === "tutorial"
          ? priceWarPaths.match.decide(data.matchId)
          : priceWarPaths.match.briefing(data.matchId);
      router.push(dest);
    } finally {
      setLoading(false);
    }
  }

  async function findHumanMatch(playModeId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pricewar/matchmaking/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: "coffee-shop", playModeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(data, "Could not join queue");
        return;
      }
      if (data.matched && data.matchId) {
        router.push(priceWarPaths.match.briefing(data.matchId));
        return;
      }
      router.push(priceWarPaths.queue(playModeId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LobbyScreen
      isPaid={isPaid}
      elo={ratingQuery.data?.rating ?? null}
      matches={historyQuery.data?.matches ?? []}
      loading={loading}
      onQuickMatch={(mode) => findHumanMatch(mode)}
      onVsBot={startVsBot}
    />
  );
}
