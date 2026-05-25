import { describe, expect, it } from "vitest";
import { createInitialMatchState, toPlayerView } from "../src";

describe("toPlayerView invariants", () => {
  it("never exposes opponent private keys on player A view", () => {
    const state = createInitialMatchState({
      matchId: "vis-1" as never,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "Alice",
      playerBName: "Bob",
    });

    const view = toPlayerView(state, "A");
    expect(view.opponent).not.toHaveProperty("cash");
    expect(view.opponent).not.toHaveProperty("inventory");
    expect(view.opponent).not.toHaveProperty("morale");
    expect(view.opponent).not.toHaveProperty("reputation");
    expect(view.me.cash).toBe(state.playersPrivate.A.cash);
  });

  it("never exposes opponent private keys on player B view", () => {
    const state = createInitialMatchState({
      matchId: "vis-2" as never,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "Alice",
      playerBName: "Bob",
    });

    const view = toPlayerView(state, "B");
    expect(view.opponent).not.toHaveProperty("cash");
    expect(view.opponent).not.toHaveProperty("inventory");
    expect(view.me.cash).toBe(state.playersPrivate.B.cash);
  });
});
