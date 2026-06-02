import { getLobbyPresence } from "@/server/pricewar/lobby-status";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const presence = await getLobbyPresence();
  return jsonOk(presence);
}
