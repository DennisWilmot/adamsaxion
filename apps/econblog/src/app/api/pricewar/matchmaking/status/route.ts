import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { advanceMatchmaking } from "@/server/pricewar/matchmaker";
import {
  findLatestActiveMatchForUser,
  getProfileUsername,
} from "@/server/pricewar/repository";

export async function GET() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const playerName = (await getProfileUsername(auth.user.id)) ?? "Player";
  const progress = await advanceMatchmaking({
    userId: auth.user.id,
    playerName,
  });

  if (progress.kind === "matched") {
    return jsonOk({
      inQueue: false,
      matched: true,
      matchId: progress.matchId,
      botFallback: progress.botFallback ?? false,
      phase: "decide",
    });
  }

  if (progress.kind === "queued") {
    return jsonOk({
      inQueue: true,
      scenarioId: progress.scenarioId,
      playModeId: progress.playModeId,
      enqueuedAt: progress.enqueuedAt,
      elapsedSec: progress.elapsedSec,
      botFallbackInSec: progress.botFallbackInSec,
      secondsUntilBotFallback: progress.secondsUntilBotFallback,
    });
  }

  const active = await findLatestActiveMatchForUser(auth.user.id);
  if (active) {
    return jsonOk({
      inQueue: false,
      matched: true,
      matchId: active.matchId,
      phase: active.phase,
    });
  }

  return jsonOk({ inQueue: false });
}
