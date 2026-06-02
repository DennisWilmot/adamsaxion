import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { TutorialNarrationStep } from "@adamsaxion/pricewar-engine";

export function buildDecideCoachLine(
  view: PlayerView,
  tutorialStep?: TutorialNarrationStep,
  lastPrivateReport?: string | null
): { label: string; text: string } {
  if (tutorialStep) {
    const text = tutorialStep.hint
      ? `${tutorialStep.title}. ${tutorialStep.hint}`
      : `${tutorialStep.title} ${tutorialStep.body}`;
    return { label: "Prof. Aldo · Tutorial", text };
  }

  if (lastPrivateReport && view.market.currentRound > 1) {
    const snippet =
      lastPrivateReport.length > 160
        ? `${lastPrivateReport.slice(0, 157)}…`
        : lastPrivateReport;
    return {
      label: "Prof. Aldo · Coach",
      text: `Last round: ${snippet}. What will you do differently?`,
    };
  }

  const opp = view.opponent.displayName;
  const price = view.opponent.currentPrice;

  if (view.opponentHasLocked) {
    return {
      label: "Prof. Aldo · Coach",
      text: `${opp} locked in at ${price}¢. That is a signal. If you planned to charge more, stick with it. If you planned to undercut, commit fully.`,
    };
  }

  if (view.me.inventory < 30) {
    return {
      label: "Prof. Aldo · Coach",
      text: "You are running low on beans. Restock now before margins collapse.",
    };
  }

  if (view.me.cash < 500) {
    return {
      label: "Prof. Aldo · Coach",
      text: "Cash is tight. Only spend on moves that pay off this round.",
    };
  }

  return {
    label: "Prof. Aldo · Coach",
    text: `${opp} is at ${price}¢. You get three moves. Make them count.`,
  };
}
