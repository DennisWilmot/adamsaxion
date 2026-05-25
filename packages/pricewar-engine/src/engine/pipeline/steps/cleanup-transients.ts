import type { MatchState } from "@adamsaxion/pricewar-types";
import type { PipelineContext } from "../context";

const TRANSIENT_PRIVATE_KEYS = ["overtimeThisRound"] as const;

export function clearTransientPlayerFlags(state: MatchState): void {
  for (const slot of ["A", "B"] as const) {
    const priv = state.playersPrivate[slot] as unknown as Record<string, unknown>;
    for (const key of TRANSIENT_PRIVATE_KEYS) {
      delete priv[key];
    }
  }
}

/** Clears one-round flags after finance has consumed them. */
export function stepCleanupTransients(ctx: PipelineContext): void {
  clearTransientPlayerFlags(ctx.state);
}
