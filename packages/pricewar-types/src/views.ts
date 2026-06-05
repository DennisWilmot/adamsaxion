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
  /** ISO timestamp when the player's clock started ticking; null if frozen. */
  myClockTickingSince: string | null;
  opponentClockMs: number;
  opponentHasLocked: boolean;
  meHasLocked: boolean;
}

export type { MatchState };
