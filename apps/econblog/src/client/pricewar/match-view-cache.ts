import type { QueryClient } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { clearMatchSessionStorage } from "@/client/pricewar/match-session-storage";
import { getMatchPhasePath } from "@/client/pricewar/match-routing";
import { logMarginShell } from "@/client/pricewar/margin-shell-debug";
import { priceWarPaths } from "@/lib/games/routes";

export function matchViewQueryKey(matchId: string) {
  return ["pricewar", "match", matchId, "view"] as const;
}

export const priceWarHistoryQueryKey = ["pricewar", "history"] as const;

/** Refetch lobby/history lists after match lifecycle changes (forfeit, complete, new match). */
export async function refreshPriceWarHistory(queryClient: QueryClient) {
  try {
    const res = await fetch("/api/pricewar/history", { cache: "no-store" });
    if (res.ok) {
      queryClient.setQueryData(priceWarHistoryQueryKey, await res.json());
      return;
    }
  } catch {
    // fall through to invalidation
  }
  await queryClient.invalidateQueries({ queryKey: priceWarHistoryQueryKey });
}

/** Fetch latest match view and write it into the React Query cache before routing. */
export async function refreshMatchView(
  queryClient: QueryClient,
  matchId: string
): Promise<PlayerView | null> {
  const res = await fetch(`/api/pricewar/match/${matchId}/view`, { cache: "no-store" });
  if (!res.ok) return null;
  const freshView = (await res.json()) as PlayerView;
  queryClient.setQueryData(matchViewQueryKey(matchId), freshView);
  return freshView;
}

type MatchRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

/** Prime view cache, clear stale session keys, and route to the canonical match screen. */
export async function enterMatch(
  queryClient: QueryClient,
  router: MatchRouter,
  matchId: string,
  options?: { replace?: boolean; fallbackPath?: string }
) {
  clearMatchSessionStorage(matchId);
  const freshView = await refreshMatchView(queryClient, matchId);
  await refreshPriceWarHistory(queryClient);
  const dest =
    freshView != null
      ? getMatchPhasePath(matchId, freshView)
      : (options?.fallbackPath ?? priceWarPaths.match.root(matchId));

  logMarginShell("enterMatch", "route", {
    matchId,
    dest,
    phase: freshView?.phase ?? null,
    replace: options?.replace ?? false,
    fallbackPath: options?.fallbackPath ?? null,
  });

  if (options?.replace) {
    router.replace(dest);
  } else {
    router.push(dest);
  }
}
