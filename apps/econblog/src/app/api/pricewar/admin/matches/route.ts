import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { listAdminMatches } from "@/server/pricewar/admin-repository";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const phase = url.searchParams.get("phase") ?? undefined;

  const result = await listAdminMatches({
    limit: Number.isFinite(limit) ? limit : 25,
    offset: Number.isFinite(offset) ? offset : 0,
    ...(phase ? { phase } : {}),
  });

  return jsonOk(result);
}
