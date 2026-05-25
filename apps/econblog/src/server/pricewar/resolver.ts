import {
  resolveTurn,
  validateMoves,
  toPlayerView,
  getBotPersona,
  createRng,
} from "@adamsaxion/pricewar-engine";
import type { MatchId, PlayerSlot, SubmittedMove } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SCENARIO } from "./matchmaker";
import * as repo from "./repository";
import { emitMatchEvent } from "./sse";
import { finalizeMatchRatings } from "./ratings";
import { onPlayerSubmitClock, onRoundResolved, ensureMatchLifecycle } from "./clock";

export async function resolveRoundIfReady(args: {
  matchId: MatchId;
  round: number;
  slot: PlayerSlot;
  mySubmission: SubmittedMove[];
}) {
  const state = await repo.loadMatch(args.matchId);
  if (!state) return null;

  const otherSlot: PlayerSlot = args.slot === "A" ? "B" : "A";
  let otherSubmission = await repo.getSubmission(args.matchId, args.round, otherSlot);

  if (!otherSubmission) {
    const botPersonalityId = await repo.getBotPersonalityId(args.matchId);
    if (botPersonalityId) {
      await maybeSubmitBotTurn(args.matchId, botPersonalityId);
      otherSubmission = await repo.getSubmission(args.matchId, args.round, otherSlot);
    }
  }

  if (!otherSubmission) {
    return { submitted: true, opponentLocked: false, resolved: false, round: args.round };
  }

  const submittedA = args.slot === "A" ? args.mySubmission : otherSubmission;
  const submittedB = args.slot === "B" ? args.mySubmission : otherSubmission;

  const { nextState, events, report } = resolveTurn({
    state,
    submittedA,
    submittedB,
    scenario: COFFEE_SHOP_SCENARIO,
  });

  await repo.saveMatch(nextState);
  await repo.saveRoundReport({
    matchId: args.matchId,
    round: args.round,
    report,
    eventsSlice: events,
  });

  for (const playerSlot of ["A", "B"] as const) {
    const view = toPlayerView(nextState, playerSlot, { opponentHasLocked: true });
    emitMatchEvent(args.matchId, {
      type: "round_resolved",
      round: args.round,
      view,
      report,
    });
  }

  if (nextState.phase === "completed") {
    await finalizeMatchRatings(args.matchId, nextState);
    for (const playerSlot of ["A", "B"] as const) {
      emitMatchEvent(args.matchId, {
        type: "match_ended",
        outcome: nextState.outcome,
        finalView: toPlayerView(nextState, playerSlot),
      });
    }
  } else {
    await onRoundResolved(args.matchId, nextState);
    const botPersonalityId = await repo.getBotPersonalityId(args.matchId);
    if (botPersonalityId) {
      await maybeSubmitBotTurn(args.matchId, botPersonalityId);
    }
  }

  return {
    submitted: true,
    opponentLocked: true,
    resolved: true,
    reportAvailable: true,
    resolvedRound: args.round,
    phase: nextState.phase,
  };
}

export async function submitTurn(args: {
  matchId: MatchId;
  userId: string;
  moves: SubmittedMove[];
}) {
  const synced = await ensureMatchLifecycle(args.matchId);
  if (!synced) {
    return { error: { code: "MATCH_NOT_FOUND" as const, message: "Match not found." } };
  }

  const state = synced;
  if (state.phase !== "decide") {
    return {
      error: {
        code: "MATCH_COMPLETED" as const,
        message: "Submission rejected.",
      },
    };
  }

  const slot = await repo.getPlayerSlot(args.matchId, args.userId);
  if (!slot) {
    return { error: { code: "MATCH_NOT_FOUND" as const, message: "Match not found." } };
  }

  const validationError = validateMoves(state, slot, args.moves);
  if (validationError) {
    return { error: validationError };
  }

  const round = state.market.currentRound;
  await onPlayerSubmitClock({
    matchId: args.matchId,
    state,
    slot,
    movesLength: args.moves.length,
  });

  const clockState = await repo.loadMatch(args.matchId);
  if (!clockState || clockState.phase === "completed") {
    return { submitted: true, opponentLocked: false, resolved: false, round };
  }

  const { inserted } = await repo.recordSubmission({
    matchId: args.matchId,
    round,
    slot,
    moves: args.moves,
    clockAtSubmitMs: clockState.clocks[slot].remainingMs,
  });

  if (!inserted) {
    return {
      error: {
        code: "ALREADY_SUBMITTED" as const,
        message: "You've already submitted this round.",
      },
    };
  }

  emitMatchEvent(args.matchId, { type: "opponent_locked", round });

  return resolveRoundIfReady({
    matchId: args.matchId,
    round,
    slot,
    mySubmission: args.moves,
  });
}

export async function engineAutopass(args: {
  matchId: MatchId;
  slot: PlayerSlot;
  state?: import("@adamsaxion/pricewar-types").MatchState;
}) {
  const state = args.state ?? (await repo.loadMatch(args.matchId));
  if (!state || state.phase !== "decide") return;

  const round = state.market.currentRound;
  const existing = await repo.getSubmission(args.matchId, round, args.slot);
  if (existing) return;

  await onPlayerSubmitClock({
    matchId: args.matchId,
    state,
    slot: args.slot,
    movesLength: 0,
    byAutopass: true,
  });

  const clockState = (await repo.loadMatch(args.matchId))!;
  const { inserted } = await repo.recordSubmission({
    matchId: args.matchId,
    round,
    slot: args.slot,
    moves: [],
    clockAtSubmitMs: clockState.clocks[args.slot].remainingMs,
    byAutopass: true,
  });

  if (!inserted) return;

  emitMatchEvent(args.matchId, { type: "opponent_locked", round });

  const otherSlot: PlayerSlot = args.slot === "A" ? "B" : "A";
  const otherSubmission = await repo.getSubmission(args.matchId, round, otherSlot);
  if (otherSubmission) {
    await resolveRoundIfReady({
      matchId: args.matchId,
      round,
      slot: otherSlot,
      mySubmission: otherSubmission,
    });
    return;
  }

  const botPersonalityId = await repo.getBotPersonalityId(args.matchId);
  if (botPersonalityId) {
    await maybeSubmitBotTurn(args.matchId, botPersonalityId);
  }
}

export async function maybeSubmitBotTurn(matchId: MatchId, botPersonalityId: string) {
  const state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "decide") return;

  const round = state.market.currentRound;
  const existing = await repo.getSubmission(matchId, round, "B");
  if (existing) return;

  const persona = getBotPersona(botPersonalityId) ?? getBotPersona("bot.random")!;
  const view = toPlayerView(state, "B");
  const rng = createRng(`${state.rngSeed}:bot:${round}`);
  const moves = persona.chooseMoves(view, rng);

  const { inserted } = await repo.recordSubmission({
    matchId,
    round,
    slot: "B",
    moves,
  });

  if (!inserted) return;

  emitMatchEvent(matchId, { type: "opponent_locked", round });

  const humanSubmission = await repo.getSubmission(matchId, round, "A");
  if (humanSubmission) {
    await resolveRoundIfReady({
      matchId,
      round,
      slot: "A",
      mySubmission: humanSubmission,
    });
  }
}
