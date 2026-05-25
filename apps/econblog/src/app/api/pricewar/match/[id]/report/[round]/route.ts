import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { getPlayerSlot, loadRoundReport } from "@/server/pricewar/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; round: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id, round: roundParam } = await context.params;
  const matchId = id as MatchId;
  const round = Number(roundParam);

  if (!Number.isFinite(round) || round < 1) {
    return jsonError({ code: "INVALID_SUBMIT", message: "Invalid round." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const report = await loadRoundReport({ matchId, round, slot });
  if (!report) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Report not found." });
  }

  return jsonOk({ report });
}
