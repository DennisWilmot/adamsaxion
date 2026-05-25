"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";

export function useMatchView(matchId: string) {
  return useQuery({
    queryKey: ["pricewar", "match", matchId, "view"],
    queryFn: async (): Promise<PlayerView> => {
      const res = await fetch(`/api/pricewar/match/${matchId}/view`);
      if (!res.ok) throw new Error("Failed to load match");
      return res.json();
    },
    refetchInterval: 5000,
  });
}
