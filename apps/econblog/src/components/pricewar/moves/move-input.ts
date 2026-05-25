import type { MoveDefinition, MoveId } from "@adamsaxion/pricewar-types";
import { estimateActionCost } from "@adamsaxion/pricewar-engine";

export function defaultMoveInput(
  move: MoveDefinition,
  currentPrice?: number
): Record<string, unknown> {
  const spec = move.input;
  switch (spec.kind) {
    case "slider":
      return { newPrice: currentPrice ?? spec.default ?? spec.min };
    case "amount":
      return { amount: spec.min };
    case "stepper":
      return { units: spec.default ?? spec.min };
    case "toggle":
      return { enabled: spec.default ?? true };
    case "singleChoice":
      return { choiceId: spec.options[0]?.id ?? "" };
    case "mode":
      return { modeId: spec.modes[0]?.id ?? "" };
    default:
      return {};
  }
}

export function estimateMoveCost(
  moveId: MoveId,
  input: unknown,
  context?: { wagePerWorker?: number; staffCount?: number; equipmentLevel?: number }
): number {
  return estimateActionCost(moveId, input, context ?? {});
}

export function formatMoveInputSummary(
  move: MoveDefinition,
  input: unknown
): string {
  const payload = input as Record<string, number | boolean | string | undefined>;
  const spec = move.input;

  switch (spec.kind) {
    case "slider":
      return `${payload.newPrice ?? spec.min}${spec.unit ?? "¢"}`;
    case "amount":
      return `${spec.currency ?? "$"}${(payload.amount ?? spec.min).toLocaleString()}`;
    case "stepper":
      return `${payload.units ?? spec.min} units`;
    case "toggle":
      return payload.enabled !== false ? "Enabled this round" : "Disabled";
    case "singleChoice": {
      const opt = spec.options.find((o) => o.id === (payload.choice ?? payload.choiceId));
      return opt?.label ?? String(payload.choice ?? payload.choiceId ?? "");
    }
    case "mode": {
      const mode = spec.modes.find((m) => m.id === payload.modeId);
      return mode?.label ?? String(payload.modeId ?? "");
    }
    default:
      return "";
  }
}

export function moveEffectHint(
  move: MoveDefinition,
  input: unknown,
  context?: { opponentPrice?: number; currentPrice?: number }
): string | null {
  const payload = input as Record<string, number | undefined>;
  const opp = context?.opponentPrice;
  const mine = context?.currentPrice;

  if (move.id === "sales.s01" && typeof payload.newPrice === "number") {
    const v = payload.newPrice;
    if (v > 500) return "premium · lower volume";
    if (v < 400) return "value · higher volume";
    if (opp != null) {
      return v > opp ? "above rival" : v < opp ? "below rival" : "matching rival";
    }
    return "balanced";
  }

  if (move.id === "sales.s04") {
    return "40% price cut · traffic boost this round only";
  }

  if (move.id === "procurement.p03" && typeof payload.units === "number") {
    return `+2 buffer · $${estimateMoveCost(move.id, input).toLocaleString()} cost`;
  }

  if (move.input.kind === "amount" && typeof payload.amount === "number") {
    return `$${payload.amount.toLocaleString()} spend`;
  }

  if (move.input.kind === "slider" && typeof payload.newPrice === "number" && opp != null) {
    const v = payload.newPrice;
    return `You're ${v > opp ? "above" : v < opp ? "below" : "matching"} ${opp}¢`;
  }

  if (mine != null && opp != null) {
    return `Rival at ${opp}¢ · you at ${mine}¢`;
  }

  return null;
}

export function moveInputHint(
  move: MoveDefinition,
  input: unknown,
  context?: { opponentPrice?: number; cash?: number; wagePerWorker?: number; staffCount?: number; equipmentLevel?: number }
): string | null {
  const cost = estimateMoveCost(move.id, input, context);

  if (context?.cash != null && cost > context.cash) {
    return "Not enough cash for this spend.";
  }

  if (move.id === "sales.s04") {
    return "Temporary cut — reverts next round.";
  }

  if (move.id === "procurement.p03") {
    return `$${cost.toLocaleString()} now. Lowers stockout risk.`;
  }

  if (move.input.kind === "toggle") {
    return "Applies for this round only.";
  }

  return move.description;
}

export function getSliderConfig(move: MoveDefinition) {
  if (move.input.kind !== "slider") return null;
  return {
    min: move.input.min,
    max: move.input.max,
    step: move.input.step,
    label: move.name,
    suffix: move.input.unit ?? "¢",
    format: (v: number) => String(v),
  };
}

export function readNumericInput(input: unknown, key: "newPrice" | "amount" | "units"): number {
  const payload = input as Record<string, number | undefined>;
  return payload[key] ?? 0;
}

export function writeNumericInput(
  input: unknown,
  key: "newPrice" | "amount" | "units",
  value: number
): Record<string, unknown> {
  return { ...(input as Record<string, unknown>), [key]: value };
}
