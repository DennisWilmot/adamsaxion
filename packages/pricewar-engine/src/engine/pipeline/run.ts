import type { PipelineContext } from "./context";
import { stepValidate } from "./steps/validate";
import { stepPolicies, stepPostActionPolicies } from "./steps/policies";
import { stepEvents } from "./steps/events";
import { stepActions } from "./steps/actions";
import { stepCompetitive } from "./steps/competitive";
import { stepPeople, stepProduct } from "./steps/product-people";
import { stepAllocate, stepDemand } from "./steps/demand-allocate";
import { stepFinance, stepReputation } from "./steps/finance-reputation";
import { stepCleanupTransients } from "./steps/cleanup-transients";
import { stepTriggers } from "./steps/triggers";
import { stepReports } from "./steps/reports";

const STEPS: Array<(ctx: PipelineContext) => void> = [
  stepValidate,
  stepPolicies,
  stepEvents,
  stepActions,
  stepCompetitive,
  stepPostActionPolicies,
  stepProduct,
  stepPeople,
  stepDemand,
  stepAllocate,
  stepFinance,
  stepReputation,
  stepCleanupTransients,
  stepTriggers,
  stepReports,
];

export function runPipeline(ctx: PipelineContext): void {
  for (const step of STEPS) {
    step(ctx);
  }
  ctx.state.updatedAt = new Date(0).toISOString();
}
