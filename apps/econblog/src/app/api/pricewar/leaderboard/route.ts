import { getPlayMode } from "@adamsaxion/pricewar-engine";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { resolveProfileAvatarUrl } from "@/lib/avatars/resolve";
import { requireAuthedUser, getUserTier } from "@/server/pricewar/auth";
import { isMarginRatedEnabled } from "@/server/pricewar/feature-flag";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import * as repo from "@/server/pricewar/repository";

function ladderTitle(playModeId: string): string {
  const mode = getPlayMode(playModeId);
  if (!mode) return "Ladder";
  const short = mode.label.split(/\s+/)[0] ?? mode.id;
  return `${short} Ladder`;
}

export async function GET(request: Request) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenarioId") ?? "coffee-shop";
  const playModeId = url.searchParams.get("playModeId") ?? DEFAULT_MARGIN_PLAY_MODE;

  const playMode = getPlayMode(playModeId);
  if (!playMode?.affectsRating) {
    return jsonError({ code: "INVALID_SUBMIT", message: "Unknown play mode." });
  }

  const title = ladderTitle(playModeId);
  const tier = await getUserTier(auth.user.id, auth.user.email);
  const canSeeOwnRank = tier === "paid";

  if (!isMarginRatedEnabled()) {
    return jsonOk({
      available: false,
      reason: "rated_disabled" as const,
      canSeeOwnRank: false,
      scenarioId,
      playModeId,
      title,
      rows: [],
    });
  }

  const leaderboard = await repo.listLeaderboard({ scenarioId, playModeId });
  const rows = leaderboard.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.username,
    avatarUrl: resolveProfileAvatarUrl(row.avatarUrl, row.userId),
    elo: row.rating,
    ...(canSeeOwnRank && row.userId === auth.user.id ? { isYou: true as const } : {}),
  }));

  return jsonOk({
    available: true,
    reason: null,
    canSeeOwnRank,
    scenarioId,
    playModeId,
    title,
    rows,
  });
}
