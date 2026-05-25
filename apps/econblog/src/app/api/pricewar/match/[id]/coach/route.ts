import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser, getUserTier } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { generateCoachReport } from "@/server/pricewar/coach";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const tier = await getUserTier(auth.user.id, auth.user.email);

  const result = await generateCoachReport({
    matchId: id as MatchId,
    userId: auth.user.id,
    tier,
  });

  if (!result) {
    return jsonError({
      code: "MATCH_COMPLETED",
      message: "Coach available after match ends.",
    });
  }

  return jsonOk(result);
}
