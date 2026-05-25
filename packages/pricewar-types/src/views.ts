import type {
  MatchState,
  PlayerPublicState,
  PlayerPrivateState,
  PublicMarketState,
  PlayerSlot,
  MatchOutcome,
  MatchPhase,
} from "./match";

export interface PlayerView {
  matchId: string;
  scenarioId: string;
  playModeId: string;
  phase: MatchPhase;
  outcome: MatchOutcome;
  market: PublicMarketState;
  me: PlayerPublicState & PlayerPrivateState & { slot: PlayerSlot };
  opponent: PlayerPublicState;
  myClockMs: number;
  opponentClockMs: number;
  opponentHasLocked: boolean;
}

export type { MatchState };
