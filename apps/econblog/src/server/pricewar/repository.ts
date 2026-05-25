import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/content";
import {
  match,
  matchPlayers,
  turnSubmissions,
  roundReports,
  matchmakingQueue,
  matchCoachReports,
  ratings,
  llmSpendLedger,
} from "@/db/schema/pricewar";
import type {
  MatchId,
  MatchState,
  PlayerSlot,
  SubmittedMove,
  RoundReport,
} from "@adamsaxion/pricewar-types";

export async function countInProgressMatches(userId: string): Promise<number> {
  const rows = await db
    .select({ matchId: matchPlayers.matchId })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(
      and(
        eq(matchPlayers.userId, userId),
        inArray(match.phase, ["briefing", "decide", "resolving", "report"])
      )
    );
  return rows.length;
}

export async function findLatestActiveMatchForUser(userId: string) {
  const [row] = await db
    .select({ matchId: match.id, phase: match.phase })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(
      and(
        eq(matchPlayers.userId, userId),
        inArray(match.phase, [
          "waiting_for_opponent",
          "briefing",
          "decide",
          "resolving",
          "report",
        ])
      )
    )
    .orderBy(sql`${match.updatedAt} desc`)
    .limit(1);

  return row ?? null;
}

export async function loadMatch(id: MatchId): Promise<MatchState | null> {
  const [row] = await db.select().from(match).where(eq(match.id, id)).limit(1);
  if (!row) return null;
  return row.state as MatchState;
}

export async function saveMatch(state: MatchState): Promise<void> {
  const outcome = state.outcome;
  await db
    .update(match)
    .set({
      phase: state.phase,
      outcomeKind: outcome.kind,
      outcomeWinnerSlot: outcome.kind === "win" ? outcome.winner : null,
      outcomeReason: outcome.kind === "win" ? outcome.reason : null,
      state,
      updatedAt: new Date(),
      completedAt: state.phase === "completed" ? new Date() : null,
    })
    .where(eq(match.id, state.matchId));
}

export async function createMatchWithPlayers(args: {
  state: MatchState;
  playerA: { userId: string; displayName: string; ratingAtStart?: number | null };
  playerB: {
    userId?: string;
    displayName: string;
    isBot: boolean;
    botPersonalityId?: string;
    ratingAtStart?: number | null;
  };
}): Promise<MatchId> {
  const [created] = await db
    .insert(match)
    .values({
      scenarioId: args.state.scenarioId,
      scenarioVersion: args.state.scenarioVersion,
      engineVersion: args.state.engineVersion,
      playModeId: args.state.playModeId,
      rngSeed: args.state.rngSeed,
      phase: args.state.phase,
      state: args.state,
    })
    .returning({ id: match.id });

  const matchId = created!.id as MatchId;

  await db.insert(matchPlayers).values([
    {
      matchId,
      userId: args.playerA.userId,
      slot: "A",
      isBot: false,
      ratingAtStart: args.playerA.ratingAtStart ?? null,
    },
    {
      matchId,
      userId: args.playerB.userId ?? null,
      slot: "B",
      isBot: args.playerB.isBot,
      botPersonalityId: args.playerB.botPersonalityId ?? null,
      ratingAtStart: args.playerB.ratingAtStart ?? null,
    },
  ]);

  return matchId;
}

export async function getBotPersonalityId(matchId: MatchId): Promise<string | null> {
  const [row] = await db
    .select({ botPersonalityId: matchPlayers.botPersonalityId })
    .from(matchPlayers)
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.isBot, true)))
    .limit(1);
  return row?.botPersonalityId ?? null;
}

export async function loadRoundReport(args: {
  matchId: MatchId;
  round: number;
  slot: PlayerSlot;
}): Promise<RoundReport | null> {
  const [row] = await db
    .select({
      publicReport: roundReports.publicReport,
      privateReportA: roundReports.privateReportA,
      privateReportB: roundReports.privateReportB,
    })
    .from(roundReports)
    .where(and(eq(roundReports.matchId, args.matchId), eq(roundReports.round, args.round)))
    .limit(1);

  if (!row) return null;

  const base = row.publicReport as RoundReport;
  const privateSide =
    args.slot === "A" ? row.privateReportA : row.privateReportB;
  const side = privateSide as { summary: string; deltas: RoundReport["deltas"]["A"] };

  return {
    ...base,
    privateSummary: {
      A: args.slot === "A" ? side.summary : base.privateSummary.A,
      B: args.slot === "B" ? side.summary : base.privateSummary.B,
    },
    deltas: {
      A: args.slot === "A" ? side.deltas : base.deltas.A,
      B: args.slot === "B" ? side.deltas : base.deltas.B,
    },
  };
}

export async function getPlayerSlot(
  matchId: MatchId,
  userId: string
): Promise<PlayerSlot | null> {
  const [row] = await db
    .select({ slot: matchPlayers.slot })
    .from(matchPlayers)
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, userId)))
    .limit(1);
  if (!row?.slot) return null;
  return row.slot as PlayerSlot;
}

export async function recordSubmission(args: {
  matchId: MatchId;
  round: number;
  slot: PlayerSlot;
  moves: SubmittedMove[];
  clockAtSubmitMs?: number;
  byAutopass?: boolean;
}): Promise<{ inserted: boolean }> {
  const result = await db
    .insert(turnSubmissions)
    .values({
      matchId: args.matchId,
      round: args.round,
      slot: args.slot,
      moves: args.moves,
      clockAtSubmitMs: args.clockAtSubmitMs ?? null,
      submittedByEngineAutopass: args.byAutopass ?? false,
    })
    .onConflictDoNothing({
      target: [turnSubmissions.matchId, turnSubmissions.round, turnSubmissions.slot],
    })
    .returning({ id: turnSubmissions.id });

  return { inserted: result.length > 0 };
}

export async function getSubmission(
  matchId: MatchId,
  round: number,
  slot: PlayerSlot
): Promise<SubmittedMove[] | null> {
  const [row] = await db
    .select({ moves: turnSubmissions.moves })
    .from(turnSubmissions)
    .where(
      and(
        eq(turnSubmissions.matchId, matchId),
        eq(turnSubmissions.round, round),
        eq(turnSubmissions.slot, slot)
      )
    )
    .limit(1);
  if (!row) return null;
  return row.moves as SubmittedMove[];
}

export async function saveRoundReport(args: {
  matchId: MatchId;
  round: number;
  report: RoundReport;
  eventsSlice: unknown[];
}): Promise<void> {
  await db
    .insert(roundReports)
    .values({
      matchId: args.matchId,
      round: args.round,
      publicReport: args.report,
      privateReportA: { summary: args.report.privateSummary.A, deltas: args.report.deltas.A },
      privateReportB: { summary: args.report.privateSummary.B, deltas: args.report.deltas.B },
      eventsSlice: args.eventsSlice,
    })
    .onConflictDoNothing({
      target: [roundReports.matchId, roundReports.round],
    });
}

export async function listUserMatches(userId: string) {
  return db
    .select({
      matchId: match.id,
      phase: match.phase,
      playModeId: match.playModeId,
      scenarioId: match.scenarioId,
      outcomeKind: match.outcomeKind,
      outcomeReason: match.outcomeReason,
      updatedAt: match.updatedAt,
      slot: matchPlayers.slot,
      ratingDelta: matchPlayers.ratingDelta,
      ratingAfter: matchPlayers.ratingAfter,
    })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(eq(matchPlayers.userId, userId))
    .orderBy(sql`${match.updatedAt} desc`)
    .limit(20);
}

export async function countCompletedTutorialMatches(userId: string): Promise<number> {
  const rows = await db
    .select({ matchId: match.id })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(
      and(
        eq(matchPlayers.userId, userId),
        eq(match.playModeId, "tutorial"),
        eq(match.phase, "completed")
      )
    );
  return rows.length;
}

export async function getMatchParticipants(matchId: MatchId) {
  return db
    .select({
      userId: matchPlayers.userId,
      slot: matchPlayers.slot,
      isBot: matchPlayers.isBot,
      ratingAtStart: matchPlayers.ratingAtStart,
      ratingAfter: matchPlayers.ratingAfter,
      ratingDelta: matchPlayers.ratingDelta,
    })
    .from(matchPlayers)
    .where(eq(matchPlayers.matchId, matchId));
}

export async function getMatchSummary(matchId: MatchId, userId: string) {
  const [row] = await db
    .select({
      slot: matchPlayers.slot,
      ratingAtStart: matchPlayers.ratingAtStart,
      ratingAfter: matchPlayers.ratingAfter,
      ratingDelta: matchPlayers.ratingDelta,
      playModeId: match.playModeId,
      scenarioId: match.scenarioId,
      phase: match.phase,
    })
    .from(matchPlayers)
    .innerJoin(match, eq(match.id, matchPlayers.matchId))
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.userId, userId)))
    .limit(1);

  if (!row) return null;

  const participants = await getMatchParticipants(matchId);
  const hasBot = participants.some((p) => p.isBot);
  const isRated =
    !hasBot && (row.ratingAtStart != null || row.ratingDelta != null);

  return {
    isRated,
    ratingAtStart: row.ratingAtStart,
    ratingAfter: row.ratingAfter,
    ratingDelta: row.ratingDelta,
    playModeId: row.playModeId,
    scenarioId: row.scenarioId,
  };
}

export async function getOrCreateRating(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
}): Promise<{ rating: number; gamesPlayed: number }> {
  const [existing] = await db
    .select({
      rating: ratings.rating,
      gamesPlayed: ratings.gamesPlayed,
    })
    .from(ratings)
    .where(
      and(
        eq(ratings.userId, args.userId),
        eq(ratings.scenarioId, args.scenarioId),
        eq(ratings.playModeId, args.playModeId)
      )
    )
    .limit(1);

  if (existing) return existing;

  await db
    .insert(ratings)
    .values({
      userId: args.userId,
      scenarioId: args.scenarioId,
      playModeId: args.playModeId,
      rating: 1200,
      gamesPlayed: 0,
      highestRating: 1200,
    })
    .onConflictDoNothing();

  return { rating: 1200, gamesPlayed: 0 };
}

export async function revertRatingsForMatch(matchId: MatchId): Promise<void> {
  const [matchRow] = await db
    .select({
      scenarioId: match.scenarioId,
      playModeId: match.playModeId,
    })
    .from(match)
    .where(eq(match.id, matchId))
    .limit(1);

  if (!matchRow) return;

  const participants = await getMatchParticipants(matchId);

  for (const participant of participants) {
    if (!participant.userId || participant.ratingDelta == null) continue;

    const [ratingRow] = await db
      .select({ gamesPlayed: ratings.gamesPlayed })
      .from(ratings)
      .where(
        and(
          eq(ratings.userId, participant.userId),
          eq(ratings.scenarioId, matchRow.scenarioId),
          eq(ratings.playModeId, matchRow.playModeId)
        )
      )
      .limit(1);

    const revertedRating =
      (participant.ratingAfter ?? 1200) - participant.ratingDelta;

    await db
      .update(ratings)
      .set({
        rating: Math.max(100, revertedRating),
        gamesPlayed: Math.max(0, (ratingRow?.gamesPlayed ?? 1) - 1),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(ratings.userId, participant.userId),
          eq(ratings.scenarioId, matchRow.scenarioId),
          eq(ratings.playModeId, matchRow.playModeId)
        )
      );

    await db
      .update(matchPlayers)
      .set({
        ratingAfter: null,
        ratingDelta: null,
      })
      .where(
        and(
          eq(matchPlayers.matchId, matchId),
          eq(matchPlayers.slot, participant.slot)
        )
      );
  }
}

export async function applyRatingUpdates(args: {
  matchId: MatchId;
  updates: Array<{
    userId: string;
    slot: PlayerSlot;
    scenarioId: string;
    playModeId: string;
    ratingBefore: number;
    ratingAfter: number;
    ratingDelta: number;
    gamesPlayed: number;
  }>;
}): Promise<void> {
  for (const update of args.updates) {
    await db
      .update(matchPlayers)
      .set({
        ratingAtStart: update.ratingBefore,
        ratingAfter: update.ratingAfter,
        ratingDelta: update.ratingDelta,
      })
      .where(
        and(eq(matchPlayers.matchId, args.matchId), eq(matchPlayers.slot, update.slot))
      );

    await db
      .insert(ratings)
      .values({
        userId: update.userId,
        scenarioId: update.scenarioId,
        playModeId: update.playModeId,
        rating: update.ratingAfter,
        gamesPlayed: update.gamesPlayed + 1,
        highestRating: update.ratingAfter,
        lastMatchAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [ratings.userId, ratings.scenarioId, ratings.playModeId],
        set: {
          rating: update.ratingAfter,
          gamesPlayed: update.gamesPlayed + 1,
          highestRating: sql`GREATEST(${ratings.highestRating}, ${update.ratingAfter})`,
          lastMatchAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }
}

export async function getProfileUsername(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return row?.username ?? null;
}

export async function enqueueUser(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  ratingAtEnqueue: number | null;
  botFallbackAfterSec: number;
}): Promise<string> {
  const [row] = await db
    .insert(matchmakingQueue)
    .values({
      userId: args.userId,
      scenarioId: args.scenarioId,
      playModeId: args.playModeId,
      ratingAtEnqueue: args.ratingAtEnqueue,
      botFallbackAfterSec: args.botFallbackAfterSec,
    })
    .onConflictDoUpdate({
      target: matchmakingQueue.userId,
      set: {
        scenarioId: args.scenarioId,
        playModeId: args.playModeId,
        ratingAtEnqueue: args.ratingAtEnqueue,
        botFallbackAfterSec: args.botFallbackAfterSec,
        enqueuedAt: new Date(),
      },
    })
    .returning({ enqueuedAt: matchmakingQueue.enqueuedAt });

  return row!.enqueuedAt.toISOString();
}

export async function getQueueEntry(userId: string) {
  const [row] = await db
    .select()
    .from(matchmakingQueue)
    .where(eq(matchmakingQueue.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function removeFromQueue(userId: string): Promise<void> {
  await db.delete(matchmakingQueue).where(eq(matchmakingQueue.userId, userId));
}

export async function findQueueOpponent(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  ratingAtEnqueue?: number | null;
  enqueuedAt?: Date;
}) {
  const conditions = [
    eq(matchmakingQueue.scenarioId, args.scenarioId),
    eq(matchmakingQueue.playModeId, args.playModeId),
    ne(matchmakingQueue.userId, args.userId),
  ];

  if (args.ratingAtEnqueue != null && args.enqueuedAt) {
    const elapsedSec = Math.floor((Date.now() - args.enqueuedAt.getTime()) / 1000);
    const windowSteps = Math.floor(elapsedSec / 10);
    const ratingWindow = Math.min(400, 100 + windowSteps * 50);
    const minRating = args.ratingAtEnqueue - ratingWindow;
    const maxRating = args.ratingAtEnqueue + ratingWindow;

    const [ratedOpponent] = await db
      .select({
        userId: matchmakingQueue.userId,
        enqueuedAt: matchmakingQueue.enqueuedAt,
      })
      .from(matchmakingQueue)
      .where(
        and(
          ...conditions,
          sql`${matchmakingQueue.ratingAtEnqueue} IS NOT NULL`,
          sql`${matchmakingQueue.ratingAtEnqueue} >= ${minRating}`,
          sql`${matchmakingQueue.ratingAtEnqueue} <= ${maxRating}`
        )
      )
      .orderBy(matchmakingQueue.enqueuedAt)
      .limit(1);

    if (ratedOpponent) return ratedOpponent;
  }

  const [row] = await db
    .select({
      userId: matchmakingQueue.userId,
      enqueuedAt: matchmakingQueue.enqueuedAt,
    })
    .from(matchmakingQueue)
    .where(and(...conditions))
    .orderBy(matchmakingQueue.enqueuedAt)
    .limit(1);

  return row ?? null;
}

export async function loadAllMatchEvents(matchId: MatchId): Promise<unknown[]> {
  const rows = await db
    .select({ eventsSlice: roundReports.eventsSlice })
    .from(roundReports)
    .where(eq(roundReports.matchId, matchId))
    .orderBy(roundReports.round);

  return rows.flatMap((r) => r.eventsSlice as unknown[]);
}

export async function loadCoachReport(matchId: MatchId, userId: string) {
  const [row] = await db
    .select({ payload: matchCoachReports.payload, generatedBy: matchCoachReports.generatedBy })
    .from(matchCoachReports)
    .where(and(eq(matchCoachReports.matchId, matchId), eq(matchCoachReports.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function saveCoachReport(args: {
  matchId: MatchId;
  userId: string;
  payload: unknown;
  generatedBy: "template" | "llm";
  costUsd?: string;
  model?: string;
}): Promise<void> {
  await db
    .insert(matchCoachReports)
    .values({
      matchId: args.matchId,
      userId: args.userId,
      payload: args.payload,
      generatedBy: args.generatedBy,
      costUsd: args.costUsd ?? "0",
      model: args.model ?? null,
    })
    .onConflictDoUpdate({
      target: [matchCoachReports.matchId, matchCoachReports.userId],
      set: {
        payload: args.payload,
        generatedBy: args.generatedBy,
        costUsd: args.costUsd ?? "0",
        model: args.model ?? null,
      },
    });
}

function startOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getUserDailyCoachSpend(userId: string): Promise<number> {
  const since = startOfUtcDay();
  const [row] = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${llmSpendLedger.costUsd} AS numeric)), 0)`,
    })
    .from(llmSpendLedger)
    .where(
      and(
        eq(llmSpendLedger.userId, userId),
        eq(llmSpendLedger.feature, "coach"),
        sql`${llmSpendLedger.createdAt} >= ${since}`
      )
    );
  return Number(row?.total ?? 0);
}

export async function getGlobalDailyCoachSpend(): Promise<number> {
  const since = startOfUtcDay();
  const [row] = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${llmSpendLedger.costUsd} AS numeric)), 0)`,
    })
    .from(llmSpendLedger)
    .where(
      and(eq(llmSpendLedger.feature, "coach"), sql`${llmSpendLedger.createdAt} >= ${since}`)
    );
  return Number(row?.total ?? 0);
}

export async function recordLlmSpend(args: {
  userId: string;
  feature: string;
  matchId?: MatchId;
  model: string;
  costUsd: string;
  promptTokens?: number;
  completionTokens?: number;
}): Promise<void> {
  await db.insert(llmSpendLedger).values({
    userId: args.userId,
    feature: args.feature,
    matchId: args.matchId ?? null,
    model: args.model,
    costUsd: args.costUsd,
    promptTokens: args.promptTokens ?? null,
    completionTokens: args.completionTokens ?? null,
  });
}

export async function markPlayerAbandoned(
  matchId: MatchId,
  slot: PlayerSlot
): Promise<void> {
  await db
    .update(matchPlayers)
    .set({ abandonedAt: new Date() })
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.slot, slot)));
}

export async function clearPlayerAbandoned(
  matchId: MatchId,
  slot: PlayerSlot
): Promise<void> {
  await db
    .update(matchPlayers)
    .set({ abandonedAt: null })
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.slot, slot)));
}

export async function isPlayerAbandoned(
  matchId: MatchId,
  slot: PlayerSlot
): Promise<boolean> {
  const [row] = await db
    .select({ abandonedAt: matchPlayers.abandonedAt })
    .from(matchPlayers)
    .where(and(eq(matchPlayers.matchId, matchId), eq(matchPlayers.slot, slot)))
    .limit(1);
  return Boolean(row?.abandonedAt);
}
