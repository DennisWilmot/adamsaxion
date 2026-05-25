"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTutorialReportNarration } from "@adamsaxion/pricewar-engine";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { RoundReportScreen } from "@/components/pricewar/screens/RoundReportScreen";
import { priceWarPaths } from "@/lib/games/routes";

export default function ReportPage() {
  const params = useParams<{ id: string; round: string }>();
  const router = useRouter();
  const matchId = params.id;
  const round = Number(params.round);

  const { data: view } = useMatchView(matchId);

  const reportQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "report", round],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/report/${round}`);
      if (!res.ok) throw new Error("Failed to load report");
      return res.json() as Promise<{
        report: {
          publicSummary: string;
          publicEvents: Array<{
            description: string;
            impact: "neutral" | "positive" | "negative";
          }>;
          privateSummary: { A: string; B: string };
          deltas: {
            A: { cashDelta: number; demandSatisfied: number };
            B: { cashDelta: number; demandSatisfied: number };
          };
        };
      }>;
    },
  });

  const report = reportQuery.data?.report;
  const isComplete = view?.phase === "completed";
  const resolvedRound = view?.market.lastResolvedRound ?? round;
  const nextRound = isComplete ? resolvedRound : resolvedRound + 1;
  const nextHref = isComplete
    ? priceWarPaths.match.postmatch(matchId)
    : priceWarPaths.match.decide(matchId);

  async function handleContinue() {
    if (report && view) {
      const mySlot = view.me.slot;
      const privateLine =
        mySlot === "A" ? report.privateSummary.A : report.privateSummary.B;
      if (privateLine) {
        sessionStorage.setItem(`pricewar:lastPrivateReport:${matchId}`, privateLine);
      }
    }
    if (!isComplete) {
      await fetch(`/api/pricewar/match/${matchId}/continue`, { method: "POST" });
    }
    router.push(nextHref);
  }

  const tutorialReportLine =
    view?.playModeId === "tutorial" ? getTutorialReportNarration(round) : undefined;

  if (!view || reportQuery.isLoading || !report) {
    return <p className="text-foreground-muted">Loading report…</p>;
  }

  const mySlot = view.me.slot;
  const myDelta = mySlot === "A" ? report.deltas.A.cashDelta : report.deltas.B.cashDelta;
  const oppDelta = mySlot === "A" ? report.deltas.B.cashDelta : report.deltas.A.cashDelta;
  const mySold = mySlot === "A" ? report.deltas.A.demandSatisfied : report.deltas.B.demandSatisfied;
  const oppSold = mySlot === "A" ? report.deltas.B.demandSatisfied : report.deltas.A.demandSatisfied;
  const privateSummary =
    mySlot === "A" ? report.privateSummary.A : report.privateSummary.B;

  const verdictLine =
    myDelta > oppDelta ? "had the weaker round." : myDelta < oppDelta ? "took the round." : "split the round.";

  return (
    <RoundReportScreen
      matchId={matchId}
      view={view}
      round={round}
      myDelta={myDelta}
      oppDelta={oppDelta}
      mySold={mySold}
      oppSold={oppSold}
      publicSummary={report.publicSummary}
      privateSummary={privateSummary}
      publicEvents={report.publicEvents}
      verdictLine={verdictLine}
      {...(tutorialReportLine ? { tutorialLine: tutorialReportLine } : {})}
      nextHref={nextHref}
      nextRound={nextRound}
      onContinue={handleContinue}
      isComplete={!!isComplete}
    />
  );
}
