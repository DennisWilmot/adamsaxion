import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  extractFacts,
  renderTemplateCoach,
} from "../src";

describe("coach", () => {
  it("extracts facts from a completed match state", () => {
    const state = createInitialMatchState({
      matchId: "coach-1" as never,
      playModeId: "blitz",
      rngSeed: "seed",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    state.phase = "completed";
    state.outcome = { kind: "win", winner: "A", reason: "victory_points" };
    state.playersPrivate.A.cash = 5200;
    state.playersPrivate.B.cash = 4100;

    const facts = extractFacts(state, []);
    expect(facts.finalCash.A).toBe(5200);
    expect(facts.outcome.winner).toBe("A");
  });

  it("renders a template coach report", () => {
    const facts = {
      matchId: "coach-1",
      outcome: { winner: "A" as const, reason: "victory_points" },
      finalCash: { A: 5200, B: 4100 },
      turningPoints: [{ round: 3, description: "Demand shifted.", impactScore: 10 }],
      bestMoves: { A: null, B: null },
      worstMoves: { A: null, B: null },
    };
    const report = renderTemplateCoach(facts, "A");
    expect(report.generatedBy).toBe("template");
    expect(report.oneLinerVerdict).toContain("5,200");
  });
});
