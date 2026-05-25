import type { PlayerSlot } from "@adamsaxion/pricewar-types";
import type { PipelineContext } from "../engine/pipeline/context";
import { getSim, moraleUnit } from "../simulation/player-sim";
import type { ReportConditionKind, ReportTemplate } from "./templates";

export type ReportVars = Record<string, string | number>;

function moraleScore(morale: number): number {
  return morale > 1 ? morale : Math.round(morale * 100);
}

export function buildReportVars(ctx: PipelineContext, slot: PlayerSlot): ReportVars {
  const priv = ctx.state.playersPrivate[slot];
  const sim = getSim(ctx.state, slot);
  const cashDelta = priv.cash - ctx.scratch.cashAtRoundStart[slot];
  const oppSlot = slot === "A" ? "B" : "A";

  return {
    round: ctx.round,
    name: ctx.state.playersPublic[slot].displayName,
    opponent: ctx.state.playersPublic[oppSlot].displayName,
    cash: priv.cash,
    cashDelta,
    cashDeltaAbs: Math.abs(cashDelta),
    cashDeltaSign: cashDelta >= 0 ? "+" : "−",
    customers: ctx.scratch.allocated[slot],
    oppCustomers: ctx.scratch.allocated[oppSlot],
    review: sim.reviewScore.toFixed(1),
  };
}

export function evaluateCondition(
  kind: ReportConditionKind,
  ctx: PipelineContext,
  slot: PlayerSlot
): boolean {
  const { scratch, state, round } = ctx;
  const priv = state.playersPrivate[slot];
  const sim = getSim(state, slot);
  const oppSlot = slot === "A" ? "B" : "A";
  const delta = priv.cash - scratch.cashAtRoundStart[slot];
  const customers = scratch.allocated[slot];
  const oppCustomers = scratch.allocated[oppSlot];
  const moraleStart = moraleScore(scratch.moraleAtRoundStart[slot]);
  const moraleNow = moraleScore(priv.morale);

  switch (kind) {
    case "always":
      return true;
    case "profit_up":
      return delta > 0;
    case "profit_down":
      return delta < 0;
    case "profit_up_customers_up":
      return delta > 0 && customers >= oppCustomers && customers > 35;
    case "profit_down_customers_down":
      return delta < 0 && customers < oppCustomers;
    case "profit_down_customers_up":
      return delta < 0 && customers > oppCustomers;
    case "customers_up":
      return customers > 40 && scratch.allocated[oppSlot] > 40;
    case "customers_down":
      return customers < 25;
    case "customers_won_vs_opponent":
      return customers > oppCustomers;
    case "customers_lost_vs_opponent":
      return customers < oppCustomers;
    case "overtime":
      return sim.overtimeThisRound;
    case "flash_sale":
      return sim.flashSaleActiveRound === round;
    case "bankruptcy_risk":
      return priv.cash < 50;
    case "supply_shock":
      return scratch.inputCostMultiplier[slot] > 1.2;
    case "traffic_surge":
      return scratch.footTrafficMultiplier > 1.2;
    case "traffic_drop":
      return scratch.footTrafficMultiplier < 0.85;
    case "morale_low":
      return moraleNow < 40;
    case "morale_drop":
      return moraleNow < moraleStart - 5;
    case "review_high":
      return sim.reviewScore >= 4.2;
    case "review_low":
      return sim.reviewScore <= 3.5;
    case "capacity_capped":
      return sim.totalCapacity > 0 && customers >= sim.totalCapacity * 0.92;
    case "debt_pressure":
      return sim.debt >= 100;
    case "loyalty_active":
      return sim.loyaltyProgramActive && delta >= 0;
    case "training_active":
      return sim.trainingBudgetPerRound >= 10;
    case "rd_active":
      return sim.rdProjectRoundsRemaining > 0;
    case "premium_positioning":
      return sim.premiumPositioning;
    case "marketing_spend":
      return sim.marketingBudgetPerRound >= 40;
    case "insurance_active":
      return sim.insuranceActive;
    case "poach_related": {
      const notes = scratch.privateActionNotes[slot].join(" ").toLowerCase();
      return (
        scratch.poachAttempt[slot] ||
        notes.includes("poach") ||
        notes.includes("staff conflict")
      );
    }
    case "event_negative":
      return scratch.drawnPublicEvents.some((e) => e.impact === "negative");
    case "event_positive":
      return scratch.drawnPublicEvents.some((e) => e.impact === "positive");
    default:
      return false;
  }
}

export function evaluateTemplate(
  t: ReportTemplate,
  ctx: PipelineContext,
  slot: PlayerSlot
): boolean {
  if (!t.when) return true;
  if (t.when.slot && t.when.slot !== slot) return false;
  return evaluateCondition(t.when.kind, ctx, slot);
}

export function interpolateReport(text: string, vars: ReportVars): string {
  return text.replace(/\$\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function collectTemplateLines(
  audience: "public" | "private",
  ctx: PipelineContext,
  slot: PlayerSlot,
  templates: ReportTemplate[],
  maxLines: number
): string[] {
  const lines: string[] = [];
  const vars = buildReportVars(ctx, slot);

  for (const t of templates) {
    if (t.audience !== audience) continue;
    if (!evaluateTemplate(t, ctx, slot)) continue;
    lines.push(interpolateReport(t.body, vars));
    if (t.followUp) {
      for (const fu of t.followUp) {
        if (evaluateTemplate(fu, ctx, slot)) {
          lines.push(interpolateReport(fu.body, vars));
        }
      }
    }
    if (lines.length >= maxLines) break;
  }

  return lines;
}
