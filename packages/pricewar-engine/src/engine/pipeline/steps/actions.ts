import type { MatchState, PlayerSlot } from "@adamsaxion/pricewar-types";
import type { PipelineContext } from "../context";
import { bindScratch } from "../../../actions/handlers/scratch-access";
import { resolveActionHandler } from "../../../actions/handlers/registry";

type ActionBaseline = {
  playersPublic: MatchState["playersPublic"];
  playersPrivate: MatchState["playersPrivate"];
};

function snapshotActionBaseline(state: MatchState): ActionBaseline {
  return {
    playersPublic: structuredClone(state.playersPublic),
    playersPrivate: structuredClone(state.playersPrivate),
  };
}

function applySlotMoves(
  ctx: PipelineContext,
  slot: PlayerSlot,
  moves: typeof ctx.submittedA,
  baseline: ActionBaseline
): void {
  for (const move of moves) {
    const handler = resolveActionHandler(move.moveId, ctx.scenario);
    if (!handler) {
      throw new Error(`UNIMPLEMENTED_MOVE:${move.moveId}`);
    }
    handler({
      state: ctx.state,
      slot,
      move,
      rng: ctx.rng,
      events: ctx.events,
      round: ctx.round,
      nextEventT: ctx.nextEventT,
      actionBaseline: baseline,
    });
  }
}

export function stepActions(ctx: PipelineContext): void {
  bindScratch(ctx.scratch);
  const baseline = snapshotActionBaseline(ctx.state);
  applySlotMoves(ctx, "A", ctx.submittedA, baseline);
  applySlotMoves(ctx, "B", ctx.submittedB, baseline);
}
