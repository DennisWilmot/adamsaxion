"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { MarginMatchView } from "@/client/pricewar/match-view-types";

import { matchViewQueryKey } from "@/client/pricewar/match-view-cache";
import { pickNewerView } from "@/client/pricewar/match-view-progress";

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
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: matchViewQueryKey(matchId),
    queryFn: async (): Promise<MarginMatchView> => {
      const res = await fetch(`/api/pricewar/match/${matchId}/view`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load match");
      const incoming = (await res.json()) as MarginMatchView;
      // Reject stale poll results that would regress a freshly-resolved view
      // (prevents the on-screen cash/numbers from bouncing backwards).
      const prev = queryClient.getQueryData<MarginMatchView>(matchViewQueryKey(matchId));
      return pickNewerView(prev, incoming);
    },
    refetchInterval: (query) => matchViewPollMs(query.state.data),
    refetchOnWindowFocus: true,
  });
}
