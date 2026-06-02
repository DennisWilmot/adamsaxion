import type { LegalMoveStatus } from "@adamsaxion/pricewar-engine";
import type { MoveDefinition } from "@adamsaxion/pricewar-types";

export type MoveLockKind = "austerity" | "cooldown" | "prerequisite";

export function classifyMoveLock(
  legal: LegalMoveStatus | undefined,
  cost: number,
  cash: number
): MoveLockKind {
  const reason = (legal?.reason ?? "").toLowerCase();
  if (reason.includes("cooldown") || reason.includes("next round")) {
    return "cooldown";
  }
  if (
    reason.includes("prerequisite") ||
    reason.includes("requires") ||
    reason.includes("need at least") ||
    reason.includes("not available")
  ) {
    return "prerequisite";
  }
  if (cost > cash || reason.includes("bank") || reason.includes("austerity")) {
    return "austerity";
  }
  return "prerequisite";
}

export function formatMoveTileMeta(
  move: MoveDefinition,
  cost: number,
  legal: LegalMoveStatus | undefined,
  cash: number
): string {
  if (legal == null || legal.available) {
    if (cost === 0 && move.input.kind !== "slider") {
      return "$0 upfront · public";
    }
    if (move.input.kind === "slider") {
      return "price · this round";
    }
    return `$${cost} upfront`;
  }

  const lock = classifyMoveLock(legal, cost, cash);
  const lockLabel = lock === "prerequisite" ? "prereq" : lock;
  const spend = cost > 0 ? `−$${cost}` : "$0";
  return `${spend} · 🔒 ${lockLabel}`;
}
