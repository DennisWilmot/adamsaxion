import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getPlayMode } from "@adamsaxion/pricewar-engine";
import {
  requireAuthedUser,
  getUserTier,
  getConcurrentCap,
} from "@/server/pricewar/auth";
import { isMarginRatedEnabled } from "@/server/pricewar/feature-flag";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { consumeRateLimit } from "@/server/pricewar/rate-limit";
import { countInProgressMatches, getOrCreateRating } from "@/server/pricewar/repository";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { advanceMatchmaking, enqueueForMatchmaking } from "@/server/pricewar/matchmaker";

export async function POST(request: Request) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const limited = await consumeRateLimit({
    userId: auth.user.id,
    bucket: "matchmaking:queue",
  });
  if (!limited.ok) return jsonError(limited.error, { retryAfter: limited.retryAfterSec });

  let body: { scenarioId?: string; playModeId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError({ code: "INVALID_SUBMIT", message: "Invalid request body." });
  }

  const playModeId = body.playModeId ?? DEFAULT_MARGIN_PLAY_MODE;
  const playMode = getPlayMode(playModeId);
  if (!playMode) {
    return jsonError({ code: "INVALID_SUBMIT", message: "Unknown play mode." });
  }

  const tier = await getUserTier(auth.user.id, auth.user.email);
  if (!playMode.availableToTiers.includes(tier)) {
    return jsonError({
      code: "FORBIDDEN",
      message: "This play mode requires a paid account.",
    });
  }

  const inProgress = await countInProgressMatches(auth.user.id);
  const cap = getConcurrentCap(tier);
  if (inProgress >= cap) {
    return jsonError({
      code: "FORBIDDEN",
      message:
        tier === "free"
          ? "You already have a match running. Upgrade to play more than one at a time."
          : `You have ${cap} matches in progress, the maximum for your plan.`,
    });
  }

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, auth.user.id))
    .limit(1);

  const scenarioId = body.scenarioId ?? "coffee-shop";
  const playerName = profile?.username ?? "Player";

  let ratingAtEnqueue: number | null = null;
  if (isMarginRatedEnabled()) {
    const ratingRow = await getOrCreateRating({
      userId: auth.user.id,
      scenarioId,
      playModeId,
    });
    ratingAtEnqueue = ratingRow.rating;
  }

  const { queuedAt } = await enqueueForMatchmaking({
    userId: auth.user.id,
    scenarioId,
    playModeId,
    ratingAtEnqueue,
  });

  const progress = await advanceMatchmaking({
    userId: auth.user.id,
    playerName,
  });

  if (progress.kind === "matched") {
    return jsonOk({ matchId: progress.matchId, matched: true }, 201);
  }

  return jsonOk(
    {
      matchId: null,
      matched: false,
      queuedAt,
    },
    201
  );
}
