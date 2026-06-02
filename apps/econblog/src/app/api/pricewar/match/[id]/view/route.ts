import type { MatchId } from "@adamsaxion/pricewar-types";
import { toPlayerView } from "@adamsaxion/pricewar-engine";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { ensureMatchLifecycle } from "@/server/pricewar/clock";
import { tryResolveStaleLockedRound } from "@/server/pricewar/resolver";
import { getPlayerSlot, getSubmission, loadMatch } from "@/server/pricewar/repository";

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

  const round = state.market.currentRound;
  const otherSlot = slot === "A" ? "B" : "A";
  const mySubmission = await getSubmission(matchId, round, slot);
  const opponentSubmission = await getSubmission(matchId, round, otherSlot);

  const view = toPlayerView(state, slot, {
    opponentHasLocked: Boolean(opponentSubmission),
    meHasLocked: Boolean(mySubmission),
  });

  if (!isDebugRequest(request)) {
    view.opponent = { ...view.opponent, isBot: false };
  }

  return jsonOk(view);
}
