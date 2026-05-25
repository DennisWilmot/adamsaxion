import type { EngineEvent, MatchState, PlayerSlot, SubmittedMove } from "@adamsaxion/pricewar-types";
import type { Rng } from "../../rng/seeded";
import type { PipelineContext } from "../../engine/pipeline/context";

export interface ActionHandlerContext {
  state: MatchState;
  slot: PlayerSlot;
  move: SubmittedMove;
  rng: Rng;
  events: EngineEvent[];
  round: number;
  /** Monotonic event counter within the round */
  nextEventT: () => number;
  /** Frozen at start of stepActions — use for cross-player reads (simultaneous resolution). */
  actionBaseline: {
    playersPublic: MatchState["playersPublic"];
    playersPrivate: MatchState["playersPrivate"];
  };
}

export type ActionHandler = (ctx: ActionHandlerContext) => void;

export function stubHandler(ctx: ActionHandlerContext): void {
  ctx.events.push({
    t: ctx.nextEventT(),
    type: "move_resolved",
    player: ctx.slot,
    moveId: ctx.move.moveId,
    deltas: {},
  });
}

export function pipelineHandlerFrom(
  fn: ActionHandler
): (ctx: PipelineContext, slot: PlayerSlot, move: SubmittedMove) => void {
  return (ctx, slot, move) => {
    fn({
      state: ctx.state,
      slot,
      move,
      rng: ctx.rng,
      events: ctx.events,
      round: ctx.round,
      nextEventT: ctx.nextEventT,
      actionBaseline: {
        playersPublic: structuredClone(ctx.state.playersPublic),
        playersPrivate: structuredClone(ctx.state.playersPrivate),
      },
    });
  };
}
