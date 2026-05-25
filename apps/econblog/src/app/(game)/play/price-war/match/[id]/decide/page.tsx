"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { getMatchEndPath, getMatchPhasePath } from "@/client/pricewar/match-routing";
import { DecideScreen } from "@/components/pricewar/decide/DecideScreen";
import { CafeMatchLobbyScreen } from "@/components/pricewar/screens/CafeMatchLobbyScreen";
import { hasSeenBriefing } from "@/components/pricewar/screens/BriefingScreen";
import { priceWarPaths } from "@/lib/games/routes";

export default function DecidePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view, isLoading } = useMatchView(matchId);

  function goToReview(nextDraft: SubmittedMove[]) {
    sessionStorage.setItem(`pricewar:draft:${matchId}`, JSON.stringify(nextDraft));
    router.push(priceWarPaths.match.review(matchId));
  }

  useEffect(() => {
    if (!view) return;
    if (view.phase === "report") {
      router.replace(getMatchPhasePath(matchId, view));
      return;
    }
    if (view.phase === "completed") {
      router.replace(getMatchEndPath(matchId, view));
      return;
    }
    if (
      view.playModeId !== "tutorial" &&
      view.market.currentRound === 1 &&
      view.phase === "decide" &&
      !hasSeenBriefing(matchId)
    ) {
      router.replace(priceWarPaths.match.briefing(matchId));
    }
  }, [view, matchId, router]);

  if (isLoading || !view) {
    return <p className="text-foreground-muted">Loading match…</p>;
  }

  if (view.phase === "waiting_for_opponent") {
    return <CafeMatchLobbyScreen view={view} />;
  }

  return <DecideScreen matchId={matchId} view={view} onReview={goToReview} />;
}
