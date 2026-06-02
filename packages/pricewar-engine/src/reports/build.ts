import type { RoundReport } from "@adamsaxion/pricewar-types";
import type { PipelineContext } from "../engine/pipeline/context";
import { REPORT_TEMPLATES } from "./templates";
import { collectTemplateLines } from "./evaluate";
import { getSim } from "../simulation/player-sim";

export function buildRoundReport(ctx: PipelineContext): RoundReport {
  const { scratch, round, state } = ctx;
  const pubA = state.playersPublic.A;
  const pubB = state.playersPublic.B;

  const publicLines: string[] = [];
  for (const slot of ["A", "B"] as const) {
    for (const action of scratch.publicActions[slot]) {
      publicLines.push(`${state.playersPublic[slot].displayName}: ${action}`);
    }
  }

  const publicCommentary = collectTemplateLines("public", ctx, "A", REPORT_TEMPLATES, 2);

  const weatherLine =
    scratch.activeEventLabel ??
    (scratch.weatherShift !== 0
      ? "News alert: Customer traffic shifted this round. Check your sales numbers."
      : null);

  const publicSummaryParts = [
    publicCommentary[0] ?? weatherLine,
    publicCommentary[1],
    publicLines.length > 0 ? publicLines.join(" ") : null,
    `${pubA.displayName} served ${scratch.allocated.A} customers at ${pubA.currentPrice}¢. ${pubB.displayName} served ${scratch.allocated.B} at ${pubB.currentPrice}¢.`,
  ].filter(Boolean);

  const privateSummary = { A: "", B: "" };
  for (const slot of ["A", "B"] as const) {
    const priv = state.playersPrivate[slot];
    const sim = getSim(state, slot);
    const cashDelta = priv.cash - scratch.cashAtRoundStart[slot];
    const narrative = collectTemplateLines("private", ctx, slot, REPORT_TEMPLATES, 4);
    const notes = scratch.privateActionNotes[slot].join(" ");

    privateSummary[slot] = [
      `You have $${priv.cash.toLocaleString()} (${cashDelta >= 0 ? "+" : "−"}$${Math.abs(cashDelta)} this round). You served ${scratch.allocated[slot]} customers. Guest rating: ${sim.reviewScore.toFixed(1)} stars.`,
      notes,
      narrative.join(" "),
    ]
      .filter(Boolean)
      .join(" ");
  }

  const publicEvents = scratch.drawnPublicEvents.map((e) => ({
    description: e.description,
    impact: e.impact,
  }));
  if (publicEvents.length === 0 && weatherLine) {
    publicEvents.push({
      description: weatherLine,
      impact: scratch.weatherShift >= 0 ? "positive" : "negative",
    });
  }

  return {
    round,
    publicSummary: `Round ${round} is in the books. ${publicSummaryParts.join(" ")}`,
    publicEvents,
    privateSummary,
    deltas: {
      A: {
        cashDelta: state.playersPrivate.A.cash - scratch.cashAtRoundStart.A,
        demandSatisfied: scratch.allocated.A,
        reputationDelta: 0,
        moraleDelta: 0,
      },
      B: {
        cashDelta: state.playersPrivate.B.cash - scratch.cashAtRoundStart.B,
        demandSatisfied: scratch.allocated.B,
        reputationDelta: 0,
        moraleDelta: 0,
      },
    },
  };
}
