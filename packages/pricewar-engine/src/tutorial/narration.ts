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
    title: "Welcome to The Price War",
    body:
      "Each round you pick up to 3 moves across sales, marketing, operations, and more. " +
      "Your opponent's price is always visible — that's the core of a price war.",
    hint: "Try setting your price, then add a marketing move.",
    suggestedMoveIds: ["sales.set_price" as MoveId, "marketing.social_post" as MoveId],
  },
  {
    round: 2,
    title: "Demand follows price and brand",
    body:
      "Lower prices can win volume, but erode margin. Marketing builds reputation, which helps " +
      "when prices are similar.",
    hint: "Balance a competitive price with a small brand investment.",
    suggestedMoveIds: ["sales.set_price" as MoveId, "marketing.run_ad_campaign" as MoveId],
  },
  {
    round: 3,
    title: "Inventory matters",
    body:
      "If you stock out, you lose sales even with a great price. Procurement refills beans " +
      "before demand hits.",
    hint: "Buy beans if inventory is running low.",
    suggestedMoveIds: ["procurement.buy_beans" as MoveId],
  },
  {
    round: 4,
    title: "Flash sales",
    body:
      "A flash sale cuts price for one round only — useful to steal share when your opponent " +
      "holds a premium price.",
    suggestedMoveIds: ["sales.flash_sale" as MoveId],
  },
  {
    round: 5,
    title: "Operations & morale",
    body:
      "Deep cleaning and extended hours affect reputation and staff morale. Happy teams serve " +
      "more customers reliably.",
    suggestedMoveIds: ["operations.deep_clean" as MoveId],
  },
  {
    round: 6,
    title: "Mid-game marketing",
    body:
      "Ad campaigns cost cash upfront but can shift demand for several rounds. Watch your cash " +
      "runway before spending big.",
    suggestedMoveIds: ["marketing.run_ad_campaign" as MoveId],
  },
  {
    round: 7,
    title: "Late-game pricing",
    body:
      "With two rounds left, set a price that maximizes profit on remaining demand — not just " +
      "the lowest price on the board.",
    suggestedMoveIds: ["sales.set_price" as MoveId],
  },
  {
    round: 8,
    title: "Final round",
    body:
      "End-of-match cash determines the winner. A cash reserve or conservative spend can protect " +
      "you from a bad final round.",
    suggestedMoveIds: ["finance.cash_reserve" as MoveId, "sales.set_price" as MoveId],
  },
];

export function getTutorialNarration(round: number): TutorialNarrationStep | undefined {
  return TUTORIAL_NARRATION.find((step) => step.round === round);
}

export function getTutorialReportNarration(round: number): string | undefined {
  const lines: Record<number, string> = {
    1: "Notice how your price and your opponent's price both appear in the header — that's public information.",
    2: "Check the cash delta: marketing spend today may pay off in later rounds.",
    3: "Stockouts show up as lost demand in the report. Keep inventory ahead of weather swings.",
    4: "Flash sales are loud but temporary. Did volume jump enough to justify the margin cut?",
    5: "Morale and reputation feed back into demand over multiple rounds.",
    6: "Compare your cash to your opponent's — runway wins price wars.",
    7: "Two rounds left: small price tweaks can matter more than big campaigns.",
    8: "Final scores are based on ending cash. Every dollar counts.",
  };
  return lines[round];
}
