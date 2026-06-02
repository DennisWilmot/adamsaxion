import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { QueryClient } from "@tanstack/react-query";
import { enterMatch } from "@/client/pricewar/match-view-cache";
import type { PriceWarApiErrorBody } from "@/components/pricewar/screens/PriceWarErrorModal";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { priceWarPaths } from "@/lib/games/routes";

export type JoinQueueResult =
  | { ok: true; matched: true; matchId: string }
  | { ok: true; matched: false; playModeId: string }
  | { ok: false; body: PriceWarApiErrorBody; message: string };

export async function joinMatchmakingQueue(args: {
  playModeId?: string;
  scenarioId?: string;
}): Promise<JoinQueueResult> {
  const playModeId = args.playModeId ?? DEFAULT_MARGIN_PLAY_MODE;
  const scenarioId = args.scenarioId ?? "coffee-shop";

  const res = await fetch("/api/pricewar/matchmaking/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId, playModeId }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, body: data as PriceWarApiErrorBody, message: "Could not join queue" };
  }
  if (data.matched && data.matchId) {
    return { ok: true, matched: true, matchId: data.matchId as string };
  }
  return { ok: true, matched: false, playModeId };
}

export async function startPlayFlow(args: {
  playModeId?: string;
  scenarioId?: string;
  router: AppRouterInstance;
  queryClient: QueryClient;
  onError: (body: PriceWarApiErrorBody, message: string) => void;
}): Promise<void> {
  const result = await joinMatchmakingQueue({
    ...(args.playModeId != null ? { playModeId: args.playModeId } : {}),
    ...(args.scenarioId != null ? { scenarioId: args.scenarioId } : {}),
  });
  if (!result.ok) {
    args.onError(result.body, result.message);
    return;
  }
  if (result.matched) {
    await enterMatch(args.queryClient, args.router, result.matchId);
    return;
  }
  args.router.push(priceWarPaths.queue(result.playModeId));
}
