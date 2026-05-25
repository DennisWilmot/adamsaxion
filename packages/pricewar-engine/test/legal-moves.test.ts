import { describe, expect, it } from "vitest";
import { evaluateLegalMoves } from "../src/engine/legal-moves";
import { COFFEE_SHOP_SCENARIO, createInitialMatchState } from "../src/scenarios/coffee-shop";

describe("evaluateLegalMoves", () => {
  it("blocks firing when only one staff member", () => {
    const state = createInitialMatchState({
      matchId: "m1" as never,
      scenarioId: "coffee-shop",
      playModeId: "free_blitz",
      playerA: { userId: "a", displayName: "A" },
      playerB: { userId: "b", displayName: "B" },
    });
    state.playersPrivate.A.staffCount = 1;

    const statuses = evaluateLegalMoves(state, "A", [], COFFEE_SHOP_SCENARIO);
    const fire = statuses.find((s) => s.id === "hr.h02");
    expect(fire?.available).toBe(false);
    expect(fire?.reason).toBeTruthy();
  });

  it("allows drafted moves even when hand is full for other cards", () => {
    const state = createInitialMatchState({
      matchId: "m2" as never,
      scenarioId: "coffee-shop",
      playModeId: "free_blitz",
      playerA: { userId: "a", displayName: "A" },
      playerB: { userId: "b", displayName: "B" },
    });
    const draft = [
      { moveId: "sales.s01" as const, input: { newPrice: 350 }, draftedAt: "" },
      { moveId: "sales.s02" as const, input: {}, draftedAt: "" },
      { moveId: "sales.s03" as const, input: {}, draftedAt: "" },
    ];
    const statuses = evaluateLegalMoves(state, "A", draft, COFFEE_SHOP_SCENARIO);
    expect(statuses.find((s) => s.id === "sales.s01")?.available).toBe(true);
    expect(statuses.find((s) => s.id === "sales.s04")?.available).toBe(false);
  });
});
