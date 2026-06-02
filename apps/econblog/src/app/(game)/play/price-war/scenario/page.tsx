"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { startPlayFlow } from "@/client/pricewar/join-queue";
import { ScenarioScreen } from "@/components/pricewar/screens/ScenarioScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";

export default function ScenarioPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { showApiError } = usePriceWarError();

  async function onPlay(scenarioId: string, playModeId: string) {
    if (scenarioId !== "coffee-shop") return;
    setLoading(true);
    try {
      await startPlayFlow({
        playModeId,
        scenarioId,
        router,
        queryClient,
        onError: (body, message) => showApiError(body, message),
      });
    } finally {
      setLoading(false);
    }
  }

  return <ScenarioScreen onPlay={onPlay} loading={loading} />;
}
