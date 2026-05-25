"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { AbandonmentScreen } from "@/components/pricewar/screens/AbandonmentScreen";

export default function AbandonedPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  const summaryQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed",
  });

  const reason =
    view?.outcome.kind === "win" && view.outcome.reason === "forfeit_on_timeout"
      ? "Your clock expired — the match was forfeited."
      : "The match ended because a player abandoned or disconnected.";

  if (!view) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <AbandonmentScreen
      view={view}
      reason={reason}
      partialElo={summaryQuery.data?.ratingDelta ?? null}
    />
  );
}
