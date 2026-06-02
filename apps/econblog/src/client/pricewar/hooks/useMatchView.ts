"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";

import { matchViewQueryKey } from "@/client/pricewar/match-view-cache";

function matchViewPollMs(view: PlayerView | undefined): number | false {
  if (!view) return 1500;

  switch (view.phase) {
    case "decide":
      if (view.opponentHasLocked && !view.meHasLocked) return 500;
      return 2000;
    case "resolving":
      return 1000;
    case "waiting_for_opponent":
      return 2500;
    case "report":
      return 5000;
    case "completed":
      return false;
    default:
      return 3000;
  }
}

export function useMatchView(matchId: string) {
  return useQuery({
    queryKey: matchViewQueryKey(matchId),
    queryFn: async (): Promise<PlayerView> => {
      const res = await fetch(`/api/pricewar/match/${matchId}/view`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load match");
      return res.json();
    },
    refetchInterval: (query) => matchViewPollMs(query.state.data),
    refetchOnWindowFocus: true,
  });
}
