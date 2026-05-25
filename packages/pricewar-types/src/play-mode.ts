export type ClockModel =
  | { kind: "chess"; perPlayerMs: number; incrementMs?: number }
  | { kind: "wallclock"; perRoundMs: number; decideLockMs: number };

export interface PlayModeConfig {
  id: string;
  label: string;
  shortLabel: string;
  clock: ClockModel | null;
  affectsRating: boolean;
  availableToTiers: readonly ("free" | "paid")[];
  inactivityForfeitAfterRounds: number;
  inactivityForfeitOnZeroMoves: number;
  matchStartGraceMs: number;
  reducedKOnTimeoutForfeit: boolean;
  scriptedOpponent?: boolean;
}
