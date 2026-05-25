import type { ScenarioId } from "./scenario";

export type MatchId = string & { readonly __brand: "MatchId" };
export type PlayerSlot = "A" | "B";

export type MatchPhase =
  | "waiting_for_opponent"
  | "briefing"
  | "decide"
  | "resolving"
  | "report"
  | "completed";

export type MatchOutcome =
  | { kind: "in_progress" }
  | {
      kind: "win";
      winner: PlayerSlot;
      reason:
        | "victory_points"
        | "bankruptcy"
        | "forfeit_on_timeout"
        | "forfeit_on_abandonment";
    }
  | { kind: "draw" };

export interface PlayerPublicState {
  slot: PlayerSlot;
  displayName: string;
  currentPrice: number;
  brandTier: number;
  isBot: boolean;
}

export interface PlayerPrivateState {
  cash: number;
  inventory: number;
  staffCount: number;
  reputation: number;
  morale: number;
  activePolicies: Array<{ moveId: string; expiresAtRound: number }>;
  activeConditions: Array<{ kind: string; payload: unknown }>;
}

export interface PublicMarketState {
  currentRound: number;
  totalRounds: number;
  marketDemandIndex: number;
  weatherIndex: number;
  eventLog: Array<{
    round: number;
    description: string;
    severity: "info" | "warning" | "critical";
  }>;
}

export interface ClockState {
  remainingMs: number;
  tickingSince: string | null;
}

export interface MatchTimerMeta {
  clockTimeoutCount: Record<PlayerSlot, number>;
  zeroMoveSubmissionCount: Record<PlayerSlot, number>;
  roundDecideStartedAt: string | null;
  abandonmentGraceEndsAt: Record<PlayerSlot, string | null>;
  lobbyOpenedAt: string | null;
  playerConnectedAt: Record<PlayerSlot, string | null>;
}

export interface MatchState {
  matchId: MatchId;
  scenarioId: ScenarioId;
  scenarioVersion: string;
  engineVersion: string;
  playModeId: string;
  rngSeed: string;
  phase: MatchPhase;
  outcome: MatchOutcome;
  market: PublicMarketState;
  playersPublic: Record<PlayerSlot, PlayerPublicState>;
  playersPrivate: Record<PlayerSlot, PlayerPrivateState>;
  clocks: Record<PlayerSlot, ClockState>;
  timerMeta?: MatchTimerMeta;
  createdAt: string;
  updatedAt: string;
}
