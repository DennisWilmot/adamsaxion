"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScenarioScreen } from "@/components/pricewar/screens/ScenarioScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

export default function ScenarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showApiError } = usePriceWarError();

  async function onQueue(scenarioId: string, playModeId: string) {
    if (scenarioId !== "coffee-shop") return;
    setLoading(true);
    try {
      const res = await fetch("/api/pricewar/matchmaking/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, playModeId }),
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

  async function onPractice(scenarioId: string) {
    if (scenarioId !== "coffee-shop") return;
    setLoading(true);
    try {
      const res = await fetch("/api/pricewar/match/vs-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          playModeId: "blitz",
          botPersonalityId: "bot.budget",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(data, "Could not start match");
        return;
      }
      router.push(priceWarPaths.match.briefing(data.matchId));
    } finally {
      setLoading(false);
    }
  }

  return <ScenarioScreen onQueue={onQueue} onPractice={onPractice} loading={loading} />;
}
