"use client";

import { useEffect, useState } from "react";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { getTutorialNarration } from "@adamsaxion/pricewar-engine";
import { buildDecideCoachLine } from "@/client/pricewar/match-coach";
import { loadLastPrivateReport } from "@/client/pricewar/match-session-storage";
import { CoachBubble } from "@/components/pricewar/design-system/CoachBubble";

export function MatchDecideCoach({ view, matchId }: { view: PlayerView; matchId: string }) {
  const [lastPrivateReport, setLastPrivateReport] = useState<string | null>(null);

  useEffect(() => {
    setLastPrivateReport(loadLastPrivateReport(matchId));
  }, [matchId, view.market.currentRound]);

  const tutorialStep =
    view.playModeId === "tutorial"
      ? getTutorialNarration(view.market.currentRound)
      : undefined;
  const coach = buildDecideCoachLine(view, tutorialStep, lastPrivateReport);

  return <CoachBubble label={coach.label}>{coach.text}</CoachBubble>;
}
