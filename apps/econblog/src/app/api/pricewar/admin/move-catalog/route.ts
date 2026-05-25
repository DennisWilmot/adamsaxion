import { COFFEE_SHOP_MOVES } from "@adamsaxion/pricewar-engine";
import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { getMovePickAnalytics } from "@/server/pricewar/admin-repository";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function GET() {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const analytics = await getMovePickAnalytics();
  const pickByMoveId = new Map(analytics.map((a) => [a.moveId, a]));

  return jsonOk({
    readOnly: true,
    moves: COFFEE_SHOP_MOVES.map((m) => {
      const stats = pickByMoveId.get(m.id);
      return {
        id: m.id,
        domain: m.domain,
        name: m.name,
        description: m.description,
        visibility: m.visibility,
        kind: m.kind,
        modifies: m.modifies,
        pickCount: stats?.picks ?? 0,
        matchCount: stats?.matches ?? 0,
      };
    }),
    totalPicks: analytics.reduce((sum, a) => sum + a.picks, 0),
  });
}
