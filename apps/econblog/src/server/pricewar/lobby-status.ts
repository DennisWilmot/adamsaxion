import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { match, matchmakingQueue } from "@/db/schema/pricewar";

const ACTIVE_PHASES = [
  "waiting_for_opponent",
  "briefing",
  "decide",
  "resolving",
  "report",
] as const;

export type LobbyPresence = {
  onlineNow: number;
  blitzQueue: number;
  rapidQueue: number;
  avgWaitSec: number;
  inProgressMatches: number;
};

export async function getLobbyPresence(): Promise<LobbyPresence> {
  const [inProgressRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(match)
    .where(inArray(match.phase, [...ACTIVE_PHASES]));

  const queueRows = await db
    .select({
      playModeId: matchmakingQueue.playModeId,
      count: sql<number>`count(*)::int`,
    })
    .from(matchmakingQueue)
    .groupBy(matchmakingQueue.playModeId);

  const blitzQueue = queueRows.find((r) => r.playModeId === "blitz")?.count ?? 0;
  const rapidQueue = queueRows.find((r) => r.playModeId === "rapid")?.count ?? 0;
  const totalQueue = queueRows.reduce((sum, r) => sum + r.count, 0);
  const inProgressMatches = inProgressRow?.count ?? 0;

  const activePlayers = inProgressMatches * 2;
  const onlineNow = Math.max(activePlayers + totalQueue, totalQueue > 0 ? 2 : activePlayers);

  const avgWaitSec =
    blitzQueue <= 1 ? 8 : Math.min(45, Math.round(12 + blitzQueue * 4));

  return {
    onlineNow,
    blitzQueue,
    rapidQueue,
    avgWaitSec,
    inProgressMatches,
  };
}
