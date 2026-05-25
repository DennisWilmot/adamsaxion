import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { searchAdminPlayers } from "@/server/pricewar/admin-players";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return jsonOk({ players: [] });
  }

  const players = await searchAdminPlayers(q);
  return jsonOk({ players });
}
