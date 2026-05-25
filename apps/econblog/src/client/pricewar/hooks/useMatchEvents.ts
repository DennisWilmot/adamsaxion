"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type MatchEvent =
  | { type: "opponent_locked"; round: number }
  | { type: "round_resolved"; round: number }
  | { type: "match_started" }
  | { type: "match_ended" }
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

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as MatchEvent;
        if (payload.type === "round_resolved") {
          queryClient.invalidateQueries({ queryKey: ["pricewar", "match", matchId] });
          handlersRef.current.onRoundResolved?.(payload.round);
        }
        if (payload.type === "match_ended") {
          queryClient.invalidateQueries({ queryKey: ["pricewar", "match", matchId] });
          handlersRef.current.onMatchEnded?.();
        }
        if (payload.type === "match_started") {
          queryClient.invalidateQueries({ queryKey: ["pricewar", "match", matchId] });
          handlersRef.current.onMatchStarted?.();
        }
        if (payload.type === "opponent_locked") {
          queryClient.invalidateQueries({ queryKey: ["pricewar", "match", matchId, "view"] });
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
