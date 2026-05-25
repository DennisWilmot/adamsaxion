import type { PipelineContext } from "../context";
import { COFFEE_SHOP_SIM } from "../../../simulation/config";
import { drawCoffeeShopEvent } from "../../../simulation/events";
import { getSim } from "../../../simulation/player-sim";

function applyInsuranceToTraffic(ctx: PipelineContext, baseFactor: number): number {
  let combined = 1;
  for (const slot of ["A", "B"] as const) {
    let factor = baseFactor;
    if (getSim(ctx.state, slot).insuranceActive && factor < 1) {
      factor = 1 - (1 - factor) * 0.5;
    }
    combined *= factor;
  }
  return combined;
}

function applyInsuranceToInputCost(ctx: PipelineContext, baseFactor: number): number {
  let out = baseFactor;
  const anyInsured = ["A", "B"].some((s) => getSim(ctx.state, s as "A" | "B").insuranceActive);
  if (anyInsured && baseFactor > 1) {
    out = 1 + (baseFactor - 1) * 0.5;
  }
  return out;
}

export function stepEvents(ctx: PipelineContext): void {
  const base = ctx.scenario.balancing.marketTotalDemandBase ?? COFFEE_SHOP_SIM.baseFootTraffic;
  ctx.scratch.demandTotal = base;
  ctx.scratch.footTrafficMultiplier = 1;

  const event = drawCoffeeShopEvent(ctx.rng);
  event.apply(ctx);

  ctx.scratch.drawnPublicEvents.push({
    description: event.description,
    impact: event.impact,
  });

  ctx.events.push({
    t: ctx.nextEventT(),
    type: "event_applied",
    eventId: event.id,
    severity: event.impact === "positive" ? "positive" : event.impact === "negative" ? "negative" : "neutral",
  });

  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const sim = getSim(ctx.state, slot);
    if (event.id === "event.health_inspection") {
      if (sim.productQuality >= 0.6) {
        ctx.scratch.privateActionNotes[slot].push("Health inspection boost — quality held up.");
      } else if (sim.productQuality < 0.4) {
        let fine = 100;
        if (sim.insuranceActive) fine = Math.round(fine * 0.5);
        priv.cash = Math.max(0, priv.cash - fine);
        ctx.scratch.privateActionNotes[slot].push("Health inspection fine — quality was below standard.");
      }
    }
  }

  if (ctx.scratch.footTrafficMultiplier !== 1) {
    ctx.scratch.footTrafficMultiplier = applyInsuranceToTraffic(ctx, ctx.scratch.footTrafficMultiplier);
  }
  for (const slot of ["A", "B"] as const) {
    if (ctx.scratch.inputCostMultiplier[slot] > 1) {
      ctx.scratch.inputCostMultiplier[slot] = applyInsuranceToInputCost(
        ctx,
        ctx.scratch.inputCostMultiplier[slot]
      );
    }
  }

  const scaled = Math.round(base * ctx.scratch.footTrafficMultiplier);
  const jitter = Math.round((ctx.rng.next() - 0.5) * 8);
  ctx.scratch.demandTotal = Math.max(10, scaled + jitter);
  ctx.scratch.weatherShift = scaled - base;

  if (!ctx.scratch.activeEventLabel) {
    ctx.scratch.activeEventLabel = event.label;
  }
}
