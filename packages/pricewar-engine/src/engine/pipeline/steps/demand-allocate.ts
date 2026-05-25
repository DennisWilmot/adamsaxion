import type { PipelineContext } from "../context";
import { COFFEE_SHOP_SIM } from "../../../simulation/config";
import { getSim } from "../../../simulation/player-sim";

function repNorm(reputation: number): number {
  return reputation > 1 ? reputation / 100 : reputation;
}

export function stepDemand(ctx: PipelineContext): void {
  let total = Math.max(10, ctx.scratch.demandTotal);
  total = Math.round(total * (1 + ctx.scratch.streetTrafficBoost));

  for (const slot of ["A", "B"] as const) {
    const sim = getSim(ctx.state, slot);
    const mSpend = sim.marketingBudgetPerRound;
    const mBoost = mSpend > 0 ? Math.min(0.35, mSpend / 400) : 0;
    ctx.scratch.marketingBoost[slot] = mBoost;
    ctx.scratch.demandBoost[slot] += mBoost;

    if (sim.flashSaleActiveRound === ctx.round) {
      ctx.scratch.demandBoost[slot] += 0.25;
    }
  }

  if (ctx.scratch.counterMarketing.A) {
    ctx.scratch.marketingBoost.B *= 0.4;
  }
  if (ctx.scratch.counterMarketing.B) {
    ctx.scratch.marketingBoost.A *= 0.4;
  }

  const avgBoost = (ctx.scratch.demandBoost.A + ctx.scratch.demandBoost.B) / 2;
  ctx.scratch.demandTotal = Math.max(10, Math.round(total * (1 + avgBoost * 0.5)));
}

export function stepAllocate(ctx: PipelineContext): void {
  const total = ctx.scratch.demandTotal;
  const priceA = ctx.state.playersPublic.A.currentPrice;
  const priceB = ctx.state.playersPublic.B.currentPrice;
  const avgPrice = Math.max(1, (priceA + priceB) / 2);
  const elasticity = COFFEE_SHOP_SIM.baseDemandElasticity;

  const attractA = 1 + elasticity * ((priceB - priceA) / avgPrice);
  const attractB = 1 + elasticity * ((priceA - priceB) / avgPrice);

  const repA = repNorm(ctx.state.playersPrivate.A.reputation);
  const repB = repNorm(ctx.state.playersPrivate.B.reputation);
  const repFactorA = 1 + 0.2 * (repA - repB);
  const repFactorB = 1 + 0.2 * (repB - repA);

  let shareA = Math.max(0.05, attractA * repFactorA * (1 + ctx.scratch.demandBoost.A));
  let shareB = Math.max(0.05, attractB * repFactorB * (1 + ctx.scratch.demandBoost.B));
  const sum = shareA + shareB;
  shareA /= sum;
  shareB /= sum;

  let customersA = Math.round(total * shareA);
  let customersB = Math.round(total * shareB);

  const capA = getSim(ctx.state, "A").totalCapacity;
  const capB = getSim(ctx.state, "B").totalCapacity;

  customersA = Math.min(customersA, capA);
  customersB = Math.min(customersB, capB);

  ctx.scratch.allocated = { A: customersA, B: customersB };

  ctx.events.push({
    t: ctx.nextEventT(),
    type: "demand_calculated",
    total,
    allocated: { A: customersA, B: customersB },
  });
}
