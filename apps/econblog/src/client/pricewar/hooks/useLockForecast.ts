"use client";

import { useQuery } from "@tanstack/react-query";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import type { LockForecastLine } from "@adamsaxion/pricewar-engine";

export function useLockForecast(matchId: string, draft: SubmittedMove[]) {
  return useQuery({
    queryKey: ["pricewar", "match", matchId, "forecast", draft],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moves: draft }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Failed to load forecast");
      }
      const data = (await res.json()) as { lines: LockForecastLine[] };
      return data.lines;
    },
    enabled: draft.length > 0,
    staleTime: 0,
  });
}
