"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import {
  BriefingScreen,
  hasSeenBriefing,
  markBriefingSeen,
} from "@/components/pricewar/screens/BriefingScreen";
import { priceWarPaths } from "@/lib/games/routes";
import { useEffect } from "react";

export default function BriefingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view, isLoading } = useMatchView(matchId);

  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", view?.playModeId ?? "blitz"],
    queryFn: async () => {
      const mode = view?.playModeId ?? "blitz";
      const res = await fetch(`/api/pricewar/rating/coffee-shop?playModeId=${mode}`);
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number }>;
    },
    enabled: !!view && view.playModeId !== "tutorial",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (view?.playModeId === "tutorial" || hasSeenBriefing(matchId)) {
      router.replace(priceWarPaths.match.decide(matchId));
    }
  }, [view, matchId, router]);

  if (isLoading || !view) {
    return <p className="text-foreground-muted">Loading briefing…</p>;
  }

  if (view.playModeId === "tutorial") {
    return null;
  }

  function begin() {
    markBriefingSeen(matchId);
    router.push(priceWarPaths.match.decide(matchId));
  }

  return (
    <BriefingScreen
      view={view}
      myElo={ratingQuery.data?.rating ?? null}
      onBegin={begin}
    />
  );
}
