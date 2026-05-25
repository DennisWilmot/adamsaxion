import type { PlayerSlot } from "@adamsaxion/pricewar-types";
import type { PipelineContext } from "../context";
import { COFFEE_SHOP_SIM } from "../../../simulation/config";
import { getSim, writeSim, repUnit, setRep, moraleUnit, setMorale, COSTS } from "../../../simulation/player-sim";

function settlePlayer(ctx: PipelineContext, slot: PlayerSlot): void {
  const priv = ctx.state.playersPrivate[slot];
  const sim = getSim(ctx.state, slot);
  const customers = ctx.scratch.allocated[slot];
  const priceCents = ctx.state.playersPublic[slot].currentPrice;
  let revenue = Math.round((customers * priceCents) / 100);
  revenue = Math.round(revenue * ctx.scratch.revenueMultiplier[slot]);

  if (ctx.scratch.bulkOrderBonus > 0) {
    const spare = Math.max(0, sim.totalCapacity - customers);
    if (spare >= 20) {
      revenue += ctx.scratch.bulkOrderBonus;
      ctx.scratch.privateActionNotes[slot].push(
        `Bulk catering order filled — +$${ctx.scratch.bulkOrderBonus}.`
      );
    }
  }

  let wageBill = priv.staffCount * sim.wagePerWorker;
  if (sim.overtimeThisRound) wageBill = Math.round(wageBill * 1.5);

  const overhead =
    (ctx.scenario.balancing.basePerRoundCost ?? COFFEE_SHOP_SIM.basePerRoundOverhead) *
      ctx.scratch.overheadMultiplier +
    ctx.scratch.rentSurcharge;
  const beanUnit = (ctx.scenario.balancing.beanCostPerUnit ?? COFFEE_SHOP_SIM.beanCostPerUnit) *
    (1 + (sim.supplierTier - 2) * 0.08) *
    (sim.localSourcing ? 1.1 : 1) *
    ctx.scratch.inputCostMultiplier[slot];
  const inputCost = Math.round(customers * beanUnit);

  let marketing = sim.marketingBudgetPerRound;
  if (sim.loyaltyProgramActive) marketing += Math.round(customers * 0.2);
  if (sim.insuranceActive) marketing += COSTS.insurancePerRound;

  const interest = Math.round(sim.debt * COFFEE_SHOP_SIM.interestRate);

  priv.cash += revenue - wageBill - overhead - inputCost - marketing - interest;

  const qualityDelta = sim.productQuality - 0.5;
  setRep(priv, repUnit(priv.reputation) + qualityDelta * 0.02);
  if (sim.overtimeThisRound) {
    setMorale(priv, moraleUnit(priv.morale) - 0.03);
  }
  const moraleShock = ctx.scratch.moraleShock[slot] ?? 0;
  if (moraleShock !== 0) {
    setMorale(priv, moraleUnit(priv.morale) + moraleShock);
  }

  sim.reviewScore = Math.max(1, Math.min(5, sim.reviewScore + qualityDelta * 0.1 - (sim.overtimeThisRound ? 0.05 : 0)));

  if (sim.bulkDiscountRoundsRemaining > 0) sim.bulkDiscountRoundsRemaining -= 1;
  if (sim.bundleRoundsRemaining > 0) sim.bundleRoundsRemaining -= 1;

  writeSim(priv, sim);

  ctx.events.push({
    t: ctx.nextEventT(),
    type: "finance_settled",
    player: slot,
    cashAfter: priv.cash,
  });
}

export function stepFinance(ctx: PipelineContext): void {
  settlePlayer(ctx, "A");
  settlePlayer(ctx, "B");
}

export function stepReputation(ctx: PipelineContext): void {
  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const sim = getSim(ctx.state, slot);
    const served = ctx.scratch.allocated[slot];
    const cap = sim.totalCapacity;
    if (cap > 0 && served / cap > 0.95) {
      setMorale(priv, moraleUnit(priv.morale) - 0.02);
    }
    if (served > 0 && served >= cap * 0.7) {
      setRep(priv, repUnit(priv.reputation) + 0.01);
    }
    writeSim(priv, sim);
  }
}
