import type {
  EngineEvent,
  MatchState,
  PlayerSlot,
  ScenarioConfig,
  SubmittedMove,
} from "@adamsaxion/pricewar-types";
import { resolveTurn } from "../engine/resolve-turn";

export function replayMatchFromSubmissions(args: {
  initialState: MatchState;
  submissions: Array<{ round: number; slot: PlayerSlot; moves: SubmittedMove[] }>;
  scenario: ScenarioConfig;
}): { finalState: MatchState; events: EngineEvent[] } {
  let state = structuredClone(args.initialState);
  state.phase = "decide";
  state.outcome = { kind: "in_progress" };
  state.market.currentRound = 1;

  const allEvents: EngineEvent[] = [];

  for (let round = 1; round <= args.scenario.totalRounds; round++) {
    state.market.currentRound = round;
    const subA =
      args.submissions.find((s) => s.round === round && s.slot === "A")?.moves ?? [];
    const subB =
      args.submissions.find((s) => s.round === round && s.slot === "B")?.moves ?? [];

    const { nextState, events } = resolveTurn({
      state,
      submittedA: subA,
      submittedB: subB,
      scenario: args.scenario,
    });

    state = nextState;
    allEvents.push(...events);

    if (state.phase === "completed") break;
  }

  return { finalState: state, events: allEvents };
}

export function diffMatchStates(stored: MatchState, replayed: MatchState): string[] {
  const diffs: string[] = [];

  if (stored.phase !== replayed.phase) {
    diffs.push(`phase: ${stored.phase} → ${replayed.phase}`);
  }
  if (stored.outcome.kind !== replayed.outcome.kind) {
    diffs.push(`outcome.kind: ${stored.outcome.kind} → ${replayed.outcome.kind}`);
  }
  if (
    stored.outcome.kind === "win" &&
    replayed.outcome.kind === "win" &&
    stored.outcome.winner !== replayed.outcome.winner
  ) {
    diffs.push(`outcome.winner: ${stored.outcome.winner} → ${replayed.outcome.winner}`);
  }

  for (const slot of ["A", "B"] as const) {
    const cashStored = stored.playersPrivate[slot].cash;
    const cashReplayed = replayed.playersPrivate[slot].cash;
    if (cashStored !== cashReplayed) {
      diffs.push(`playersPrivate.${slot}.cash: ${cashStored} → ${cashReplayed}`);
    }
  }

  return diffs;
}
