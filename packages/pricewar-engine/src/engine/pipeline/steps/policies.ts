import type { PipelineContext } from "../context";
import { getSim, writeSim, repUnit, setRep, COSTS } from "../../../simulation/player-sim";
import { COFFEE_SHOP_SIM } from "../../../simulation/config";

export function stepPolicies(ctx: PipelineContext): void {
  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const sim = getSim(ctx.state, slot);
    const pub = ctx.state.playersPublic[slot];
    const opp = ctx.state.playersPublic[slot === "A" ? "B" : "A"];

    if (sim.priceMatchRoundsRemaining > 0) {
      pub.currentPrice = opp.currentPrice;
      sim.priceMatchRoundsRemaining -= 1;
      ctx.scratch.publicActions[slot].push(`Matched ${opp.displayName}'s price at ${opp.currentPrice}¢`);
    }

    if (sim.premiumPositioning) {
      const floor = Math.round(((pub.currentPrice + opp.currentPrice) / 2) * 1.5);
      if (pub.currentPrice < floor) pub.currentPrice = floor;
    }

    if (sim.bundleRoundsRemaining > 0) {
      ctx.scratch.revenueMultiplier[slot] *= 1.08;
    }

    if (sim.bulkDiscountRoundsRemaining > 0) {
      ctx.scratch.inputCostMultiplier[slot] *= 0.9;
    }

    if (sim.loyaltyProgramActive) {
      ctx.scratch.demandBoost[slot] += 0.05;
    }

    if (sim.exclusiveSupplierDeal) {
      ctx.scratch.inputCostMultiplier[slot] *= 1.1;
    }

    if (sim.trainingBudgetPerRound > 0 && priv.cash >= sim.trainingBudgetPerRound) {
      priv.cash -= sim.trainingBudgetPerRound;
      sim.avgSkill = Math.min(1, sim.avgSkill + sim.trainingBudgetPerRound * COSTS.trainingSkillPerDollar);
    } else if (sim.trainingBudgetPerRound === 0) {
      sim.avgSkill = Math.max(0.1, sim.avgSkill - 0.01);
    }

    if (sim.rdProjectRoundsRemaining > 0) {
      sim.rdProjectRoundsRemaining -= 1;
      if (sim.rdProjectRoundsRemaining === 0) {
        if (ctx.rng.next() < 0.55) {
          sim.productQuality = Math.min(1, sim.productQuality + 0.1);
          setRep(priv, repUnit(priv.reputation) + 0.03);
        }
      }
    }

    if (sim.momentumBoostRounds > 0) {
      setRep(priv, repUnit(priv.reputation) + 0.02);
      sim.momentumBoostRounds -= 1;
    }

    if (sim.targetedCampaignRounds > 0) {
      ctx.scratch.demandBoost[slot] += 0.12;
      sim.targetedCampaignRounds -= 1;
    }

    writeSim(priv, sim);
  }
}

export function stepPostActionPolicies(ctx: PipelineContext): void {
  for (const slot of ["A", "B"] as const) {
    const sim = getSim(ctx.state, slot);
    const pub = ctx.state.playersPublic[slot];

    if (sim.surgePricingActive && ctx.scratch.demandTotal > COFFEE_SHOP_SIM.baseFootTraffic * 1.1) {
      pub.currentPrice = Math.min(800, Math.round(pub.currentPrice * 1.2));
      sim.surgePricingActive = false;
      writeSim(ctx.state.playersPrivate[slot], sim);
    }
  }
}
