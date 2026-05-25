import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import {
  removeFromQueue,
  getQueueEntry,
  findLatestActiveMatchForUser,
} from "@/server/pricewar/repository";

export async function POST() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  await removeFromQueue(auth.user.id);
  return jsonOk({ cancelled: true });
}

export async function GET() {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const entry = await getQueueEntry(auth.user.id);
  if (entry) {
    const elapsedSec = Math.floor((Date.now() - entry.enqueuedAt.getTime()) / 1000);
    return jsonOk({
      inQueue: true,
      scenarioId: entry.scenarioId,
      playModeId: entry.playModeId,
      enqueuedAt: entry.enqueuedAt.toISOString(),
      elapsedSec,
      botFallbackInSec: entry.botFallbackAfterSec,
      secondsUntilBotFallback: Math.max(0, entry.botFallbackAfterSec - elapsedSec),
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
