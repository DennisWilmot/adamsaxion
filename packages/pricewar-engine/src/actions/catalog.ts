import type { MoveDefinition, MoveId } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_SCENARIO_ID } from "@adamsaxion/pricewar-types";
import { ACTION_CATALOG_DATA } from "./catalog-data";
import type { ActionCatalogEntry, LockForecastLine } from "./catalog-types";

function inputSpecFor(entry: ActionCatalogEntry): MoveDefinition["input"] {
  switch (entry.inputKind) {
    case "slider":
      return { kind: "slider", min: 100, max: 800, step: 25, unit: "¢" };
    case "amount":
      return { kind: "amount", min: 0, max: 200, currency: "$" };
    case "stepper":
      return { kind: "stepper", min: 1, max: 10, step: 1 };
    case "mode":
      return {
        kind: "mode",
        modes: [{ id: "on", label: "Enable" }],
      };
    case "singleChoice":
      return {
        kind: "singleChoice",
        options: [
          { id: "quality", label: "Quality boost" },
          { id: "menu", label: "New menu item" },
          { id: "cost", label: "Cost reduction" },
        ],
      };
    default:
      return { kind: "toggle", default: true };
  }
}

function toMoveDefinition(entry: (typeof ACTION_CATALOG_DATA)[number]): MoveDefinition {
  return {
    id: entry.id as MoveId,
    domain: entry.domain as MoveDefinition["domain"],
    scenarios: [COFFEE_SHOP_SCENARIO_ID],
    name: entry.name,
    description: entry.tagline,
    detailedDescription: entry.mechanic,
    kind: entry.actionType.toLowerCase().includes("mode") ? "persistentPolicy" : "oneShot",
    input: inputSpecFor(entry),
    visibility: entry.visibility,
    timing: "preEvents",
    modifies: [],
    ...(entry.riskyWhen ? { warnings: [entry.riskyWhen] } : {}),
  };
}

export const COFFEE_SHOP_ACTIONS: MoveDefinition[] = ACTION_CATALOG_DATA.map(toMoveDefinition);

export const COFFEE_SHOP_MOVES = COFFEE_SHOP_ACTIONS;

export const ACTION_BY_ID = new Map(ACTION_CATALOG_DATA.map((e) => [e.id, e]));

export const MOVE_BY_ID = new Map(COFFEE_SHOP_ACTIONS.map((m) => [m.id, m]));

export function getActionCatalogEntry(id: string): ActionCatalogEntry | undefined {
  return ACTION_BY_ID.get(id);
}

export function lockForecastForAction(id: string): LockForecastLine[] {
  const entry = ACTION_BY_ID.get(id);
  if (!entry) return [];
  const lines: LockForecastLine[] = [];
  if (entry.immediateEffect) {
    lines.push({ kind: "immediate", text: entry.immediateEffect });
  }
  if (entry.delayedEffect) {
    lines.push({ kind: "delayed", text: entry.delayedEffect });
  }
  if (entry.riskyWhen) {
    lines.push({ kind: "risk", text: entry.riskyWhen });
  }
  return lines;
}

export function lockForecastForMoves(ids: string[]): LockForecastLine[] {
  return ids.flatMap(lockForecastForAction);
}
