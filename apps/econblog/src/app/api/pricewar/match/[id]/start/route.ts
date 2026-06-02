import type { MatchId } from "@adamsaxion/pricewar-types";
import { beginRoundClocks, toPlayerView } from "@adamsaxion/pricewar-engine";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { getPlayerSlot, loadMatch, saveMatch, getBotPersonalityId } from "@/server/pricewar/repository";
import { maybeSubmitBotTurn } from "@/server/pricewar/resolver";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  let state = await loadMatch(matchId);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  if (state.phase === "briefing") {
    state = { ...state, phase: "decide" };
    await saveMatch(state);

    const botPersonalityId = await getBotPersonalityId(matchId);
    if (botPersonalityId) {
      await maybeSubmitBotTurn(matchId, botPersonalityId);
      state = (await loadMatch(matchId)) ?? state;
    }

    return jsonOk({
      started: true,
      phase: state.phase,
      view: toPlayerView(state, slot),
    });
  }

  if (state.phase === "decide" && !state.timerMeta?.roundDecideStartedAt) {
    state = beginRoundClocks(state, new Date().toISOString());
    await saveMatch(state);
    return jsonOk({
      started: true,
      phase: state.phase,
      view: toPlayerView(state, slot),
    });
  }

  return jsonOk({
    started: false,
    phase: state.phase,
    view: toPlayerView(state, slot),
  });
}
