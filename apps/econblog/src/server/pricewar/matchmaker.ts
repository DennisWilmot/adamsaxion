import {
  createInitialMatchState,
  getBotPersona,
  getPlayMode,
  beginBriefingClocks,
  COFFEE_SHOP_SCENARIO,
} from "@adamsaxion/pricewar-engine";
import type { MatchId } from "@adamsaxion/pricewar-types";
import * as repo from "./repository";
import { getUserRatingForMode } from "./ratings";
import { maybeSubmitBotTurn } from "./resolver";
import { isMarginRatedEnabled } from "./feature-flag";
import {
  drawSyntheticDelaySec,
  getHumanOnlyWindowSec,
  getHumanPolishMinSec,
} from "./margin-matchmaking";
import { getSyntheticOpponent, pickSyntheticOpponent } from "@/lib/pricewar/synthetic-opponents";

function queuedStatus(entry: NonNullable<Awaited<ReturnType<typeof repo.getQueueEntry>>>) {
  const elapsedSec = Math.floor((Date.now() - entry.enqueuedAt.getTime()) / 1000);
  return {
    kind: "queued" as const,
    scenarioId: entry.scenarioId,
    playModeId: entry.playModeId,
    enqueuedAt: entry.enqueuedAt.toISOString(),
    elapsedSec,
  };
}

export async function createVsBotMatch(args: {
  userId: string;
  playerName: string;
  playerAvatarUrl?: string | null;
  scenarioId: string;
  playModeId: string;
  botPersonalityId: string;
  displayName?: string;
  syntheticOpponentId?: string | null;
  opponentAvatarUrl?: string | null;
  opponentRatingAtStart?: number | null;
  humanRatingAtStart?: number | null;
}): Promise<{ matchId: MatchId }> {
  const playMode = getPlayMode(args.playModeId);
  if (!playMode) {
    throw new Error("Unknown play mode");
  }

  const bot = getBotPersona(args.botPersonalityId) ?? getBotPersona("bot.random")!;
  const synthetic = getSyntheticOpponent(args.syntheticOpponentId);
  const opponentName = args.displayName ?? synthetic?.displayName ?? bot.label;
  const opponentAvatarUrl =
    args.opponentAvatarUrl ?? synthetic?.avatarUrl ?? null;
  const rngSeed = crypto.randomUUID();

  const baseState = createInitialMatchState({
    matchId: "pending" as MatchId,
    playModeId: args.playModeId,
    rngSeed,
    playerAName: args.playerName,
    playerBName: opponentName,
    playerBIsBot: true,
    playerAAvatarUrl: args.playerAvatarUrl ?? null,
    playerBAvatarUrl: opponentAvatarUrl,
  });
  const state =
    args.playModeId === "tutorial"
      ? { ...baseState, phase: "decide" as const }
      : playMode.clock
        ? beginBriefingClocks(baseState, new Date().toISOString())
        : baseState;

  const matchId = await repo.createMatchWithPlayers({
    state,
    playerA: {
      userId: args.userId,
      displayName: args.playerName,
      ratingAtStart: args.humanRatingAtStart ?? null,
    },
    playerB: {
      displayName: opponentName,
      isBot: true,
      botPersonalityId: bot.id,
      syntheticOpponentId: args.syntheticOpponentId ?? null,
      ratingAtStart: args.opponentRatingAtStart ?? null,
    },
  });

  const finalState = { ...state, matchId };
  await repo.saveMatch(finalState);

  return { matchId };
}

export async function createPvpMatch(args: {
  playerA: {
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
    ratingAtStart?: number | null;
  };
  playerB: {
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
    ratingAtStart?: number | null;
  };
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
    playerAAvatarUrl: args.playerA.avatarUrl ?? null,
    playerBAvatarUrl: args.playerB.avatarUrl ?? null,
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
}): Promise<{ queuedAt: string }> {
  const queuedAt = await repo.enqueueUser({
    userId: args.userId,
    scenarioId: args.scenarioId,
    playModeId: args.playModeId,
    ratingAtEnqueue: args.ratingAtEnqueue ?? null,
    botFallbackAfterSec: 0,
  });
  return { queuedAt };
}

async function tryPairHumanFromQueue(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  playerName: string;
}): Promise<{ paired: true } | { queued: true; queuedAt: string }> {
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
    repo.getProfilePublic(opponent.userId),
    repo.getProfilePublic(args.userId),
  ]);

  let ratingA: number | null = null;
  let ratingB: number | null = null;
  if (isMarginRatedEnabled()) {
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
      displayName: myProfile?.username ?? "Player",
      avatarUrl: myProfile?.avatarUrl ?? null,
      ratingAtStart: ratingA,
    },
    playerB: {
      userId: opponent.userId,
      displayName: opponentProfile?.username ?? "Opponent",
      avatarUrl: opponentProfile?.avatarUrl ?? null,
      ratingAtStart: ratingB,
    },
    scenarioId: args.scenarioId,
    playModeId: args.playModeId,
  });

  const humanMatchedAt = new Date();
  await Promise.all([
    repo.setQueueHumanPending({
      userId: args.userId,
      pendingMatchId: matchId,
      humanMatchedAt,
    }),
    repo.setQueueHumanPending({
      userId: opponent.userId,
      pendingMatchId: matchId,
      humanMatchedAt,
    }),
  ]);

  return { paired: true };
}

export async function advanceMatchmaking(args: {
  userId: string;
  playerName: string;
}): Promise<
  | { kind: "matched"; matchId: MatchId }
  | {
      kind: "queued";
      scenarioId: string;
      playModeId: string;
      enqueuedAt: string;
      elapsedSec: number;
    }
  | { kind: "idle" }
> {
  const entry = await repo.getQueueEntry(args.userId);
  if (!entry) return { kind: "idle" };

  if (entry.pendingMatchId && entry.humanMatchedAt) {
    const polishSec = getHumanPolishMinSec();
    const sinceMatchMs = Date.now() - entry.humanMatchedAt.getTime();
    if (sinceMatchMs >= polishSec * 1000) {
      const matchId = entry.pendingMatchId as MatchId;
      await repo.removeFromQueue(args.userId);
      return { kind: "matched", matchId };
    }
    return queuedStatus(entry);
  }

  const humanPair = await tryPairHumanFromQueue({
    userId: args.userId,
    scenarioId: entry.scenarioId,
    playModeId: entry.playModeId,
    playerName: args.playerName,
  });
  if ("paired" in humanPair && humanPair.paired) {
    const refreshed = await repo.getQueueEntry(args.userId);
    if (refreshed) return queuedStatus(refreshed);
  }

  const elapsedSec = Math.floor((Date.now() - entry.enqueuedAt.getTime()) / 1000);
  const humanWindow = getHumanOnlyWindowSec();

  if (elapsedSec < humanWindow) {
    return queuedStatus(entry);
  }

  let syntheticDelay = entry.syntheticDelaySec;
  if (syntheticDelay == null) {
    syntheticDelay = drawSyntheticDelaySec();
    await repo.setQueueSyntheticDelay(args.userId, syntheticDelay);
  }

  if (elapsedSec >= humanWindow + syntheticDelay) {
    await repo.removeFromQueue(args.userId);

    let humanRating: number | null = null;
    if (isMarginRatedEnabled()) {
      const row = await getUserRatingForMode({
        userId: args.userId,
        scenarioId: entry.scenarioId,
        playModeId: entry.playModeId,
      });
      humanRating = row.rating;
    }

    const synthetic = pickSyntheticOpponent({ playerRating: humanRating });
    const playMode = getPlayMode(entry.playModeId);
    const ratedSynthetic = isMarginRatedEnabled() && Boolean(playMode?.affectsRating);
    const profile = await repo.getProfilePublic(args.userId);

    const { matchId } = await createVsBotMatch({
      userId: args.userId,
      playerName: args.playerName,
      playerAvatarUrl: profile?.avatarUrl ?? null,
      scenarioId: entry.scenarioId,
      playModeId: entry.playModeId,
      botPersonalityId: synthetic.botPersonalityId,
      displayName: synthetic.displayName,
      syntheticOpponentId: synthetic.id,
      opponentAvatarUrl: synthetic.avatarUrl,
      opponentRatingAtStart: ratedSynthetic ? synthetic.rating : null,
      humanRatingAtStart: ratedSynthetic ? humanRating : null,
    });
    await maybeSubmitBotTurn(matchId, synthetic.botPersonalityId);
    return { kind: "matched", matchId };
  }

  return queuedStatus(entry);
}

export { COFFEE_SHOP_SCENARIO };

/** @deprecated Use advanceMatchmaking — kept for tests importing tryMatchFromQueue */
export async function tryMatchFromQueue(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  playerName: string;
}): Promise<{ matchId: MatchId } | { queued: true; queuedAt: string }> {
  const result = await tryPairHumanFromQueue(args);
  if ("paired" in result && result.paired) {
    const entry = await repo.getQueueEntry(args.userId);
    if (entry?.pendingMatchId) {
      return { matchId: entry.pendingMatchId as MatchId };
    }
  }
  if ("queued" in result) {
    return result;
  }
  const status = await repo.getQueueEntry(args.userId);
  return { queued: true, queuedAt: status?.enqueuedAt.toISOString() ?? new Date().toISOString() };
}

/** @deprecated No longer exposed to clients */
export function getBotFallbackAfterSec(_playModeId: string): number {
  return getHumanOnlyWindowSec();
}
