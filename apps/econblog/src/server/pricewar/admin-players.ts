import { desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/content";
import {
  match,
  matchPlayers,
  ratings,
  playerFlags,
} from "@/db/schema/pricewar";

export async function loadAdminPlayerDebug(userId: string) {
  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      totalXp: profiles.totalXp,
      currentLevel: profiles.currentLevel,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) return null;

  const ratingRows = await db
    .select()
    .from(ratings)
    .where(eq(ratings.userId, userId))
    .orderBy(ratings.playModeId);

  const matchRows = await db
    .select({
      matchId: match.id,
      playModeId: match.playModeId,
      phase: match.phase,
      outcomeKind: match.outcomeKind,
      outcomeReason: match.outcomeReason,
      updatedAt: match.updatedAt,
      slot: matchPlayers.slot,
      ratingDelta: matchPlayers.ratingDelta,
      isBot: matchPlayers.isBot,
    })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(eq(matchPlayers.userId, userId))
    .orderBy(desc(match.updatedAt))
    .limit(30);

  const flags = await db
    .select()
    .from(playerFlags)
    .where(eq(playerFlags.userId, userId))
    .orderBy(desc(playerFlags.createdAt))
    .limit(20);

  return {
    profile,
    ratings: ratingRows,
    matches: matchRows,
    flags,
  };
}

export async function createPlayerFlag(args: {
  userId: string;
  reason: string;
  severity: string;
  notes?: string;
  adminEmail: string;
}) {
  const [row] = await db
    .insert(playerFlags)
    .values({
      userId: args.userId,
      reason: args.reason,
      severity: args.severity,
      notes: args.notes ?? null,
      flaggedByAdminEmail: args.adminEmail,
    })
    .returning();

  return row;
}

export async function searchAdminPlayers(query: string, limit = 20) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  if (isUuid) {
    const debug = await loadAdminPlayerDebug(trimmed);
    return debug ? [{ id: debug.profile.id, username: debug.profile.username }] : [];
  }

  const rows = await db
    .select({ id: profiles.id, username: profiles.username })
    .from(profiles)
    .where(ilike(profiles.username, `%${trimmed}%`))
    .limit(Math.min(limit, 50));

  return rows;
}
