"use client";

import { useQuery } from "@tanstack/react-query";

export function useMatchSummary(matchId: string) {
  return useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json() as Promise<{
        isRated: boolean;
        ratingAtStart: number | null;
        ratingAfter: number | null;
        ratingDelta: number | null;
      }>;
    },
  });
}
