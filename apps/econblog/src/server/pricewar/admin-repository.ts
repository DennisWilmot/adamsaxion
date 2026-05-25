import { and, desc, eq, sql } from "drizzle-orm";
import {
  COFFEE_SHOP_SCENARIO,
  createInitialMatchState,
  replayMatchFromSubmissions,
  diffMatchStates,
  toPlayerView,
} from "@adamsaxion/pricewar-engine";
import type { MatchId, PlayerSlot, SubmittedMove } from "@adamsaxion/pricewar-types";
import { db } from "@/db";
import { profiles } from "@/db/schema/content";
import { match, matchPlayers, turnSubmissions } from "@/db/schema/pricewar";
import {
  getMatchParticipants,
  loadAllMatchEvents,
  loadMatch,
  revertRatingsForMatch,
} from "@/server/pricewar/repository";

export async function listAdminMatches(args: {
  limit?: number;
  offset?: number;
  phase?: string;
}) {
  const limit = Math.min(args.limit ?? 25, 100);
  const offset = args.offset ?? 0;

  const conditions = args.phase ? [eq(match.phase, args.phase)] : [];

  const rows = await db
    .select({
      id: match.id,
      scenarioId: match.scenarioId,
      playModeId: match.playModeId,
      phase: match.phase,
      outcomeKind: match.outcomeKind,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      completedAt: match.completedAt,
    })
    .from(match)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(match.updatedAt))
    .limit(limit)
    .offset(offset);

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const players = await db
        .select({
          slot: matchPlayers.slot,
          userId: matchPlayers.userId,
          isBot: matchPlayers.isBot,
          botPersonalityId: matchPlayers.botPersonalityId,
          username: profiles.username,
        })
        .from(matchPlayers)
        .leftJoin(profiles, eq(matchPlayers.userId, profiles.id))
        .where(eq(matchPlayers.matchId, row.id));

      return {
        ...row,
        players: players.map((p) => ({
          slot: p.slot,
          userId: p.userId,
          displayName: p.isBot
            ? p.botPersonalityId ?? "Bot"
            : (p.username ?? p.userId?.slice(0, 8) ?? "Unknown"),
          isBot: p.isBot,
        })),
      };
    })
  );

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(match)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    matches: enriched,
    total: countRow?.count ?? 0,
    limit,
    offset,
  };
}

export async function loadAdminMatchTrace(matchId: MatchId) {
  const state = await loadMatch(matchId);
  if (!state) return null;

  const [events, participants, submissions] = await Promise.all([
    loadAllMatchEvents(matchId),
    getMatchParticipants(matchId),
    db
      .select({
        round: turnSubmissions.round,
        slot: turnSubmissions.slot,
        moves: turnSubmissions.moves,
        submittedAt: turnSubmissions.submittedAt,
      })
      .from(turnSubmissions)
      .where(eq(turnSubmissions.matchId, matchId))
      .orderBy(turnSubmissions.round, turnSubmissions.slot),
  ]);

  return {
    state,
    events,
    participants,
    submissions,
    viewA: toPlayerView(state, "A"),
    viewB: toPlayerView(state, "B"),
  };
}

export async function getAdminLlmCostsSummary() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const todayResult = await db.execute<{ total: string; calls: number }>(sql`
    SELECT
      COALESCE(SUM(CAST(cost_usd AS numeric)), 0)::text AS total,
      COUNT(*)::int AS calls
    FROM pricewar.llm_spend_ledger
    WHERE created_at >= ${since}
  `);

  const featureResult = await db.execute<{
    feature: string;
    total: string;
    calls: number;
  }>(sql`
    SELECT
      feature,
      COALESCE(SUM(CAST(cost_usd AS numeric)), 0)::text AS total,
      COUNT(*)::int AS calls
    FROM pricewar.llm_spend_ledger
    WHERE created_at >= ${since}
    GROUP BY feature
    ORDER BY SUM(CAST(cost_usd AS numeric)) DESC
  `);

  const today = todayResult[0] as { total?: string; calls?: number } | undefined;
  const byFeature = featureResult as Array<{
    feature: string;
    total: string;
    calls: number;
  }>;

  const todayTotalUsd = Number(today?.total ?? 0);
  const globalDailyCapUsd = Number(process.env.PRICEWAR_COACH_GLOBAL_DAILY_USD ?? "200");

  return {
    todayTotalUsd,
    todayCalls: today?.calls ?? 0,
    globalDailyCapUsd,
    globalCapExceeded: todayTotalUsd > globalDailyCapUsd,
    byFeature: byFeature.map((r) => ({
      feature: r.feature,
      totalUsd: Number(r.total),
      calls: r.calls,
    })),
  };
}

export async function getMovePickAnalytics() {
  const result = await db.execute<{
    move_id: string;
    picks: number;
    matches: number;
  }>(sql`
    SELECT
      move->>'moveId' AS move_id,
      COUNT(*)::int AS picks,
      COUNT(DISTINCT ts.match_id)::int AS matches
    FROM pricewar.turn_submissions ts,
      jsonb_array_elements(ts.moves) AS move
    GROUP BY move_id
    ORDER BY picks DESC
  `);

  return (result as Array<{ move_id: string; picks: number; matches: number }>).map(
    (r) => ({
      moveId: r.move_id,
      picks: r.picks,
      matches: r.matches,
    })
  );
}

export async function getAdminLlmCostsExtended() {
  const summary = await getAdminLlmCostsSummary();

  const dailyResult = await db.execute<{
    day: string;
    total: string;
    calls: number;
  }>(sql`
    SELECT
      to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
      COALESCE(SUM(CAST(cost_usd AS numeric)), 0)::text AS total,
      COUNT(*)::int AS calls
    FROM pricewar.llm_spend_ledger
    WHERE created_at >= now() - interval '7 days'
    GROUP BY 1
    ORDER BY 1 DESC
  `);

  const topUsersResult = await db.execute<{
    user_id: string;
    username: string | null;
    total: string;
    calls: number;
  }>(sql`
    SELECT
      l.user_id,
      p.username,
      COALESCE(SUM(CAST(l.cost_usd AS numeric)), 0)::text AS total,
      COUNT(*)::int AS calls
    FROM pricewar.llm_spend_ledger l
    LEFT JOIN public.profiles p ON p.id = l.user_id
    WHERE l.created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
      AND l.user_id IS NOT NULL
    GROUP BY l.user_id, p.username
    ORDER BY SUM(CAST(l.cost_usd AS numeric)) DESC
    LIMIT 10
  `);

  return {
    ...summary,
    dailyLast7Days: (dailyResult as Array<{ day: string; total: string; calls: number }>).map(
      (r) => ({
        day: r.day,
        totalUsd: Number(r.total),
        calls: r.calls,
      })
    ),
    topUsersToday: (
      topUsersResult as Array<{
        user_id: string;
        username: string | null;
        total: string;
        calls: number;
      }>
    ).map((r) => ({
      userId: r.user_id,
      username: r.username,
      totalUsd: Number(r.total),
      calls: r.calls,
    })),
  };
}

export async function voidAdminMatch(matchId: MatchId) {
  const state = await loadMatch(matchId);
  if (!state) return null;

  await revertRatingsForMatch(matchId);

  const voidedState = {
    ...state,
    phase: "completed" as const,
    outcome: { kind: "draw" as const },
    updatedAt: new Date().toISOString(),
  };

  await db
    .update(match)
    .set({
      phase: "completed",
      outcomeKind: "voided",
      outcomeWinnerSlot: null,
      outcomeReason: "admin_void",
      state: voidedState,
      updatedAt: new Date(),
      completedAt: new Date(),
    })
    .where(eq(match.id, matchId));

  return { matchId, voided: true };
}

export async function reResolveAdminMatch(matchId: MatchId) {
  const stored = await loadMatch(matchId);
  if (!stored) return null;

  const submissionRows = await db
    .select({
      round: turnSubmissions.round,
      slot: turnSubmissions.slot,
      moves: turnSubmissions.moves,
    })
    .from(turnSubmissions)
    .where(eq(turnSubmissions.matchId, matchId))
    .orderBy(turnSubmissions.round, turnSubmissions.slot);

  const submissions = submissionRows.map((row) => ({
    round: row.round,
    slot: row.slot as PlayerSlot,
    moves: row.moves as SubmittedMove[],
  }));

  const initial = createInitialMatchState({
    matchId: stored.matchId,
    playModeId: stored.playModeId,
    rngSeed: stored.rngSeed,
    playerAName: stored.playersPublic.A.displayName,
    playerBName: stored.playersPublic.B.displayName,
    playerAIsBot: stored.playersPublic.A.isBot,
    playerBIsBot: stored.playersPublic.B.isBot,
  });
  initial.scenarioVersion = stored.scenarioVersion;
  initial.engineVersion = stored.engineVersion;

  const { finalState } = replayMatchFromSubmissions({
    initialState: initial,
    submissions,
    scenario: COFFEE_SHOP_SCENARIO,
  });

  const diffs = diffMatchStates(stored, finalState);

  return {
    matchId,
    storedEngineVersion: stored.engineVersion,
    currentEngineVersion: finalState.engineVersion,
    diffs,
    matches: diffs.length === 0,
    replayedOutcome: finalState.outcome,
    replayedCash: {
      A: finalState.playersPrivate.A.cash,
      B: finalState.playersPrivate.B.cash,
    },
  };
}
