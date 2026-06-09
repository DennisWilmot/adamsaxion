import {
  applyRatingDelta,
  computeRatingDelta,
  getPlayMode,
} from "@adamsaxion/pricewar-engine";
import type { MatchId, MatchState, PlayerSlot } from "@adamsaxion/pricewar-types";
import { isMarginRatedEnabled } from "@/server/pricewar/feature-flag";
import * as repo from "@/server/pricewar/repository";

function slotScore(outcome: MatchState["outcome"], slot: PlayerSlot): 0 | 0.5 | 1 {
  if (outcome.kind === "draw") return 0.5;
  if (outcome.kind !== "win") return 0;
  return outcome.winner === slot ? 1 : 0;
}

function reducedK(outcome: MatchState["outcome"], playModeId: string): boolean {
  const playMode = getPlayMode(playModeId);
  if (!playMode?.reducedKOnTimeoutForfeit) return false;
  return outcome.kind === "win" && outcome.reason === "forfeit_on_timeout";
}

export async function finalizeMatchRatings(
  matchId: MatchId,
  state: MatchState
): Promise<void> {
  if (state.phase !== "completed") return;
  if (!isMarginRatedEnabled()) return;

  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.affectsRating) return;

  const participants = await repo.getMatchParticipants(matchId);
  const human = participants.find((p) => p.userId && !p.isBot);
  const bot = participants.find((p) => p.isBot);
  const humans = participants.filter((p) => p.userId && !p.isBot);

  const useReducedK = reducedK(state.outcome, state.playModeId);

  if (human && bot && bot.ratingAtStart != null) {
    const humanRating = await repo.getOrCreateRating({
      userId: human.userId!,
      scenarioId: state.scenarioId,
      playModeId: state.playModeId,
    });
    const humanSlot = human.slot as PlayerSlot;
    const delta = computeRatingDelta({
      rating: humanRating.rating,
      opponentRating: bot.ratingAtStart,
      gamesPlayed: humanRating.gamesPlayed,
      score: slotScore(state.outcome, humanSlot),
      reducedK: useReducedK,
    });
    const after = applyRatingDelta(humanRating.rating, delta);
    await repo.applyRatingUpdates({
      matchId,
      updates: [
        {
          userId: human.userId!,
          slot: humanSlot,
          scenarioId: state.scenarioId,
          playModeId: state.playModeId,
          ratingBefore: humanRating.rating,
          ratingAfter: after,
          ratingDelta: delta,
          gamesPlayed: humanRating.gamesPlayed,
        },
      ],
    });
    return;
  }

  if (participants.some((p) => p.isBot)) return;
  if (humans.length !== 2) return;

  const slotA = humans.find((p) => p.slot === "A")!;
  const slotB = humans.find((p) => p.slot === "B")!;

  const ratingA = await repo.getOrCreateRating({
    userId: slotA.userId!,
    scenarioId: state.scenarioId,
    playModeId: state.playModeId,
  });
  const ratingB = await repo.getOrCreateRating({
    userId: slotB.userId!,
    scenarioId: state.scenarioId,
    playModeId: state.playModeId,
  });

  const deltaA = computeRatingDelta({
    rating: ratingA.rating,
    opponentRating: ratingB.rating,
    gamesPlayed: ratingA.gamesPlayed,
    score: slotScore(state.outcome, "A"),
    reducedK: useReducedK,
  });
  const deltaB = computeRatingDelta({
    rating: ratingB.rating,
    opponentRating: ratingA.rating,
    gamesPlayed: ratingB.gamesPlayed,
    score: slotScore(state.outcome, "B"),
    reducedK: useReducedK,
  });

  const afterA = applyRatingDelta(ratingA.rating, deltaA);
  const afterB = applyRatingDelta(ratingB.rating, deltaB);

  await repo.applyRatingUpdates({
    matchId,
    updates: [
      {
        userId: slotA.userId!,
        slot: "A",
        scenarioId: state.scenarioId,
        playModeId: state.playModeId,
        ratingBefore: ratingA.rating,
        ratingAfter: afterA,
        ratingDelta: deltaA,
        gamesPlayed: ratingA.gamesPlayed,
      },
      {
        userId: slotB.userId!,
        slot: "B",
        scenarioId: state.scenarioId,
        playModeId: state.playModeId,
        ratingBefore: ratingB.rating,
        ratingAfter: afterB,
        ratingDelta: deltaB,
        gamesPlayed: ratingB.gamesPlayed,
      },
    ],
  });
}

export async function getUserRatingForMode(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
}) {
  return repo.getOrCreateRating(args);
}
