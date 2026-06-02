"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { enterMatch } from "@/client/pricewar/match-view-cache";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { MatchLoadingGate } from "@/components/pricewar/shell/MatchLoadingGate";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";
import { priceWarPaths } from "@/lib/games/routes";

export default function TutorialStartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showApiError } = usePriceWarError();

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const res = await fetch("/api/pricewar/match/vs-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "coffee-shop",
          playModeId: "tutorial",
        }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        showApiError(data, "Could not start tutorial");
        router.replace(priceWarPaths.lobby);
        return;
      }
      await enterMatch(queryClient, router, data.matchId, {
        replace: true,
      });
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [queryClient, router, showApiError]);

  return (
    <MarginShellFrame contentPadding={0}>
      <MatchLoadingGate message="Setting up your first match…" minHeight={420} />
    </MarginShellFrame>
  );
}
