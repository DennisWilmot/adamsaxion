import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { ensureMatchLifecycle } from "@/server/pricewar/clock";
import { tryResolveStaleLockedRound } from "@/server/pricewar/resolver";
import { buildPlayerView } from "@/server/pricewar/player-view";
import { getPlayerSlot, loadMatch } from "@/server/pricewar/repository";

function isDebugRequest(request: Request): boolean {
  try {
    return new URL(request.url).searchParams.get("debug") === "1";
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  let state = await ensureMatchLifecycle(matchId, auth.user.id);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  await tryResolveStaleLockedRound(matchId);
  state = (await loadMatch(matchId)) ?? state;

  const view = await buildPlayerView(matchId, slot, state, {
    debug: isDebugRequest(request),
  });

  return jsonOk(view);
}
