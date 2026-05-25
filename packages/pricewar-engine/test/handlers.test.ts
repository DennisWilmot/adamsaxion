import { describe, expect, it } from "vitest";
import { ACTION_HANDLERS, hasActionHandler } from "../src/actions/handlers/registry";
import { ACTION_CATALOG_DATA } from "../src/actions/catalog-data";
import { reviewForecastForDraft, createInitialMatchState, COFFEE_SHOP_SCENARIO } from "../src";

describe("action handlers", () => {
  it("implements all 46 catalog actions", () => {
    for (const entry of ACTION_CATALOG_DATA) {
      expect(hasActionHandler(entry.id), entry.id).toBe(true);
      expect(ACTION_HANDLERS[entry.id]).toBeTypeOf("function");
    }
    expect(Object.keys(ACTION_HANDLERS).length).toBeGreaterThanOrEqual(46);
  });
});

describe("reviewForecastForDraft", () => {
  it("returns state-aware warnings for overtime", () => {
    const state = createInitialMatchState({
      matchId: "forecast" as never,
      playModeId: "blitz",
      rngSeed: "f",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    state.playersPrivate.A.morale = 20;

    const lines = reviewForecastForDraft(
      state,
      "A",
      [{ moveId: "operations.o08" as never, input: { enabled: true }, draftedAt: "" }],
      COFFEE_SHOP_SCENARIO
    );
    expect(lines.some((l) => l.text.includes("Morale"))).toBe(true);
  });
});
