import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { removeFromQueue } from "@/server/pricewar/repository";

export async function POST() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  await removeFromQueue(auth.user.id);
  return jsonOk({ cancelled: true });
}
