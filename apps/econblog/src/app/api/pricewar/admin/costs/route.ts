import { requireAdminUser } from "@/server/pricewar/admin-auth";
import {
  getAdminLlmCostsExtended,
  getAdminLlmCostsSummary,
} from "@/server/pricewar/admin-repository";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const extended = new URL(request.url).searchParams.get("extended") === "1";
  const summary = extended
    ? await getAdminLlmCostsExtended()
    : await getAdminLlmCostsSummary();

  return jsonOk(summary);
}
