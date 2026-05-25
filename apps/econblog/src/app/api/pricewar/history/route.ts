import { listUserMatches } from "@/server/pricewar/repository";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const matches = await listUserMatches(auth.user.id);
  return jsonOk({ matches });
}
