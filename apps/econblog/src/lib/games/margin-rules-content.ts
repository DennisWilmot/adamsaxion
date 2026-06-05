import { COFFEE_SHOP_SCENARIO, listPlayModes } from "@adamsaxion/pricewar-engine";
import { MARGIN_GAME_NAME } from "@/lib/games/routes";

export type MarginRulesSection = {
  title: string;
  body: string;
  bullets?: string[];
};

const PLAY_MODE_LINES = listPlayModes()
  .filter((m) => m.id !== "blitz-e2e")
  .map((mode) => {
    const clock =
      mode.clock?.kind === "chess"
        ? `${Math.round(mode.clock.perPlayerMs / 60_000)} min match clock per player`
        : "No clock — learn at your pace";
    const rated = mode.affectsRating ? "Counts toward Elo when rated" : "Unrated practice";
    return `${mode.label}: ${clock}. ${rated}.`;
  });

export const MARGIN_RULES_SECTIONS: MarginRulesSection[] = [
  {
    title: "Objective",
    body: `${MARGIN_GAME_NAME} is a turn-based economics duel. You run a coffee shop against a rival in the same market. Protect your margins, react to news and demand, and finish with more cash than your opponent after ${COFFEE_SHOP_SCENARIO.totalRounds} rounds.`,
  },
  {
    title: "Each round",
    bullets: [
      "Brief on the board, then pick up to three moves across business domains.",
      "Review your draft, then lock in. You can change picks until you lock.",
      "After both players lock, the round resolves and a report reveals prices, cash, and what happened.",
      "Use the turn log during a match to reread past rounds.",
    ],
    body: "",
  },
  {
    title: "Domains",
    body: "Moves are grouped into six areas of the business. Mix pricing, staffing, marketing, finance, and operations to build a strategy — not just a price war.",
    bullets: [
      "Sales — pricing and demand",
      "Procurement — inputs and supply",
      "Operations — capacity and efficiency",
      "HR — staffing and wages",
      "Marketing — brand and reach",
      "Finance — cash, debt, and reserves",
    ],
  },
  {
    title: "Clocks & modes",
    body: "Choose a mode before you hit Play. Your match clock starts when the match begins.",
    bullets: PLAY_MODE_LINES,
  },
  {
    title: "Winning & losing",
    bullets: [
      "Highest cash at the end of the final round wins the match.",
      "Run out of cash and you can enter bankruptcy — some recovery moves still exist in austerity.",
      "Forfeit or run out of time on the clock and you lose the match.",
      "Inactive matches may be forfeited after missed rounds.",
    ],
    body: "",
  },
  {
    title: "Ranked play",
    body: "Human vs human matches in Rapid or Blitz can update your coffee-shop Elo when rated play is enabled. Tutorial and practice bots do not affect rating.",
  },
];
