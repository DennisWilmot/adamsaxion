import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { loadAdminPlayerDebug } from "@/server/pricewar/admin-players";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const debug = await loadAdminPlayerDebug(id);
  if (!debug) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Player not found." });
  }

  return jsonOk(debug);
}
