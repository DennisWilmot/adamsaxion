import type { MatchId, SubmittedMove } from "@adamsaxion/pricewar-types";
import { reviewForecastForDraft } from "@adamsaxion/pricewar-engine";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { COFFEE_SHOP_SCENARIO } from "@/server/pricewar/matchmaker";
import { getPlayerSlot, loadMatch } from "@/server/pricewar/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  let body: { moves?: SubmittedMove[] };
  try {
    body = await request.json();
  } catch {
    return jsonError({ code: "INVALID_SUBMIT", message: "Invalid request body." });
  }

  const state = await loadMatch(matchId);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  if (state.phase !== "decide") {
    return jsonError({ code: "MATCH_COMPLETED", message: "Forecast unavailable in this phase." });
  }

  const moves = body.moves ?? [];
  const lines = reviewForecastForDraft(state, slot, moves, COFFEE_SHOP_SCENARIO);

  return jsonOk({ lines });
}
