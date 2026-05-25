import type { MatchId } from "@adamsaxion/pricewar-types";
import { toPlayerView } from "@adamsaxion/pricewar-engine";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { ensureMatchLifecycle } from "@/server/pricewar/clock";
import { getPlayerSlot, getSubmission } from "@/server/pricewar/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  const state = await ensureMatchLifecycle(matchId, auth.user.id);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const round = state.market.currentRound;
  const otherSlot = slot === "A" ? "B" : "A";
  const opponentSubmission = await getSubmission(matchId, round, otherSlot);

  const view = toPlayerView(state, slot, {
    opponentHasLocked: Boolean(opponentSubmission),
  });

  return jsonOk(view);
}
