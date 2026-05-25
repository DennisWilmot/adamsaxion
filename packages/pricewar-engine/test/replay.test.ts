import { describe, expect, it } from "vitest";
import type { MoveId, SubmittedMove } from "@adamsaxion/pricewar-types";
import {
  COFFEE_SHOP_SCENARIO,
  createInitialMatchState,
  replayMatchFromSubmissions,
  diffMatchStates,
  resolveTurn,
} from "../src";

describe("replay", () => {
  it("replays a full match identically to sequential resolveTurn", () => {
    const initial = createInitialMatchState({
      matchId: "test-match" as never,
      playModeId: "blitz",
      rngSeed: "seed-replay-1",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    initial.phase = "decide";

    const submissions: Array<{
      round: number;
      slot: "A" | "B";
      moves: SubmittedMove[];
    }> = [];

    let sequential = structuredClone(initial);

    for (let round = 1; round <= 8; round++) {
      sequential.market.currentRound = round;
      const movesA: SubmittedMove[] = [
        {
          moveId: "sales.set_price" as MoveId,
          input: { newPrice: 300 + round * 10 },
          draftedAt: new Date().toISOString(),
        },
      ];
      const movesB: SubmittedMove[] = [
        {
          moveId: "marketing.run_ad_campaign" as MoveId,
          input: { amount: 100 },
          draftedAt: new Date().toISOString(),
        },
      ];

      submissions.push({ round, slot: "A", moves: movesA });
      submissions.push({ round, slot: "B", moves: movesB });

      const { nextState } = resolveTurn({
        state: sequential,
        submittedA: movesA,
        submittedB: movesB,
        scenario: COFFEE_SHOP_SCENARIO,
      });
      sequential = nextState;
    }

    const { finalState } = replayMatchFromSubmissions({
      initialState: initial,
      submissions,
      scenario: COFFEE_SHOP_SCENARIO,
    });

    const diffs = diffMatchStates(sequential, finalState);
    expect(diffs).toEqual([]);
    expect(finalState.phase).toBe("completed");
  });
});
