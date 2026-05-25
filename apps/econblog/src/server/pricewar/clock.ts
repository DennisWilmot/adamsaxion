import {
  beginRoundClocks,
  buildForfeitState,
  clearAbandonmentGrace,
  ensureTimerMeta,
  freezeClock,
  getPlayMode,
  gracePeriodExpired,
  incrementClockTimeoutCount,
  incrementZeroMoveCount,
  shouldAutopassOnClockExpiry,
  shouldForfeitOnZeroMoves,
  startAbandonmentGrace,
  tickClocks,
  toPlayerView,
} from "@adamsaxion/pricewar-engine";
import type { MatchId, MatchState, PlayerSlot, GameError } from "@adamsaxion/pricewar-types";
import * as repo from "./repository";
import { emitMatchEvent } from "./sse";
import { finalizeMatchRatings } from "./ratings";

async function endMatchForfeit(args: {
  matchId: MatchId;
  state: MatchState;
  loser: PlayerSlot;
  reason: "forfeit_on_timeout" | "forfeit_on_abandonment";
}) {
  const nowIso = new Date().toISOString();
  const finalState = buildForfeitState(args.state, args.loser, args.reason, nowIso);
  await repo.saveMatch(finalState);
  await finalizeMatchRatings(args.matchId, finalState);

  for (const slot of ["A", "B"] as const) {
    emitMatchEvent(args.matchId, {
      type: "match_ended",
      outcome: finalState.outcome,
      finalView: toPlayerView(finalState, slot),
    });
  }

  return finalState;
}

async function submittedSlotsForRound(
  matchId: MatchId,
  round: number
): Promise<PlayerSlot[]> {
  const slots: PlayerSlot[] = [];
  for (const slot of ["A", "B"] as const) {
    const submission = await repo.getSubmission(matchId, round, slot);
    if (submission) slots.push(slot);
  }
  return slots;
}

async function handleExpiredSlot(args: {
  matchId: MatchId;
  state: MatchState;
  slot: PlayerSlot;
  abandoned: boolean;
}) {
  const { matchId, slot, abandoned } = args;
  let state = args.state;
  const round = state.market.currentRound;
  const existing = await repo.getSubmission(matchId, round, slot);
  if (existing) return state;

  if (abandoned) {
    const graceActive = state.timerMeta?.abandonmentGraceEndsAt[slot];
    if (!graceActive) {
      state = startAbandonmentGrace(state, slot, new Date().toISOString());
      await repo.saveMatch(state);
      emitMatchEvent(matchId, {
        type: "opponent_disconnected",
        gracePeriodEndsAt: state.timerMeta!.abandonmentGraceEndsAt[slot]!,
      });
      return state;
    }

    if (gracePeriodExpired(state, slot, new Date().toISOString())) {
      await endMatchForfeit({
        matchId,
        state,
        loser: slot,
        reason: "forfeit_on_abandonment",
      });
      return null;
    }
    return state;
  }

  if (shouldAutopassOnClockExpiry(state, slot)) {
    state = incrementClockTimeoutCount(state, slot);
    await repo.saveMatch(state);
    const { engineAutopass } = await import("./resolver");
    await engineAutopass({ matchId, slot, state });
    return repo.loadMatch(matchId);
  }

  await endMatchForfeit({
    matchId,
    state,
    loser: slot,
    reason: "forfeit_on_timeout",
  });
  return null;
}

export async function syncMatchClocks(matchId: MatchId): Promise<MatchState | null> {
  let state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "decide") return state;

  const round = state.market.currentRound;
  const submitted = await submittedSlotsForRound(matchId, round);
  const nowIso = new Date().toISOString();

  if (!state.timerMeta?.roundDecideStartedAt) {
    state = beginRoundClocks(state, nowIso);
    await repo.saveMatch(state);
  }

  const { state: ticked, expired } = tickClocks(state, nowIso, submitted);
  if (ticked !== state) {
    state = ticked;
    await repo.saveMatch(state);
  }

  for (const slot of expired) {
    const abandoned = await repo.isPlayerAbandoned(matchId, slot);
    const next = await handleExpiredSlot({ matchId, state, slot, abandoned });
    if (!next) return null;
    state = next;
    if (state.phase === "completed") return state;
  }

  for (const slot of ["A", "B"] as const) {
    const graceEndsAt = state.timerMeta?.abandonmentGraceEndsAt[slot];
    if (!graceEndsAt) continue;
    if (gracePeriodExpired(state, slot, nowIso)) {
      await endMatchForfeit({
        matchId,
        state,
        loser: slot,
        reason: "forfeit_on_abandonment",
      });
      return null;
    }
  }

  return state;
}

export async function onPlayerSubmitClock(args: {
  matchId: MatchId;
  state: MatchState;
  slot: PlayerSlot;
  movesLength: number;
  byAutopass?: boolean;
}): Promise<MatchState> {
  let state = freezeClock(args.state, args.slot, new Date().toISOString());
  state = clearAbandonmentGrace(state, args.slot);
  await repo.clearPlayerAbandoned(args.matchId, args.slot);

  if (args.movesLength === 0 && !args.byAutopass) {
    state = incrementZeroMoveCount(state, args.slot);
    if (shouldForfeitOnZeroMoves(state, args.slot)) {
      await endMatchForfeit({
        matchId: args.matchId,
        state,
        loser: args.slot,
        reason: "forfeit_on_timeout",
      });
      return (await repo.loadMatch(args.matchId))!;
    }
  }

  await repo.saveMatch(state);
  return state;
}

export async function onRoundResolved(matchId: MatchId, state: MatchState) {
  if (state.phase !== "decide") return;
  const next = beginRoundClocks(state, new Date().toISOString());
  await repo.saveMatch(next);
}

export async function forfeitMatch(args: {
  matchId: MatchId;
  userId: string;
}): Promise<{ ok: true } | { error: GameError }> {
  const slot = await repo.getPlayerSlot(args.matchId, args.userId);
  if (!slot) {
    return { error: { code: "MATCH_NOT_FOUND", message: "Match not found." } };
  }

  let state = await repo.loadMatch(args.matchId);
  if (!state) {
    return { error: { code: "MATCH_NOT_FOUND", message: "Match not found." } };
  }

  if (state.phase === "decide") {
    state = (await syncMatchClocks(args.matchId)) ?? state;
  }

  if (!state || state.phase === "completed") {
    return { error: { code: "MATCH_COMPLETED", message: "Match already ended." } };
  }

  await endMatchForfeit({
    matchId: args.matchId,
    state,
    loser: slot,
    reason: "forfeit_on_abandonment",
  });

  return { ok: true };
}

export async function markPlayerDisconnected(args: {
  matchId: MatchId;
  userId: string;
}) {
  const slot = await repo.getPlayerSlot(args.matchId, args.userId);
  if (!slot) return;
  await repo.markPlayerAbandoned(args.matchId, slot);
}

async function slotIsPresent(
  matchId: MatchId,
  state: MatchState,
  slot: PlayerSlot
): Promise<boolean> {
  const participants = await repo.getMatchParticipants(matchId);
  const row = participants.find((p) => p.slot === slot);
  if (row?.isBot) return true;
  return Boolean(state.timerMeta?.playerConnectedAt?.[slot]);
}

async function tryStartMatchFromLobby(matchId: MatchId): Promise<MatchState | null> {
  let state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "waiting_for_opponent") return state;

  const presentA = await slotIsPresent(matchId, state, "A");
  const presentB = await slotIsPresent(matchId, state, "B");
  if (!presentA || !presentB) return state;

  state = { ...state, phase: "decide" };
  state = beginRoundClocks(state, new Date().toISOString());
  await repo.saveMatch(state);

  for (const slot of ["A", "B"] as const) {
    emitMatchEvent(matchId, {
      type: "match_started",
      view: toPlayerView(state, slot),
    });
  }

  return state;
}

async function syncMatchLobby(matchId: MatchId): Promise<MatchState | null> {
  let state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "waiting_for_opponent") return state;

  const lobbyOpenedAt = state.timerMeta?.lobbyOpenedAt;
  if (!lobbyOpenedAt) return state;

  const playMode = getPlayMode(state.playModeId);
  const graceMs = playMode?.matchStartGraceMs ?? 60_000;
  const elapsed = Date.now() - new Date(lobbyOpenedAt).getTime();
  if (elapsed < graceMs) return state;

  const missing: PlayerSlot[] = [];
  for (const slot of ["A", "B"] as const) {
    if (!(await slotIsPresent(matchId, state, slot))) {
      missing.push(slot);
    }
  }

  if (missing.length !== 1) return state;

  await endMatchForfeit({
    matchId,
    state,
    loser: missing[0]!,
    reason: "forfeit_on_abandonment",
  });
  return null;
}

export async function recordPlayerPresence(
  matchId: MatchId,
  userId: string
): Promise<void> {
  const slot = await repo.getPlayerSlot(matchId, userId);
  if (!slot) return;

  let state = await repo.loadMatch(matchId);
  if (!state || state.phase === "completed") return;

  state = ensureTimerMeta(state);
  const connectedAt = state.timerMeta!.playerConnectedAt[slot];
  if (!connectedAt) {
    state = {
      ...state,
      timerMeta: {
        ...state.timerMeta!,
        playerConnectedAt: {
          ...state.timerMeta!.playerConnectedAt,
          [slot]: new Date().toISOString(),
        },
      },
    };
    await repo.saveMatch(state);
  }

  await tryStartMatchFromLobby(matchId);
}

export async function ensureMatchLifecycle(
  matchId: MatchId,
  userId?: string
): Promise<MatchState | null> {
  if (userId) {
    await recordPlayerPresence(matchId, userId);
  }

  let state = await repo.loadMatch(matchId);
  if (!state || state.phase === "completed") return state;

  if (state.phase === "waiting_for_opponent") {
    state = await syncMatchLobby(matchId);
    if (!state) return null;
    return state;
  }

  return syncMatchClocks(matchId);
}

/** E2E-only: force the authenticated player's clock to zero and run sync. */
export async function forceClockExpiryForE2e(
  matchId: MatchId,
  userId: string
): Promise<{ ok: true; phase: string } | { error: GameError }> {
  if (process.env.PRICEWAR_E2E_ENABLED !== "1") {
    return {
      error: { code: "FORBIDDEN", message: "E2E helpers are disabled." },
    };
  }

  const slot = await repo.getPlayerSlot(matchId, userId);
  if (!slot) {
    return { error: { code: "MATCH_NOT_FOUND", message: "Match not found." } };
  }

  let state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "decide") {
    return { error: { code: "MATCH_COMPLETED", message: "Match not in decide phase." } };
  }

  const pastIso = new Date(Date.now() - 10_000).toISOString();
  state = {
    ...state,
    clocks: {
      ...state.clocks,
      [slot]: { remainingMs: 0, tickingSince: pastIso },
    },
  };
  await repo.saveMatch(state);

  const next = await syncMatchClocks(matchId);
  return { ok: true, phase: next?.phase ?? "completed" };
}

/** E2E-only: mark disconnect, expire clock, skip abandonment grace, forfeit. */
export async function forceAbandonmentForE2e(
  matchId: MatchId,
  userId: string
): Promise<{ ok: true; phase: string } | { error: GameError }> {
  if (process.env.PRICEWAR_E2E_ENABLED !== "1") {
    return {
      error: { code: "FORBIDDEN", message: "E2E helpers are disabled." },
    };
  }

  const slot = await repo.getPlayerSlot(matchId, userId);
  if (!slot) {
    return { error: { code: "MATCH_NOT_FOUND", message: "Match not found." } };
  }

  let state = await repo.loadMatch(matchId);
  if (!state || state.phase !== "decide") {
    return { error: { code: "MATCH_COMPLETED", message: "Match not in decide phase." } };
  }

  await repo.markPlayerAbandoned(matchId, slot);

  const pastIso = new Date(Date.now() - 10_000).toISOString();
  state = {
    ...state,
    clocks: {
      ...state.clocks,
      [slot]: { remainingMs: 5_000, tickingSince: pastIso },
    },
  };
  await repo.saveMatch(state);

  state = await syncMatchClocks(matchId);
  if (state?.phase === "decide") {
    state = ensureTimerMeta(state);
    const gracePast = new Date(Date.now() - 1_000).toISOString();
    state = {
      ...state,
      timerMeta: {
        ...state.timerMeta!,
        abandonmentGraceEndsAt: {
          ...state.timerMeta!.abandonmentGraceEndsAt,
          [slot]: gracePast,
        },
      },
    };
    await repo.saveMatch(state);
    await syncMatchClocks(matchId);
  }

  const final = await repo.loadMatch(matchId);
  return { ok: true, phase: final?.phase ?? "completed" };
}
