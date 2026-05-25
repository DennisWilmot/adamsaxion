import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { loadAdminMatchTrace } from "@/server/pricewar/admin-repository";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const trace = await loadAdminMatchTrace(id as MatchId);
  if (!trace) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  return jsonOk(trace);
}
