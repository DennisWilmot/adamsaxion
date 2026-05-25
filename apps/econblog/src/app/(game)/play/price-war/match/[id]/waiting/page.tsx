"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { LockedScreen, loadLockedMoves } from "@/components/pricewar/screens/LockedScreen";
import { priceWarPaths } from "@/lib/games/routes";

export default function WaitingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  useEffect(() => {
    const source = new EventSource(`/api/pricewar/match/${matchId}/events`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "round_resolved") {
          router.push(priceWarPaths.match.report(matchId, payload.round));
        }
      } catch {
        // ignore heartbeat / malformed
      }
    };
    return () => source.close();
  }, [matchId, router]);

  if (!view) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <LockedScreen matchId={matchId} view={view} lockedMoves={loadLockedMoves(matchId)} />
  );
}
