import type { PlayModeConfig } from "@adamsaxion/pricewar-types";

export const PLAY_MODES: PlayModeConfig[] = [
  {
    id: "blitz",
    label: "Blitz 5+0",
    shortLabel: "5 min",
    clock: { kind: "chess", perPlayerMs: 5 * 60 * 1000 },
    affectsRating: true,
    availableToTiers: ["free", "paid"],
    inactivityForfeitAfterRounds: 2,
    inactivityForfeitOnZeroMoves: 3,
    matchStartGraceMs: 60 * 1000,
    reducedKOnTimeoutForfeit: true,
  },
  {
    id: "rapid",
    label: "Rapid 15+0",
    shortLabel: "15 min",
    clock: { kind: "chess", perPlayerMs: 15 * 60 * 1000 },
    affectsRating: true,
    availableToTiers: ["paid"],
    inactivityForfeitAfterRounds: 2,
    inactivityForfeitOnZeroMoves: 3,
    matchStartGraceMs: 2 * 60 * 1000,
    reducedKOnTimeoutForfeit: true,
  },
  {
    id: "tutorial",
    label: "Tutorial",
    shortLabel: "Tutorial",
    clock: null,
    affectsRating: false,
    availableToTiers: ["free", "paid"],
    inactivityForfeitAfterRounds: 999,
    inactivityForfeitOnZeroMoves: 999,
    matchStartGraceMs: 60 * 60 * 1000,
    reducedKOnTimeoutForfeit: false,
    scriptedOpponent: true,
  },
  {
    id: "blitz-e2e",
    label: "E2E Blitz",
    shortLabel: "E2E",
    clock: { kind: "chess", perPlayerMs: 5 * 1000 },
    affectsRating: false,
    availableToTiers: ["free", "paid"],
    inactivityForfeitAfterRounds: 2,
    inactivityForfeitOnZeroMoves: 3,
    matchStartGraceMs: 5 * 1000,
    reducedKOnTimeoutForfeit: true,
  },
];

const HIDDEN_OUTSIDE_E2E = new Set(["blitz-e2e"]);

export function listPlayModes(): PlayModeConfig[] {
  if (process.env.PRICEWAR_E2E_PLAY_MODES === "1") {
    return PLAY_MODES;
  }
  return PLAY_MODES.filter((mode) => !HIDDEN_OUTSIDE_E2E.has(mode.id));
}

export function isE2ePlayMode(id: string): boolean {
  return HIDDEN_OUTSIDE_E2E.has(id);
}

export function getPlayMode(id: string): PlayModeConfig | undefined {
  return PLAY_MODES.find((m) => m.id === id);
}
