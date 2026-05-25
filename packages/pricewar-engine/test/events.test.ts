import { describe, expect, it } from "vitest";
import { createRng } from "../src/rng/seeded";
import { COFFEE_SHOP_EVENTS, drawCoffeeShopEvent } from "../src/simulation/events";
import { createInitialMatchState, resolveTurn } from "../src";
import { COFFEE_SHOP_SCENARIO } from "../src/scenarios/coffee-shop";

describe("stochastic events", () => {
  it("drawCoffeeShopEvent is deterministic for a fixed seed", () => {
    const rng1 = createRng("event-seed");
    const rng2 = createRng("event-seed");
    expect(drawCoffeeShopEvent(rng1).id).toBe(drawCoffeeShopEvent(rng2).id);
  });

  it("includes downtown coffee events in the table", () => {
    const ids = new Set(COFFEE_SHOP_EVENTS.map((e) => e.id));
    expect(ids.has("event.health_inspection")).toBe(true);
    expect(ids.has("event.heavy_rain")).toBe(true);
    expect(ids.has("event.festival")).toBe(true);
  });

  it("resolveTurn emits event_applied in adminTrace", () => {
    const state = createInitialMatchState({
      matchId: "event-match" as never,
      playModeId: "blitz",
      rngSeed: "event-resolve-seed",
      playerAName: "A",
      playerBName: "B",
    });
    state.phase = "decide";
    const { adminTrace, report } = resolveTurn({
      state,
      submittedA: [],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });
    expect(adminTrace.some((e) => e.type === "event_applied")).toBe(true);
    expect(report.publicEvents.length).toBeGreaterThan(0);
  });
});
