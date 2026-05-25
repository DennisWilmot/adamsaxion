import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { countCompletedTutorialMatches } from "@/server/pricewar/repository";

export async function GET() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const completedCount = await countCompletedTutorialMatches(auth.user.id);

  return jsonOk({
    completed: completedCount > 0,
    completedCount,
    canEarnReward: completedCount === 0,
  });
}
