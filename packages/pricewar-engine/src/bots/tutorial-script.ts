import type { MoveId, SubmittedMove } from "@adamsaxion/pricewar-types";

const id = (s: string) => s as MoveId;
const at = new Date(0).toISOString();

/** Deterministic opponent moves for the Coffee Shop tutorial (rounds 1–8). */
export const TUTORIAL_BOT_SCRIPT: Readonly<Record<number, SubmittedMove[]>> = {
  1: [{ moveId: id("sales.s01"), input: { newPrice: 375 }, draftedAt: at }],
  2: [{ moveId: id("marketing.m01"), input: { amount: 75 }, draftedAt: at }],
  3: [{ moveId: id("procurement.p03"), input: { units: 2 }, draftedAt: at }],
  4: [{ moveId: id("sales.s04"), input: { enabled: true }, draftedAt: at }],
  5: [{ moveId: id("operations.o03"), input: { modeId: "on" }, draftedAt: at }],
  6: [{ moveId: id("marketing.m01"), input: { amount: 150 }, draftedAt: at }],
  7: [{ moveId: id("sales.s01"), input: { newPrice: 400 }, draftedAt: at }],
  8: [{ moveId: id("finance.f03"), input: { enabled: true }, draftedAt: at }],
};

export function getTutorialBotMoves(round: number): SubmittedMove[] {
  return TUTORIAL_BOT_SCRIPT[round] ? [...TUTORIAL_BOT_SCRIPT[round]] : [];
}

export function getTutorialBotScriptRounds(): number[] {
  return Object.keys(TUTORIAL_BOT_SCRIPT)
    .map(Number)
    .sort((a, b) => a - b);
}
