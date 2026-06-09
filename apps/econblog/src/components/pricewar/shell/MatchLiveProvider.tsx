"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMatchEvents } from "@/client/pricewar/hooks/useMatchEvents";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { logPhaseRedirect } from "@/client/pricewar/explain-phase-redirect";
import { logMarginShell } from "@/client/pricewar/margin-shell-debug";
import {
  getMatchEndPath,
  getMatchPhasePath,
  isActiveReportPath,
  shouldRedirectToPhasePath,
} from "@/client/pricewar/match-routing";
import { isMatchSessionPath, isTerminalMatchPath } from "@/client/pricewar/match-shell-paths";
import { matchViewQueryKey, refreshMatchView } from "@/client/pricewar/match-view-cache";
import type { MarginMatchView } from "@/client/pricewar/match-view-types";
import { OpponentDisconnectedOverlay } from "@/components/pricewar/shell/MatchStatusOverlays";

export function MatchLiveProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: view } = useMatchView(matchId);
  const inMatchSession = isMatchSessionPath(pathname);
  const [disconnectGraceEndsAt, setDisconnectGraceEndsAt] = useState<string | null>(
    null
  );
  const [phaseSyncing, setPhaseSyncing] = useState(false);

  const refreshMatchAfterGrace = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["pricewar", "match", matchId] });
  }, [matchId, queryClient]);

  useEffect(() => {
    logPhaseRedirect("MatchLiveProvider", pathname, matchId, view ?? null, {
      inMatchSession,
      phaseSyncing,
    });

    if (!view) {
      setPhaseSyncing(false);
      return;
    }
    if (!shouldRedirectToPhasePath(pathname, view)) {
      setPhaseSyncing(false);
      return;
    }
    const target = getMatchPhasePath(matchId, view);
    if (pathname === target) {
      setPhaseSyncing(false);
      return;
    }
    logMarginShell("MatchLiveProvider", "redirect", {
      from: pathname,
      to: target,
      phase: view.phase,
      meHasLocked: view.meHasLocked,
    });
    setPhaseSyncing(true);
    router.replace(target);
  }, [view, pathname, matchId, router, inMatchSession]);

  useMatchEvents(matchId, {
    onMatchStarted: () => {
      logMarginShell("MatchLiveProvider", "sse:match_started", { pathname, inMatchSession });
      if (inMatchSession) {
        void refreshMatchView(queryClient, matchId);
      } else {
        router.refresh();
      }
    },
    onMatchEnded: async () => {
      logMarginShell("MatchLiveProvider", "sse:match_ended", { pathname });
      setDisconnectGraceEndsAt(null);
      const freshView = await refreshMatchView(queryClient, matchId);
      if (freshView) {
        const target = getMatchEndPath(matchId, freshView);
        logMarginShell("MatchLiveProvider", "redirect after match ended", { to: target });
        if (pathname !== target) {
          router.replace(target);
        }
      }
    },
    onOpponentDisconnected: (gracePeriodEndsAt) => {
      if (view?.opponent.isBot) return;
      setDisconnectGraceEndsAt(gracePeriodEndsAt);
    },
    onRoundResolved: async () => {
      logMarginShell("MatchLiveProvider", "sse:round_resolved", { pathname });
      setDisconnectGraceEndsAt(null);
      // useMatchEvents already wrote the resolved view into the cache from the
      // SSE payload — read it directly and only fall back to the network if the
      // event somehow arrived without a view.
      const freshView =
        queryClient.getQueryData<MarginMatchView>(matchViewQueryKey(matchId)) ??
        (await refreshMatchView(queryClient, matchId));
      if (!freshView) return;

      if (freshView.phase === "completed") {
        const target = getMatchEndPath(matchId, freshView);
        logMarginShell("MatchLiveProvider", "redirect after round resolved (completed)", {
          from: pathname,
          to: target,
        });
        if (pathname !== target) {
          router.replace(target);
        }
        return;
      }

      if (isTerminalMatchPath(pathname)) {
        return;
      }

      if (isActiveReportPath(pathname, freshView)) {
        return;
      }

      const target = getMatchPhasePath(matchId, freshView);
      logMarginShell("MatchLiveProvider", "redirect after round resolved", {
        from: pathname,
        to: target,
        phase: freshView.phase,
      });
      if (pathname !== target) {
        router.replace(target);
      }
    },
  });

  useEffect(() => {
    if (view?.phase === "completed") {
      setDisconnectGraceEndsAt(null);
    }
  }, [view?.phase]);

  useEffect(() => {
    if (!phaseSyncing || !view) return;
    if (!shouldRedirectToPhasePath(pathname, view)) {
      setPhaseSyncing(false);
    }
  }, [phaseSyncing, pathname, view]);

  return (
    <>
      {disconnectGraceEndsAt && !view?.opponent.isBot && (
        <OpponentDisconnectedOverlay
          gracePeriodEndsAt={disconnectGraceEndsAt}
          onGraceExpired={refreshMatchAfterGrace}
        />
      )}
      {children}
    </>
  );
}
