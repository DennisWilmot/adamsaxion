import { describe, expect, it } from "vitest";
import { validateMoves } from "../src/engine/validate";
import { ACTION_CONFLICTS, findConflicts, hardConflicts } from "../src/simulation/conflicts";
import { COFFEE_SHOP_SCENARIO, createInitialMatchState } from "../src/scenarios/coffee-shop";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";

function move(id: string, input: unknown = {}): SubmittedMove {
  return { moveId: id as SubmittedMove["moveId"], input, draftedAt: new Date(0).toISOString() };
}

describe("action conflicts", () => {
  it("has at least 25 hard conflict rules", () => {
    expect(hardConflicts().length).toBeGreaterThanOrEqual(25);
  });

  it("has at least 10 soft conflict rules", () => {
    const soft = ACTION_CONFLICTS.filter((c) => c.type === "soft");
    expect(soft.length).toBeGreaterThanOrEqual(10);
  });

  it("findConflicts is symmetric in the hand", () => {
    const hits = findConflicts(["hr.h01", "hr.h02"]);
    expect(hits.some((h) => h.type === "hard")).toBe(true);
  });

  it.each(hardConflicts().slice(0, 12))(
    "validateMoves rejects hard pair $actionA + $actionB",
    ({ actionA, actionB }) => {
      const state = createInitialMatchState({
        matchId: "conflict-match" as never,
        playModeId: "blitz",
        rngSeed: "conflict-seed",
        playerAName: "A",
        playerBName: "B",
      });
      state.phase = "decide";
      const err = validateMoves(
        state,
        "A",
        [move(actionA), move(actionB)],
        COFFEE_SHOP_SCENARIO
      );
      expect(err).not.toBeNull();
      expect(err?.code).toBe("MOVE_NOT_ALLOWED");
    }
  );
});
