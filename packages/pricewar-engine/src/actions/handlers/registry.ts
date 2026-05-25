import { ALL_ACTION_HANDLERS } from "./all-handlers";
import { stubHandler, type ActionHandler } from "./types";
import type { ScenarioConfig } from "@adamsaxion/pricewar-types";

export const ACTION_HANDLERS: Record<string, ActionHandler> = {
  ...ALL_ACTION_HANDLERS,
};

export function hasActionHandler(moveId: string): boolean {
  return moveId in ACTION_HANDLERS;
}

export function resolveActionHandler(
  moveId: string,
  scenario: ScenarioConfig
): ActionHandler | null {
  const handler = ACTION_HANDLERS[moveId];
  if (handler) return handler;
  if (scenario.allowStubbedMoves) return stubHandler;
  return null;
}

export { stubHandler };
