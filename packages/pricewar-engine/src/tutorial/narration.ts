import type { MoveId } from "@adamsaxion/pricewar-types";

export interface TutorialNarrationStep {
  round: number;
  title: string;
  body: string;
  hint?: string;
  suggestedMoveIds?: MoveId[];
}

export const TUTORIAL_NARRATION: TutorialNarrationStep[] = [
  {
    round: 1,
    title: "Welcome to Margin (Beta)",
    body:
      "Each round you pick up to 3 moves across sales, marketing, operations, and more. " +
      "Your opponent's price is always visible. Every point of margin counts.",
    hint: "Try setting your price, then add a marketing move.",
    suggestedMoveIds: ["sales.s01" as MoveId, "marketing.m01" as MoveId],
  },
  {
    round: 2,
    title: "Demand follows price and brand",
    body:
      "Lower prices can win volume, but you earn less per cup. Marketing builds your reputation, " +
      "which helps when prices are similar.",
    hint: "Balance a competitive price with a small brand investment.",
    suggestedMoveIds: ["sales.s01" as MoveId, "marketing.m01" as MoveId],
  },
  {
    round: 3,
    title: "Inventory matters",
    body:
      "If you run out of beans, you lose sales even with a great price. Restock before demand hits.",
    hint: "Buy beans if inventory is running low.",
    suggestedMoveIds: ["procurement.p03" as MoveId],
  },
  {
    round: 4,
    title: "Flash sales",
    body:
      "A flash sale cuts price for one round only. Useful when your opponent holds a premium price.",
    suggestedMoveIds: ["sales.s04" as MoveId],
  },
  {
    round: 5,
    title: "Operations and morale",
    body:
      "Deep cleaning and extended hours affect reputation and staff morale. Happy teams serve more customers reliably.",
    suggestedMoveIds: ["operations.o08" as MoveId],
  },
  {
    round: 6,
    title: "Mid-game marketing",
    body:
      "Ad campaigns cost cash upfront but can shift demand for several rounds. Watch your cash before spending big.",
    suggestedMoveIds: ["marketing.m01" as MoveId],
  },
  {
    round: 7,
    title: "Late-game pricing",
    body:
      "With two rounds left, set a price that maximizes profit on remaining demand, not just the lowest price on the board.",
    suggestedMoveIds: ["sales.s01" as MoveId],
  },
  {
    round: 8,
    title: "Final round",
    body:
      "End-of-match cash determines the winner. Saving cash or spending carefully can protect you from a bad final round.",
    suggestedMoveIds: ["finance.f03" as MoveId, "sales.s01" as MoveId],
  },
];

export function getTutorialNarration(round: number): TutorialNarrationStep | undefined {
  return TUTORIAL_NARRATION.find((step) => step.round === round);
}

export function getTutorialReportNarration(round: number): string | undefined {
  const lines: Record<number, string> = {
    1: "Your price and your opponent's price both appear in the header. That is public information.",
    2: "Check the cash change. Marketing spend today may pay off in later rounds.",
    3: "Stockouts show up as lost sales in the report. Keep inventory ahead of busy days.",
    4: "Flash sales are loud but temporary. Did volume jump enough to justify the lower price?",
    5: "Morale and reputation feed back into demand over multiple rounds.",
    6: "Compare your cash to your opponent's. Runway wins the game.",
    7: "Two rounds left: small price tweaks can matter more than big campaigns.",
    8: "Final scores are based on ending cash. Every dollar counts.",
  };
  return lines[round];
}
