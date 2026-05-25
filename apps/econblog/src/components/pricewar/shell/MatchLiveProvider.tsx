"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMatchEvents } from "@/client/pricewar/hooks/useMatchEvents";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import {
  getMatchEndPath,
  getMatchPhasePath,
  shouldRedirectToPhasePath,
} from "@/client/pricewar/match-routing";
import { priceWarPaths } from "@/lib/games/routes";
import { OpponentDisconnectedOverlay } from "@/components/pricewar/shell/MatchStatusOverlays";

export function MatchLiveProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const router = useRouter();
  const pathname = usePathname();
  const { data: view } = useMatchView(matchId);
  const [disconnectGraceEndsAt, setDisconnectGraceEndsAt] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!view) return;
    if (!shouldRedirectToPhasePath(pathname, view)) return;
    router.replace(getMatchPhasePath(matchId, view));
  }, [view, pathname, matchId, router]);

  useMatchEvents(matchId, {
    onMatchStarted: () => {
      router.refresh();
    },
    onMatchEnded: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/view`);
      if (!res.ok) return;
      const freshView = await res.json();
      router.replace(getMatchEndPath(matchId, freshView));
    },
    onOpponentDisconnected: (gracePeriodEndsAt) => {
      setDisconnectGraceEndsAt(gracePeriodEndsAt);
    },
    onRoundResolved: (round) => {
      router.push(priceWarPaths.match.report(matchId, round));
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
