import {
  createInitialMatchState,
  getBotPersona,
  getPlayMode,
  beginRoundClocks,
  COFFEE_SHOP_SCENARIO,
} from "@adamsaxion/pricewar-engine";
import type { MatchId } from "@adamsaxion/pricewar-types";
import * as repo from "./repository";
import { getUserTier } from "./auth";
import { getUserRatingForMode } from "./ratings";

export async function createVsBotMatch(args: {
  userId: string;
  playerName: string;
  scenarioId: string;
  playModeId: string;
  botPersonalityId: string;
}): Promise<{ matchId: MatchId }> {
  const playMode = getPlayMode(args.playModeId);
  if (!playMode) {
    throw new Error("Unknown play mode");
  }

  const bot = getBotPersona(args.botPersonalityId) ?? getBotPersona("bot.random")!;
  const rngSeed = crypto.randomUUID();

  const state = createInitialMatchState({
    matchId: "pending" as MatchId,
    playModeId: args.playModeId,
    rngSeed,
    playerAName: args.playerName,
    playerBName: bot.label,
    playerBIsBot: true,
  });
  state.phase = "decide";

  const matchId = await repo.createMatchWithPlayers({
    state,
    playerA: { userId: args.userId, displayName: args.playerName },
    playerB: {
      displayName: bot.label,
      isBot: true,
      botPersonalityId: bot.id,
    },
  });

  const finalState = { ...state, matchId };
  await repo.saveMatch(beginRoundClocks(finalState, new Date().toISOString()));

  return { matchId };
}

export async function createPvpMatch(args: {
  playerA: { userId: string; displayName: string; ratingAtStart?: number | null };
  playerB: { userId: string; displayName: string; ratingAtStart?: number | null };
  scenarioId: string;
  playModeId: string;
}): Promise<{ matchId: MatchId }> {
  const rngSeed = crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const state = createInitialMatchState({
    matchId: "pending" as MatchId,
    playModeId: args.playModeId,
    rngSeed,
    playerAName: args.playerA.displayName,
    playerBName: args.playerB.displayName,
  });
  state.phase = "waiting_for_opponent";
  state.timerMeta = {
    ...state.timerMeta!,
    lobbyOpenedAt: nowIso,
    playerConnectedAt: { A: null, B: null },
  };

  const matchId = await repo.createMatchWithPlayers({
    state,
    playerA: { userId: args.playerA.userId, displayName: args.playerA.displayName, ratingAtStart: args.playerA.ratingAtStart ?? null },
    playerB: {
      userId: args.playerB.userId,
      displayName: args.playerB.displayName,
      isBot: false,
      ratingAtStart: args.playerB.ratingAtStart ?? null,
    },
  });

  await repo.saveMatch({ ...state, matchId });

  return { matchId };
}

export async function enqueueForMatchmaking(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  ratingAtEnqueue?: number | null;
}): Promise<{ queuedAt: string; botFallbackInSec: number }> {
  const botFallbackAfterSec = Number(process.env.PRICEWAR_BOT_FALLBACK_SEC ?? "60");
  const queuedAt = await repo.enqueueUser({
    userId: args.userId,
    scenarioId: args.scenarioId,
    playModeId: args.playModeId,
    ratingAtEnqueue: args.ratingAtEnqueue ?? null,
    botFallbackAfterSec,
  });
  return { queuedAt, botFallbackInSec: botFallbackAfterSec };
}

export async function tryMatchFromQueue(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  playerName: string;
}): Promise<{ matchId: MatchId } | { queued: true; queuedAt: string }> {
  const myQueue = await repo.getQueueEntry(args.userId);

  const opponent = await repo.findQueueOpponent({
    userId: args.userId,
    scenarioId: args.scenarioId,
    playModeId: args.playModeId,
    ...(myQueue?.ratingAtEnqueue != null
      ? { ratingAtEnqueue: myQueue.ratingAtEnqueue }
      : {}),
    ...(myQueue?.enqueuedAt ? { enqueuedAt: myQueue.enqueuedAt } : {}),
  });

  if (!opponent) {
    const status = await repo.getQueueEntry(args.userId);
    return { queued: true, queuedAt: status?.enqueuedAt.toISOString() ?? new Date().toISOString() };
  }

  const [opponentProfile, myProfile] = await Promise.all([
    repo.getProfileUsername(opponent.userId),
    repo.getProfileUsername(args.userId),
  ]);

  await repo.removeFromQueue(args.userId);
  await repo.removeFromQueue(opponent.userId);

  const [tierA, tierB] = await Promise.all([
    getUserTier(args.userId),
    getUserTier(opponent.userId),
  ]);
  const bothPaid = tierA === "paid" && tierB === "paid";

  let ratingA: number | null = null;
  let ratingB: number | null = null;
  if (bothPaid) {
    const [rA, rB] = await Promise.all([
      getUserRatingForMode({
        userId: args.userId,
        scenarioId: args.scenarioId,
        playModeId: args.playModeId,
      }),
      getUserRatingForMode({
        userId: opponent.userId,
        scenarioId: args.scenarioId,
        playModeId: args.playModeId,
      }),
    ]);
    ratingA = rA.rating;
    ratingB = rB.rating;
  }

  const { matchId } = await createPvpMatch({
    playerA: {
      userId: args.userId,
      displayName: myProfile ?? "Player",
      ratingAtStart: ratingA,
    },
    playerB: {
      userId: opponent.userId,
      displayName: opponentProfile ?? "Opponent",
      ratingAtStart: ratingB,
    },
    scenarioId: args.scenarioId,
    playModeId: args.playModeId,
  });

  return { matchId };
}

export { COFFEE_SHOP_SCENARIO };
