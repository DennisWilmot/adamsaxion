"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMatchEvents } from "@/client/pricewar/hooks/useMatchEvents";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { getMatchEndPath } from "@/client/pricewar/match-routing";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { OpponentDisconnectedOverlay } from "@/components/pricewar/shell/MatchStatusOverlays";

export function MatchLiveProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const router = useRouter();
  useMatchView(matchId);
  const [disconnectGraceEndsAt, setDisconnectGraceEndsAt] = useState<string | null>(
    null
  );

  useMatchEvents(matchId, {
    onMatchStarted: () => {
      router.refresh();
    },
    onMatchEnded: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/view`);
      if (!res.ok) return;
      const view = (await res.json()) as PlayerView;
      router.replace(getMatchEndPath(matchId, view));
    },
    onOpponentDisconnected: (gracePeriodEndsAt) => {
      setDisconnectGraceEndsAt(gracePeriodEndsAt);
    },
    onRoundResolved: (round) => {
      if (window.location.pathname.includes("/waiting")) {
        router.push(`/play/match/${matchId}/report/${round}`);
      }
    },
  });

  return (
    <>
      {disconnectGraceEndsAt && (
        <OpponentDisconnectedOverlay gracePeriodEndsAt={disconnectGraceEndsAt} />
      )}
      {children}
    </>
  );
}
