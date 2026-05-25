import type { Domain } from "./domain";
import type { Visibility } from "./visibility";
import type { ScenarioId } from "./scenario";

export type MoveId = string & { readonly __brand: "MoveId" };

export type MoveInputSpec =
  | { kind: "none" }
  | { kind: "slider"; min: number; max: number; step: number; unit?: string; default?: number }
  | { kind: "stepper"; min: number; max: number; step: number; default?: number }
  | { kind: "singleChoice"; options: { id: string; label: string; hint?: string }[] }
  | { kind: "toggle"; default?: boolean }
  | { kind: "amount"; min: number; max: number; currency?: string }
  | { kind: "target"; targets: { id: string; label: string }[] }
  | { kind: "mode"; modes: { id: string; label: string; description?: string }[] };

export type MoveKind = "oneShot" | "persistentPolicy" | "conditionalPolicy";

export type MoveTag =
  | "public"
  | "private"
  | "cost"
  | "locked"
  | "conditional"
  | "policy"
  | "oneShot";

export interface MoveDefinition {
  id: MoveId;
  domain: Domain;
  scenarios: ScenarioId[];
  name: string;
  description: string;
  detailedDescription?: string;
  kind: MoveKind;
  input: MoveInputSpec;
  visibility: Visibility;
  durationRounds?: number;
  timing: "preEvents" | "postEvents";
  prerequisites?: MoveId[];
  conflictsWith?: MoveId[];
  warnings?: string[];
  tags?: MoveTag[];
  modifies: readonly string[];
}

export interface SubmittedMove {
  moveId: MoveId;
  input: unknown;
  draftedAt: string;
}
