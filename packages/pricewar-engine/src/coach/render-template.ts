import type { PlayerSlot } from "@adamsaxion/pricewar-types";
import type { MatchFacts } from "./extract-facts";

export interface CoachReportPayload {
  oneLinerVerdict: string;
  turningPoint: { round: number; explanation: string };
  whatYouDidWell: string[];
  whatToImprove: string[];
  recommendedLessonSlugs: string[];
  generatedBy: "template" | "llm";
}

export function renderTemplateCoach(
  facts: MatchFacts,
  viewerSlot: PlayerSlot
): CoachReportPayload {
  const myCash = facts.finalCash[viewerSlot];
  const theirCash = facts.finalCash[viewerSlot === "A" ? "B" : "A"];
  const won =
    facts.outcome.winner !== "draw" && facts.outcome.winner === viewerSlot;
  const lost =
    facts.outcome.winner !== "draw" && facts.outcome.winner !== viewerSlot;

  const oneLinerVerdict = won
    ? `Strong finish — you closed with $${myCash.toLocaleString()} vs $${theirCash.toLocaleString()}.`
    : lost
      ? `Tough match — you ended at $${myCash.toLocaleString()} while your opponent reached $${theirCash.toLocaleString()}.`
      : `Even match — both shops finished at $${myCash.toLocaleString()}.`;

  const turning = facts.turningPoints[0] ?? {
    round: 1,
    description: "Early rounds set the tone for cash flow.",
    impactScore: 0,
  };

  return {
    oneLinerVerdict,
    turningPoint: {
      round: turning.round,
      explanation: turning.description,
    },
    whatYouDidWell: won
      ? ["You preserved cash better than your opponent in key rounds."]
      : ["You stayed in the match and adapted round to round."],
    whatToImprove: won
      ? ["Look for rounds where you can invest more in brand without bleeding cash."]
      : ["Review pricing and marketing balance — small demand shifts compound over 8 rounds."],
    recommendedLessonSlugs: ["lesson-zero"],
    generatedBy: "template",
  };
}
