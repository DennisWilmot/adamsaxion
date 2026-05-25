import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { getMatchSummary } from "@/server/pricewar/repository";
import type { MatchId } from "@adamsaxion/pricewar-types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const summary = await getMatchSummary(id as MatchId, auth.user.id);
  if (!summary) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  return jsonOk(summary);
}
