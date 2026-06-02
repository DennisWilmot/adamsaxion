"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { enterMatch } from "@/client/pricewar/match-view-cache";
import { QueuePanel } from "@/components/pricewar/screens/QueueScreen";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { priceWarPaths } from "@/lib/games/routes";

type QueueStatus =
  | {
      inQueue: true;
      elapsedSec: number;
    }
  | { inQueue: false; matched?: boolean; matchId?: string; phase?: string };

export default function QueuePageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const playModeId = searchParams.get("mode") ?? DEFAULT_MARGIN_PLAY_MODE;
  const [elapsedSec, setElapsedSec] = useState(0);
  const [matched, setMatched] = useState(false);

  const pollStatus = useCallback(async () => {
    const res = await fetch("/api/pricewar/matchmaking/status");
    if (!res.ok) return;
    const data = (await res.json()) as QueueStatus;

    if (data.inQueue) {
      setElapsedSec(data.elapsedSec ?? 0);
      return;
    }

    if (data.matched && data.matchId) {
      setMatched(true);
      await enterMatch(queryClient, router, data.matchId);
    }
  }, [queryClient, router]);

  useEffect(() => {
    void pollStatus();
    const poll = setInterval(() => {
      void pollStatus();
    }, 2000);
    return () => clearInterval(poll);
  }, [pollStatus]);

  async function cancel() {
    await fetch("/api/pricewar/matchmaking/cancel", { method: "POST" });
    router.push(priceWarPaths.lobby);
  }

  return (
    <MarginShellFrame>
      <QueuePanel
        playModeId={playModeId}
        elapsedSec={elapsedSec}
        onCancel={cancel}
        enteringMatch={matched}
      />
    </MarginShellFrame>
  );
}
