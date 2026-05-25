"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { getMatchEndPath } from "@/client/pricewar/match-routing";
import { ReviewScreen } from "@/components/pricewar/screens/ReviewScreen";
import { saveLockedMoves } from "@/components/pricewar/screens/LockedScreen";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);
  const [draft, setDraft] = useState<SubmittedMove[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { showApiError } = usePriceWarError();

  useEffect(() => {
    const raw = sessionStorage.getItem(`pricewar:draft:${matchId}`);
    if (raw) setDraft(JSON.parse(raw) as SubmittedMove[]);
  }, [matchId]);

  async function lockIn() {
    setSubmitting(true);
    try {
      saveLockedMoves(matchId, draft);
      const res = await fetch(`/api/pricewar/match/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moves: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(data, "Submit failed");
        return;
      }
      sessionStorage.removeItem(`pricewar:draft:${matchId}`);
      if (data.resolved) {
        router.push(
          priceWarPaths.match.report(matchId, data.resolvedRound ?? view?.market.currentRound ?? 1)
        );
      } else if (data.phase === "completed") {
        const viewRes = await fetch(`/api/pricewar/match/${matchId}/view`);
        if (viewRes.ok) {
          const freshView = await viewRes.json();
          router.push(getMatchEndPath(matchId, freshView));
        } else {
          router.push(priceWarPaths.match.postmatch(matchId));
        }
      } else {
        router.push(priceWarPaths.match.waiting(matchId));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!view) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <ReviewScreen
      matchId={matchId}
      view={view}
      draft={draft}
      onSubmit={lockIn}
      submitting={submitting}
    />
  );
}
