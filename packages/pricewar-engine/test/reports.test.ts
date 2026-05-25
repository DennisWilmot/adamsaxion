import { describe, expect, it } from "vitest";
import {
  createInitialMatchState,
  resolveTurn,
  COFFEE_SHOP_SCENARIO,
  getSim,
  writeSim,
} from "../src";
import { REPORT_TEMPLATES } from "../src/reports/templates";
import { evaluateCondition } from "../src/reports/evaluate";
import { createPipelineContext } from "../src/engine/pipeline/context";
import { createRng } from "../src/rng/seeded";
import { buildRoundReport } from "../src/reports/build";

describe("report templates", () => {
  it("defines at least 25 templates", () => {
    expect(REPORT_TEMPLATES.length).toBeGreaterThanOrEqual(25);
  });

  it("includes public and private audiences", () => {
    const pub = REPORT_TEMPLATES.filter((t) => t.audience === "public");
    const priv = REPORT_TEMPLATES.filter((t) => t.audience === "private");
    expect(pub.length).toBeGreaterThanOrEqual(5);
    expect(priv.length).toBeGreaterThanOrEqual(20);
  });

  it("evaluates overtime condition from sim state", () => {
    const state = createInitialMatchState({
      matchId: "rpt-match" as never,
      playModeId: "blitz",
      rngSeed: "rpt-seed",
      playerAName: "A",
      playerBName: "B",
    });
    const ctx = createPipelineContext({
      state,
      scenario: COFFEE_SHOP_SCENARIO,
      submittedA: [],
      submittedB: [],
      rng: createRng("rpt-seed"),
    });
    const sim = getSim(ctx.state, "A");
    writeSim(ctx.state.playersPrivate.A, { ...sim, overtimeThisRound: true });
    expect(evaluateCondition("overtime", ctx, "A")).toBe(true);
  });

  it("buildRoundReport includes template narrative on resolve", () => {
    const state = createInitialMatchState({
      matchId: "rpt-resolve" as never,
      playModeId: "blitz",
      rngSeed: "report-template-seed",
      playerAName: "Alice",
      playerBName: "Bob",
    });
    state.phase = "decide";
    state.playersPrivate.A.morale = 70;

    const { report } = resolveTurn({
      state,
      submittedA: [
        {
          moveId: "operations.o08",
          input: { enabled: true },
          draftedAt: new Date(0).toISOString(),
        },
      ],
      submittedB: [],
      scenario: COFFEE_SHOP_SCENARIO,
    });

    expect(report.publicSummary).toContain("Round 1 resolved");
    expect(report.publicEvents.length).toBeGreaterThan(0);
    expect(report.privateSummary.A.length).toBeGreaterThan(50);
    expect(
      report.privateSummary.A.includes("Overtime") ||
        report.privateSummary.A.includes("morale") ||
        report.privateSummary.A.includes("Cash")
    ).toBe(true);
  });

  it("chains follow-up on profit_down_customers_up", () => {
    const state = createInitialMatchState({
      matchId: "rpt-chain" as never,
      playModeId: "blitz",
      rngSeed: "chain-seed",
      playerAName: "A",
      playerBName: "B",
    });
    const ctx = createPipelineContext({
      state,
      scenario: COFFEE_SHOP_SCENARIO,
      submittedA: [],
      submittedB: [],
      rng: createRng("chain-seed"),
    });
    ctx.scratch.cashAtRoundStart.A = 500;
    ctx.state.playersPrivate.A.cash = 450;
    ctx.scratch.allocated = { A: 50, B: 30 };

    const report = buildRoundReport(ctx);
    expect(report.privateSummary.A).toContain("gained traffic but profit fell");
  });
});
