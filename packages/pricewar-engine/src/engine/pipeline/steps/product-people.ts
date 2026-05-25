import type { PipelineContext } from "../context";
import { getSim, writeSim } from "../../../simulation/player-sim";
import type { DeploymentMode } from "../../../simulation/player-sim";

export function stepProduct(ctx: PipelineContext): void {
  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const sim = getSim(ctx.state, slot);

    const supplierBonus = (sim.supplierTier - 2) * 0.04;
    const menuPenalty = Math.max(0, sim.menuBreadth - sim.avgSkill * 10) * 0.02;
    sim.productQuality = Math.max(
      0.2,
      Math.min(
        1,
        0.45 +
          supplierBonus +
          sim.equipmentLevel * 0.05 -
          menuPenalty +
          (sim.localSourcing ? 0.03 : 0) +
          (DEPLOYMENT_QUALITY[sim.deploymentMode] ?? 0)
      )
    );

    if (sim.exclusiveSupplierDeal) {
      sim.productQuality = Math.min(1, sim.productQuality + 0.08);
    }

    writeSim(priv, sim);
  }
}

const DEPLOYMENT_CAPACITY: Record<DeploymentMode, number> = {
  speed: 1.2,
  quality: 0.85,
  balanced: 1,
  customer: 0.9,
};

const DEPLOYMENT_QUALITY: Record<DeploymentMode, number> = {
  speed: -0.05,
  quality: 0.05,
  balanced: 0,
  customer: 0,
};

export function stepPeople(ctx: PipelineContext): void {
  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const sim = getSim(ctx.state, slot);
    const modeMult = DEPLOYMENT_CAPACITY[sim.deploymentMode] ?? 1;
    let perWorker = sim.capacityPerWorker + (sim.equipmentLevel - 1) * 2;
    let capacity = Math.round(priv.staffCount * perWorker * modeMult);
    if (sim.overtimeThisRound) capacity = Math.round(capacity * 1.3);
    sim.totalCapacity = capacity;
    writeSim(priv, sim);
  }
}
