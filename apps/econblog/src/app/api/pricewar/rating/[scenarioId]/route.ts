import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { getUserRatingForMode } from "@/server/pricewar/ratings";

export async function GET(
  _request: Request,
  context: { params: Promise<{ scenarioId: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { scenarioId } = await context.params;
  const url = new URL(_request.url);
  const playModeId = url.searchParams.get("playModeId") ?? "rapid";

  const rating = await getUserRatingForMode({
    userId: auth.user.id,
    scenarioId,
    playModeId,
  });

  return jsonOk({
    scenarioId,
    playModeId,
    rating: rating.rating,
    gamesPlayed: rating.gamesPlayed,
  });
}
