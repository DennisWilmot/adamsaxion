import type {
  MatchState,
  PlayerSlot,
  SubmittedMove,
  ScenarioConfig,
  EngineEvent,
  RoundReport,
  GameError,
} from "@adamsaxion/pricewar-types";
import { createRng, roundRngSeed } from "../rng/seeded";
import { createPipelineContext } from "./pipeline/context";
import { runPipeline } from "./pipeline/run";
import { validateMoves } from "./validate";
import { ResolveTurnError } from "./errors";
import { normalizeMatchState } from "../state/normalize";

export type { GameError };

export interface ResolveTurnInput {
  state: MatchState;
  submittedA: SubmittedMove[];
  submittedB: SubmittedMove[];
  scenario: ScenarioConfig;
}

export interface ResolveTurnOutput {
  nextState: MatchState;
  /** Full ordered trace — admin/replay only. Never send raw events to clients. */
  adminTrace: EngineEvent[];
  report: RoundReport;
}

export { validateMoves };

export function resolveTurn(input: ResolveTurnInput): ResolveTurnOutput {
  const errA = validateMoves(input.state, "A", input.submittedA, input.scenario);
  if (errA) throw new ResolveTurnError(errA);

  const errB = validateMoves(input.state, "B", input.submittedB, input.scenario);
  if (errB) throw new ResolveTurnError(errB);

  const state = structuredClone(input.state);
  const round = state.market.currentRound;
  const rng = createRng(roundRngSeed(state.matchId, round));
  const ctx = createPipelineContext({
    state,
    scenario: input.scenario,
    submittedA: input.submittedA,
    submittedB: input.submittedB,
    rng,
  });

  runPipeline(ctx);

  return {
    nextState: ctx.state,
    adminTrace: ctx.events,
    report: ctx.report,
  };
}

export { ResolveTurnError } from "./errors";

export type { PlayerSlot, SubmittedMove };
