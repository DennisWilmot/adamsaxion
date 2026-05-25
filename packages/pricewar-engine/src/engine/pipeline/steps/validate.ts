import type { PipelineContext } from "../context";
import { validateMoves } from "../../validate";
import { ResolveTurnError } from "../../errors";

export function stepValidate(ctx: PipelineContext): void {
  for (const [slot, moves] of [
    ["A", ctx.submittedA],
    ["B", ctx.submittedB],
  ] as const) {
    const err = validateMoves(ctx.state, slot, moves, ctx.scenario);
    if (err) throw new ResolveTurnError(err);
  }
  ctx.events.push({ t: ctx.nextEventT(), type: "round_started", round: ctx.round });
  for (const [slot, moves] of [
    ["A", ctx.submittedA],
    ["B", ctx.submittedB],
  ] as const) {
    ctx.events.push({
      t: ctx.nextEventT(),
      type: "move_submitted",
      player: slot,
      moves: moves.map((m) => ({ moveId: m.moveId, input: m.input })),
    });
  }
}
