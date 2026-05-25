import type { PipelineContext } from "../context";
import { buildRoundReport } from "../../../reports/build";

export function stepReports(ctx: PipelineContext): void {
  ctx.report = buildRoundReport(ctx);
}
