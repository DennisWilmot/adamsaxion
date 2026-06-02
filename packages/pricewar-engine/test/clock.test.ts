import { describe, expect, it } from "vitest";
import type { MatchId } from "@adamsaxion/pricewar-types";
import {
  beginBriefingClocks,
  beginRoundClocks,
  buildForfeitState,
  freezeClock,
  pauseAllClocks,
  resumeDecideClocks,
  shouldAutopassOnClockExpiry,
  slotsWithZeroClock,
  tickClocks,
} from "../src/engine/clock";
import { createInitialMatchState } from "../src/scenarios/coffee-shop";

describe("clock", () => {
  it("starts clocks during briefing before the player begins round 1", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    expect(state.phase).toBe("briefing");

    state = beginBriefingClocks(state, "2026-01-01T00:00:00.000Z");
    state.clocks.A.remainingMs = 5000;

    expect(state.clocks.A.tickingSince).toBe("2026-01-01T00:00:00.000Z");
    expect(state.clocks.B.tickingSince).toBe("2026-01-01T00:00:00.000Z");

    const { expired } = tickClocks(state, "2026-01-01T00:00:06.000Z", []);
    expect(expired).toEqual(["A"]);
  });

  it("does not restart clocks when briefing already started", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state = beginBriefingClocks(state, "2026-01-01T00:00:00.000Z");
    state.clocks.A.remainingMs = 290_000;

    state = beginBriefingClocks(state, "2026-01-01T00:01:00.000Z");

    expect(state.clocks.A.tickingSince).toBe("2026-01-01T00:00:00.000Z");
    expect(state.clocks.A.remainingMs).toBe(290_000);
  });

  it("ticks down active clocks and reports expiry", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state = beginRoundClocks(state, "2026-01-01T00:00:00.000Z");
    state.clocks.A.remainingMs = 5000;

    const { state: ticked, expired } = tickClocks(
      state,
      "2026-01-01T00:00:06.000Z",
      []
    );

    expect(ticked.clocks.A.remainingMs).toBe(0);
    expect(expired).toEqual(["A"]);
  });

  it("freezes clock on submit", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state = beginRoundClocks(state, "2026-01-01T00:00:00.000Z");
    state.clocks.A.remainingMs = 120_000;

    state = freezeClock(state, "A", "2026-01-01T00:01:00.000Z");

    expect(state.clocks.A.remainingMs).toBe(60_000);
    expect(state.clocks.A.tickingSince).toBeNull();
  });

  it("pauses all clocks between rounds", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state = beginRoundClocks(state, "2026-01-01T00:00:00.000Z");

    state = pauseAllClocks(state, "2026-01-01T00:01:00.000Z");

    expect(state.clocks.A.tickingSince).toBeNull();
    expect(state.clocks.B.tickingSince).toBeNull();
    expect(state.timerMeta?.roundDecideStartedAt).toBeNull();
    expect(state.clocks.A.remainingMs).toBeLessThan(300_000);
  });

  it("resumes paused clocks when the next decide phase starts", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state = beginRoundClocks(state, "2026-01-01T00:00:00.000Z");
    state = pauseAllClocks(state, "2026-01-01T00:01:00.000Z");
    const remainingAfterPause = state.clocks.A.remainingMs;

    state = resumeDecideClocks(state, "2026-01-01T00:02:00.000Z", []);

    expect(state.clocks.A.remainingMs).toBe(remainingAfterPause);
    expect(state.clocks.A.tickingSince).toBe("2026-01-01T00:02:00.000Z");
  });

  it("does not double-count elapsed time across consecutive ticks", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state = beginRoundClocks(state, "2026-01-01T00:00:00.000Z");
    state.clocks.A.remainingMs = 300_000;

    const first = tickClocks(state, "2026-01-01T00:00:10.000Z", []);
    expect(first.state.clocks.A.remainingMs).toBe(290_000);

    const second = tickClocks(first.state, "2026-01-01T00:00:20.000Z", []);
    expect(second.state.clocks.A.remainingMs).toBe(280_000);
  });

  it("detects slots already at zero without an active tick", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state.clocks.A.remainingMs = 0;
    state.clocks.A.tickingSince = null;

    expect(slotsWithZeroClock(state, [])).toEqual(["A"]);
    expect(slotsWithZeroClock(state, ["A"])).toEqual([]);
  });

  it("allows one autopass before forfeit", () => {
    let state = createInitialMatchState({
      matchId: "m1" as MatchId,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "A",
      playerBName: "B",
    });
    expect(shouldAutopassOnClockExpiry(state, "A")).toBe(true);

    state = buildForfeitState(state, "A", "forfeit_on_timeout", new Date().toISOString());
    expect(state.outcome).toEqual({
      kind: "win",
      winner: "B",
      reason: "forfeit_on_timeout",
    });
  });
});
