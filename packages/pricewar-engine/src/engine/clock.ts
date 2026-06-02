import type { MatchState, MatchTimerMeta, PlayerSlot } from "@adamsaxion/pricewar-types";
import { getPlayMode } from "../play-modes/registry";

export const ABANDONMENT_GRACE_MS = 60_000;

export function defaultTimerMeta(): MatchTimerMeta {
  return {
    clockTimeoutCount: { A: 0, B: 0 },
    zeroMoveSubmissionCount: { A: 0, B: 0 },
    roundDecideStartedAt: null,
    abandonmentGraceEndsAt: { A: null, B: null },
    lobbyOpenedAt: null,
    playerConnectedAt: { A: null, B: null },
  };
}

export function ensureTimerMeta(state: MatchState): MatchState {
  if (state.timerMeta) return state;
  return { ...state, timerMeta: defaultTimerMeta() };
}

function elapsedMs(sinceIso: string, nowIso: string): number {
  return Math.max(0, new Date(nowIso).getTime() - new Date(sinceIso).getTime());
}

function clockTickPhases(): readonly MatchState["phase"][] {
  return ["briefing", "decide"];
}

function isClockTickPhase(phase: MatchState["phase"]): boolean {
  return clockTickPhases().includes(phase);
}

function startBothClocks(state: MatchState, nowIso: string): MatchState {
  return {
    ...state,
    updatedAt: nowIso,
    clocks: {
      A: {
        remainingMs: state.clocks.A.remainingMs,
        tickingSince: state.clocks.A.remainingMs > 0 ? nowIso : null,
      },
      B: {
        remainingMs: state.clocks.B.remainingMs,
        tickingSince: state.clocks.B.remainingMs > 0 ? nowIso : null,
      },
    },
  };
}

/** Start match clocks while the player is still on the briefing screen. */
export function beginBriefingClocks(state: MatchState, nowIso: string): MatchState {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock || state.phase !== "briefing") return state;

  const withMeta = ensureTimerMeta(state);
  if (withMeta.timerMeta!.roundDecideStartedAt) return withMeta;

  return {
    ...startBothClocks(withMeta, nowIso),
    timerMeta: {
      ...withMeta.timerMeta!,
      roundDecideStartedAt: nowIso,
      abandonmentGraceEndsAt: { A: null, B: null },
    },
  };
}

export function beginRoundClocks(state: MatchState, nowIso: string): MatchState {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock || state.phase !== "decide") return state;

  const withMeta = ensureTimerMeta(state);
  return {
    ...startBothClocks(withMeta, nowIso),
    timerMeta: {
      ...withMeta.timerMeta!,
      roundDecideStartedAt: nowIso,
      abandonmentGraceEndsAt: { A: null, B: null },
    },
  };
}

/** Freeze every running clock and clear round decide metadata (report / between rounds). */
export function pauseAllClocks(state: MatchState, nowIso: string): MatchState {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock) return state;

  let next = state;
  for (const slot of ["A", "B"] as const) {
    next = freezeClock(next, slot, nowIso);
  }

  const withMeta = ensureTimerMeta(next);
  return {
    ...withMeta,
    updatedAt: nowIso,
    timerMeta: {
      ...withMeta.timerMeta!,
      roundDecideStartedAt: null,
    },
  };
}

/** Resume ticking for active players who still have time but were paused. */
export function resumeDecideClocks(
  state: MatchState,
  nowIso: string,
  frozenSlots: readonly PlayerSlot[]
): MatchState {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock || state.phase !== "decide") return state;

  const frozen = new Set(frozenSlots);
  let next = state;
  let changed = false;

  for (const slot of ["A", "B"] as const) {
    if (frozen.has(slot)) continue;
    const clock = next.clocks[slot];
    if (clock.remainingMs <= 0 || clock.tickingSince) continue;
    next = {
      ...next,
      updatedAt: nowIso,
      clocks: {
        ...next.clocks,
        [slot]: { remainingMs: clock.remainingMs, tickingSince: nowIso },
      },
    };
    changed = true;
  }

  if (!changed) return state;

  const withMeta = ensureTimerMeta(next);
  return {
    ...withMeta,
    updatedAt: nowIso,
    timerMeta: {
      ...withMeta.timerMeta!,
      roundDecideStartedAt: withMeta.timerMeta!.roundDecideStartedAt ?? nowIso,
    },
  };
}

export function freezeClock(
  state: MatchState,
  slot: PlayerSlot,
  nowIso: string
): MatchState {
  const clock = state.clocks[slot];
  if (!clock.tickingSince) return state;

  const remainingMs = Math.max(
    0,
    clock.remainingMs - elapsedMs(clock.tickingSince, nowIso)
  );

  return {
    ...state,
    updatedAt: nowIso,
    clocks: {
      ...state.clocks,
      [slot]: { remainingMs, tickingSince: null },
    },
  };
}

/** Active players whose bank is already at zero (stale DB rows, paused expiry, etc.). */
export function slotsWithZeroClock(
  state: MatchState,
  frozenSlots: readonly PlayerSlot[]
): PlayerSlot[] {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock || !isClockTickPhase(state.phase)) return [];

  const frozen = new Set(frozenSlots);
  const expired: PlayerSlot[] = [];
  for (const slot of ["A", "B"] as const) {
    if (frozen.has(slot)) continue;
    if (state.clocks[slot].remainingMs <= 0) expired.push(slot);
  }
  return expired;
}

export function tickClocks(
  state: MatchState,
  nowIso: string,
  frozenSlots: readonly PlayerSlot[]
): { state: MatchState; expired: PlayerSlot[] } {
  const playMode = getPlayMode(state.playModeId);
  if (!playMode?.clock || !isClockTickPhase(state.phase)) {
    return { state, expired: [] };
  }

  const frozen = new Set(frozenSlots);
  const expired: PlayerSlot[] = [];
  let next = { ...state, updatedAt: nowIso };

  for (const slot of ["A", "B"] as const) {
    if (frozen.has(slot)) continue;

    const clock = next.clocks[slot];
    if (!clock.tickingSince || clock.remainingMs <= 0) continue;

    const remainingMs = Math.max(
      0,
      clock.remainingMs - elapsedMs(clock.tickingSince, nowIso)
    );

    next = {
      ...next,
      clocks: {
        ...next.clocks,
        [slot]: {
          remainingMs,
          tickingSince: remainingMs > 0 ? nowIso : null,
        },
      },
    };

    if (remainingMs <= 0) {
      expired.push(slot);
    }
  }

  return { state: next, expired };
}

export function startAbandonmentGrace(
  state: MatchState,
  slot: PlayerSlot,
  nowIso: string
): MatchState {
  const withMeta = ensureTimerMeta(state);
  const graceEndsAt = new Date(
    new Date(nowIso).getTime() + ABANDONMENT_GRACE_MS
  ).toISOString();

  return {
    ...withMeta,
    updatedAt: nowIso,
    timerMeta: {
      ...withMeta.timerMeta!,
      abandonmentGraceEndsAt: {
        ...withMeta.timerMeta!.abandonmentGraceEndsAt,
        [slot]: graceEndsAt,
      },
    },
  };
}

export function clearAbandonmentGrace(state: MatchState, slot: PlayerSlot): MatchState {
  if (!state.timerMeta) return state;
  return {
    ...state,
    timerMeta: {
      ...state.timerMeta,
      abandonmentGraceEndsAt: {
        ...state.timerMeta.abandonmentGraceEndsAt,
        [slot]: null,
      },
    },
  };
}

export function gracePeriodExpired(
  state: MatchState,
  slot: PlayerSlot,
  nowIso: string
): boolean {
  const endsAt = state.timerMeta?.abandonmentGraceEndsAt[slot];
  if (!endsAt) return false;
  return new Date(nowIso).getTime() >= new Date(endsAt).getTime();
}

export function incrementClockTimeoutCount(
  state: MatchState,
  slot: PlayerSlot
): MatchState {
  const withMeta = ensureTimerMeta(state);
  return {
    ...withMeta,
    timerMeta: {
      ...withMeta.timerMeta!,
      clockTimeoutCount: {
        ...withMeta.timerMeta!.clockTimeoutCount,
        [slot]: withMeta.timerMeta!.clockTimeoutCount[slot] + 1,
      },
    },
  };
}

export function incrementZeroMoveCount(
  state: MatchState,
  slot: PlayerSlot
): MatchState {
  const withMeta = ensureTimerMeta(state);
  return {
    ...withMeta,
    timerMeta: {
      ...withMeta.timerMeta!,
      zeroMoveSubmissionCount: {
        ...withMeta.timerMeta!.zeroMoveSubmissionCount,
        [slot]: withMeta.timerMeta!.zeroMoveSubmissionCount[slot] + 1,
      },
    },
  };
}

export function buildForfeitState(
  state: MatchState,
  loser: PlayerSlot,
  reason: "forfeit_on_timeout" | "forfeit_on_abandonment",
  nowIso: string
): MatchState {
  const winner: PlayerSlot = loser === "A" ? "B" : "A";
  return {
    ...state,
    phase: "completed",
    outcome: { kind: "win", winner, reason },
    updatedAt: nowIso,
    clocks: {
      A: { ...state.clocks.A, tickingSince: null },
      B: { ...state.clocks.B, tickingSince: null },
    },
  };
}

export function shouldAutopassOnClockExpiry(
  state: MatchState,
  slot: PlayerSlot
): boolean {
  const count = state.timerMeta?.clockTimeoutCount[slot] ?? 0;
  return count < 1;
}

export function shouldForfeitOnZeroMoves(
  state: MatchState,
  slot: PlayerSlot
): boolean {
  const playMode = getPlayMode(state.playModeId);
  const limit = playMode?.inactivityForfeitOnZeroMoves ?? 999;
  const count = state.timerMeta?.zeroMoveSubmissionCount[slot] ?? 0;
  return count >= limit;
}
