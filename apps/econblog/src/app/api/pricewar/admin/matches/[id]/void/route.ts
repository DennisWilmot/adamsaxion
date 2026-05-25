import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { voidAdminMatch } from "@/server/pricewar/admin-repository";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const result = await voidAdminMatch(id as MatchId);
  if (!result) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  return jsonOk(result);
}
