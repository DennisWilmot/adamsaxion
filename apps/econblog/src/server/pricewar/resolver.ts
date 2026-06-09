import {
  resolveTurn,
  validateMoves,
  toPlayerView,
  getBotPersona,
  createRng,
  pauseAllClocks,
} from "@adamsaxion/pricewar-engine";
import type { MatchId, PlayerSlot, SubmittedMove } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SCENARIO } from "./matchmaker";
import * as repo from "./repository";
import { emitMatchEvent } from "./sse";
import { enrichOpponentView } from "./player-view";
import { finalizeMatchRatings } from "./ratings";
import { onPlayerSubmitClock, ensureMatchLifecycle } from "./clock";

/**
 * Reconcile a round that should have resolved but is still in `decide`.
 *
 * This is the safety net behind the deferred (post-response) resolution kicked
 * off by `POST /submit`: if that background task is dropped (process restart,
 * etc.) the next `GET /view` poll drives the round forward. It handles two
 * cases — both slots already locked (resolve now), and a bot match where the
 * human has locked but the bot has not yet submitted (drive the bot turn).
 * Every underlying write is idempotent (`onConflictDoNothing`), so racing with
 * the deferred resolution is safe.
 */
export async function tryResolveStaleLockedRound(matchId: MatchId): Promise<void> {
  const state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "decide") return;

  const round = state.market.currentRound;
  const subA = await repo.getSubmission(matchId, round, "A");
  const subB = await repo.getSubmission(matchId, round, "B");

  try {
    if (subA && subB) {
      await resolveRoundIfReady({ matchId, round, slot: "A", mySubmission: subA });
      return;
    }
    if (subA && !subB) {
      const botPersonalityId = await repo.getBotPersonalityId(matchId);
      if (botPersonalityId) {
        await maybeSubmitBotTurn(matchId, botPersonalityId);
      }
    }
  } catch (err) {
    console.error("[pricewar] stale locked-round reconcile failed", { matchId, round, err });
  }
}

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

  const { nextState, adminTrace, report } = resolveTurn({
    state,
    submittedA,
    submittedB,
    scenario: COFFEE_SHOP_SCENARIO,
  });

  const stateToSave =
    nextState.phase === "report"
      ? pauseAllClocks(nextState, new Date().toISOString())
      : nextState;

  await repo.saveMatch(stateToSave);
  await repo.saveRoundReport({
    matchId: args.matchId,
    round: args.round,
    report,
    eventsSlice: adminTrace,
  });

  for (const playerSlot of ["A", "B"] as const) {
    const rawView = toPlayerView(stateToSave, playerSlot, {
      opponentHasLocked: true,
      meHasLocked: true,
    });
    const view = await enrichOpponentView(args.matchId, playerSlot, rawView);
    emitMatchEvent(args.matchId, {
      type: "round_resolved",
      round: args.round,
      view,
      report,
    });
  }

  if (stateToSave.phase === "completed") {
    await finalizeMatchRatings(args.matchId, stateToSave);
    for (const playerSlot of ["A", "B"] as const) {
      const finalView = await enrichOpponentView(
        args.matchId,
        playerSlot,
        toPlayerView(stateToSave, playerSlot)
      );
      emitMatchEvent(args.matchId, {
        type: "match_ended",
        outcome: stateToSave.outcome,
        finalView,
      });
    }
  } else {
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
    phase: stateToSave.phase,
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

  const validationError = validateMoves(state, slot, args.moves, COFFEE_SHOP_SCENARIO);
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
    return { submitted: true, round, slot, pendingResolution: false };
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

  // Resolution (bot move + engine resolveTurn + report/rating writes) is the
  // heavy part of the request. We defer it to after the response is flushed
  // (see the submit route's `after()` call) so locking in feels instant; the
  // resolved round is delivered to clients over SSE, with the /view poll as a
  // reconciliation backstop.
  return { submitted: true, round, slot, pendingResolution: true };
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

  await onPlayerSubmitClock({
    matchId,
    state,
    slot: "B",
    movesLength: moves.length,
  });

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
