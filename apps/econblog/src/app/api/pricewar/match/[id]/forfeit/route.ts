import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { forfeitMatch } from "@/server/pricewar/clock";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const result = await forfeitMatch({
    matchId: id as MatchId,
    userId: auth.user.id,
  });

  if ("error" in result) return jsonError(result.error);
  return jsonOk({ forfeited: true });
}
