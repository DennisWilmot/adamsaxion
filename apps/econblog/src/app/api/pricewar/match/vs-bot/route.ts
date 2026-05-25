import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getPlayMode, isE2ePlayMode } from "@adamsaxion/pricewar-engine";
import {
  requireAuthedUser,
  getUserTier,
  getConcurrentCap,
} from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { consumeRateLimit } from "@/server/pricewar/rate-limit";
import { countInProgressMatches } from "@/server/pricewar/repository";
import { createVsBotMatch } from "@/server/pricewar/matchmaker";
import { maybeSubmitBotTurn } from "@/server/pricewar/resolver";

export async function POST(request: Request) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const limited = await consumeRateLimit({
    userId: auth.user.id,
    bucket: "match:create",
  });
  if (!limited.ok) return jsonError(limited.error, { retryAfter: limited.retryAfterSec });

  let body: {
    scenarioId?: string;
    playModeId?: string;
    botPersonalityId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError({
      code: "INVALID_SUBMIT",
      message: "Invalid request body.",
    });
  }

  const playModeId = body.playModeId ?? "blitz";
  const playMode = getPlayMode(playModeId);
  if (!playMode) {
    return jsonError({
      code: "INVALID_SUBMIT",
      message: "Unknown play mode.",
    });
  }

  if (isE2ePlayMode(playModeId) && process.env.PRICEWAR_E2E_ENABLED !== "1") {
    return jsonError({
      code: "FORBIDDEN",
      message: "Unknown play mode.",
    });
  }

  const botPersonalityId =
    playModeId === "tutorial" ? "bot.tutorial" : (body.botPersonalityId ?? "bot.budget");

  const tier = await getUserTier(auth.user.id, auth.user.email);
  if (!playMode.availableToTiers.includes(tier)) {
    return jsonError({
      code: "FORBIDDEN",
      message:
        playModeId === "rapid"
          ? "Rapid 15+0 requires a paid account."
          : "This play mode requires a paid account.",
    });
  }

  const inProgress = await countInProgressMatches(auth.user.id);
  const cap = getConcurrentCap(tier);
  if (inProgress >= cap) {
    return jsonError({
      code: "FORBIDDEN",
      message:
        tier === "free"
          ? "You already have a match in progress. Upgrade to play multiple matches concurrently."
          : `You have ${cap} matches in progress, the maximum for your plan.`,
    });
  }

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, auth.user.id))
    .limit(1);

  const { matchId } = await createVsBotMatch({
    userId: auth.user.id,
    playerName: profile?.username ?? "Player",
    scenarioId: body.scenarioId ?? "coffee-shop",
    playModeId,
    botPersonalityId,
  });

  await maybeSubmitBotTurn(matchId, botPersonalityId);

  return jsonOk(
    {
      matchId,
      phase: "decide",
      slot: "A",
    },
    201
  );
}
