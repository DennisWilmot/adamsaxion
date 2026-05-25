"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { PostmatchScreen } from "@/components/pricewar/screens/PostmatchScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

export default function PostMatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);
  const { showApiError } = usePriceWarError();

  const summaryQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed",
  });

  const coachQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "coach"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/coach`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed" && view?.playModeId !== "tutorial",
  });

  if (!view || view.phase !== "completed") {
    return <p className="text-foreground-muted">Loading post-match…</p>;
  }

  const won = view.outcome.kind === "win" && view.me.slot === view.outcome.winner;
  const summary = summaryQuery.data;
  const coach = coachQuery.data?.report;

  async function playAgain() {
    if (!view) return;
    const res = await fetch("/api/pricewar/match/vs-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: view.scenarioId,
        playModeId: view.playModeId === "tutorial" ? "blitz" : view.playModeId,
        botPersonalityId: "bot.budget",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(priceWarPaths.match.briefing(data.matchId));
    } else {
      showApiError(data, "Could not start a new match");
    }
  }

  return (
    <PostmatchScreen
      view={view}
      youWon={won}
      ratingDelta={summary?.ratingDelta ?? null}
      ratingAfter={summary?.ratingAfter ?? null}
      coachLine={coach?.oneLinerVerdict}
      onPlayAgain={() => void playAgain()}
    />
  );
}
