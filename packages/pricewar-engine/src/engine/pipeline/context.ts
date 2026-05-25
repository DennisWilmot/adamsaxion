import type {
  EngineEvent,
  MatchState,
  RoundReport,
  ScenarioConfig,
  SubmittedMove,
  PlayerSlot,
} from "@adamsaxion/pricewar-types";
import type { Rng } from "../../rng/seeded";

export interface PipelineScratch {
  demandTotal: number;
  allocated: { A: number; B: number };
  weatherShift: number;
  footTrafficMultiplier: number;
  overheadMultiplier: number;
  rentSurcharge: number;
  bulkOrderBonus: number;
  moraleShock: { A: number; B: number };
  activeEventLabel: string | null;
  drawnPublicEvents: Array<{ description: string; impact: "neutral" | "positive" | "negative" }>;
  moraleAtRoundStart: { A: number; B: number };
  reputationAtRoundStart: { A: number; B: number };
  cashAtRoundStart: { A: number; B: number };
  demandBoost: { A: number; B: number };
  marketingBoost: { A: number; B: number };
  counterMarketing: { A: boolean; B: boolean };
  poachAttempt: { A: boolean; B: boolean };
  publicActions: { A: string[]; B: string[] };
  privateActionNotes: { A: string[]; B: string[] };
  inputCostMultiplier: { A: number; B: number };
  revenueMultiplier: { A: number; B: number };
  streetTrafficBoost: number;
}

export interface PipelineContext {
  state: MatchState;
  scenario: ScenarioConfig;
  submittedA: SubmittedMove[];
  submittedB: SubmittedMove[];
  rng: Rng;
  events: EngineEvent[];
  round: number;
  report: RoundReport;
  scratch: PipelineScratch;
  _eventT: number;
  nextEventT: () => number;
}

function emptyScratch(state: MatchState): PipelineScratch {
  return {
    demandTotal: 0,
    allocated: { A: 0, B: 0 },
    weatherShift: 0,
    footTrafficMultiplier: 1,
    overheadMultiplier: 1,
    rentSurcharge: 0,
    bulkOrderBonus: 0,
    moraleShock: { A: 0, B: 0 },
    activeEventLabel: null,
    drawnPublicEvents: [],
    cashAtRoundStart: {
      A: state.playersPrivate.A.cash,
      B: state.playersPrivate.B.cash,
    },
    moraleAtRoundStart: {
      A: state.playersPrivate.A.morale,
      B: state.playersPrivate.B.morale,
    },
    reputationAtRoundStart: {
      A: state.playersPrivate.A.reputation,
      B: state.playersPrivate.B.reputation,
    },
    demandBoost: { A: 0, B: 0 },
    marketingBoost: { A: 0, B: 0 },
    counterMarketing: { A: false, B: false },
    poachAttempt: { A: false, B: false },
    publicActions: { A: [], B: [] },
    privateActionNotes: { A: [], B: [] },
    inputCostMultiplier: { A: 1, B: 1 },
    revenueMultiplier: { A: 1, B: 1 },
    streetTrafficBoost: 0,
  };
}

export function createPipelineContext(args: {
  state: MatchState;
  scenario: ScenarioConfig;
  submittedA: SubmittedMove[];
  submittedB: SubmittedMove[];
  rng: Rng;
}): PipelineContext {
  let t = 0;
  const round = args.state.market.currentRound;
  return {
    ...args,
    events: [],
    round,
    report: {
      round,
      publicSummary: "",
      publicEvents: [],
      privateSummary: { A: "", B: "" },
      deltas: {
        A: { cashDelta: 0, demandSatisfied: 0, reputationDelta: 0, moraleDelta: 0 },
        B: { cashDelta: 0, demandSatisfied: 0, reputationDelta: 0, moraleDelta: 0 },
      },
    },
    scratch: emptyScratch(args.state),
    _eventT: 0,
    nextEventT: () => t++,
  };
}
