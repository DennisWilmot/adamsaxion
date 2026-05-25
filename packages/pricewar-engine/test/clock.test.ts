import { describe, expect, it } from "vitest";
import type { MatchId } from "@adamsaxion/pricewar-types";
import {
  beginRoundClocks,
  buildForfeitState,
  freezeClock,
  shouldAutopassOnClockExpiry,
  tickClocks,
} from "../src/engine/clock";
import { createInitialMatchState } from "../src/scenarios/coffee-shop";

describe("clock", () => {
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
