import type { PlayerSlot } from "./match";

export type EngineEvent =
  | { t: number; type: "round_started"; round: number }
  | {
      t: number;
      type: "move_submitted";
      player: PlayerSlot;
      moves: ReadonlyArray<{ moveId: string; input: unknown }>;
    }
  | { t: number; type: "policy_applied"; player: PlayerSlot; policyId: string }
  | { t: number; type: "event_applied"; eventId: string; severity: string }
  | {
      t: number;
      type: "move_resolved";
      player: PlayerSlot;
      moveId: string;
      deltas: Record<string, number>;
    }
  | {
      t: number;
      type: "demand_calculated";
      total: number;
      allocated: Record<PlayerSlot, number>;
    }
  | { t: number; type: "finance_settled"; player: PlayerSlot; cashAfter: number }
  | { t: number; type: "trigger_fired"; kind: string; payload: unknown }
  | { t: number; type: "round_resolved"; round: number };
