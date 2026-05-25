import type { MatchId } from "@adamsaxion/pricewar-types";
import { advanceFromReportToDecide, beginRoundClocks, toPlayerView } from "@adamsaxion/pricewar-engine";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { getPlayerSlot, loadMatch, saveMatch } from "@/server/pricewar/repository";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  const state = await loadMatch(matchId);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  if (state.phase !== "report") {
    return jsonOk({ advanced: false, phase: state.phase, view: toPlayerView(state, slot) });
  }

  let next = advanceFromReportToDecide(state);
  if (next.phase === "decide") {
    next = beginRoundClocks(next, new Date().toISOString());
  }
  await saveMatch(next);

  return jsonOk({
    advanced: true,
    phase: next.phase,
    currentRound: next.market.currentRound,
    view: toPlayerView(next, slot),
  });
}
