import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { forceAbandonmentForE2e } from "@/server/pricewar/clock";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const result = await forceAbandonmentForE2e(id as MatchId, auth.user.id);

  if ("error" in result) return jsonError(result.error);
  return jsonOk(result);
}
