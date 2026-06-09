"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { matchViewQueryKey, refreshMatchView } from "@/client/pricewar/match-view-cache";
import { pickNewerView } from "@/client/pricewar/match-view-progress";

export type MatchEvent =
  | { type: "opponent_locked"; round: number }
  | { type: "round_resolved"; round: number; view?: PlayerView }
  | { type: "match_started"; view?: PlayerView }
  | { type: "match_ended"; finalView?: PlayerView }
  | { type: "clock_warning"; remainingMs: number }
  | { type: "opponent_disconnected"; gracePeriodEndsAt: string };

export function useMatchEvents(
  matchId: string,
  handlers: {
    onRoundResolved?: (round: number) => void;
    onMatchEnded?: () => void;
    onMatchStarted?: () => void;
    onOpponentLocked?: (round: number) => void;
    onOpponentDisconnected?: (gracePeriodEndsAt: string) => void;
    onClockWarning?: (remainingMs: number) => void;
  }
) {
  const queryClient = useQueryClient();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const source = new EventSource(`/api/pricewar/match/${matchId}/events`);

    // Match events carry per-slot views but fan out to BOTH players on the same
    // channel. Reject any incoming view that belongs to the other slot so we
    // never apply the opponent's perspective over ours (which showed up as a
    // green "opponent left" flash when forfeiting, and stale value flicker).
    const isOtherSlot = (
      prev: PlayerView | undefined,
      incoming: PlayerView | undefined
    ): boolean => Boolean(prev && incoming && incoming.me.slot !== prev.me.slot);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as MatchEvent;
        if (payload.type === "round_resolved") {
          if (payload.view) {
            queryClient.setQueryData(matchViewQueryKey(matchId), (prev: PlayerView | undefined) => {
              if (prev?.phase === "completed") return prev;
              if (isOtherSlot(prev, payload.view)) return prev;
              return pickNewerView(prev, payload.view!);
            });
          } else {
            void refreshMatchView(queryClient, matchId);
          }
          handlersRef.current.onRoundResolved?.(payload.round);
        }
        if (payload.type === "match_ended") {
          if (payload.finalView) {
            queryClient.setQueryData(matchViewQueryKey(matchId), (prev: PlayerView | undefined) =>
              isOtherSlot(prev, payload.finalView) ? prev : payload.finalView!
            );
          } else {
            void refreshMatchView(queryClient, matchId);
          }
          handlersRef.current.onMatchEnded?.();
        }
        if (payload.type === "match_started") {
          if (payload.view) {
            queryClient.setQueryData(matchViewQueryKey(matchId), (prev: PlayerView | undefined) =>
              isOtherSlot(prev, payload.view) ? prev : payload.view!
            );
          } else {
            void refreshMatchView(queryClient, matchId);
          }
          handlersRef.current.onMatchStarted?.();
        }
        if (payload.type === "opponent_locked") {
          // Patch the flag directly instead of refetching — the only thing this
          // event changes is the opponent's locked state for the current round.
          queryClient.setQueryData(
            matchViewQueryKey(matchId),
            (prev: PlayerView | undefined) => {
              if (!prev || prev.phase !== "decide") return prev;
              if (prev.market.currentRound !== payload.round) return prev;
              if (prev.opponentHasLocked) return prev;
              return { ...prev, opponentHasLocked: true };
            }
          );
          handlersRef.current.onOpponentLocked?.(payload.round);
        }
        if (payload.type === "opponent_disconnected") {
          handlersRef.current.onOpponentDisconnected?.(payload.gracePeriodEndsAt);
        }
        if (payload.type === "clock_warning") {
          handlersRef.current.onClockWarning?.(payload.remainingMs);
        }
      } catch {
        // heartbeat
      }
    };

    return () => source.close();
  }, [matchId, queryClient]);
}
