"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTutorialReportNarration } from "@adamsaxion/pricewar-engine";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { MatchHeaderStrip } from "@/components/pricewar/shell/MatchHeaderStrip";

export default function ReportPage() {
  const params = useParams<{ id: string; round: string }>();
  const matchId = params.id;
  const round = Number(params.round);

  const { data: view } = useMatchView(matchId);

  const reportQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "report", round],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/report/${round}`);
      if (!res.ok) throw new Error("Failed to load report");
      return res.json() as Promise<{ report: {
        publicSummary: string;
        publicEvents: Array<{ description: string; impact: string }>;
        privateSummary: { A: string; B: string };
        deltas: {
          A: { cashDelta: number; demandSatisfied: number };
          B: { cashDelta: number; demandSatisfied: number };
        };
      } }>;
    },
  });

  const report = reportQuery.data?.report;
  const isComplete = view?.phase === "completed";
  const nextHref = isComplete
    ? `/play/match/${matchId}/postmatch`
    : `/play/match/${matchId}/decide`;

  const tutorialReportLine =
    view?.playModeId === "tutorial" ? getTutorialReportNarration(round) : undefined;

  return (
    <div className="space-y-xl">
      {view && <MatchHeaderStrip view={view} matchId={matchId} />}

      {tutorialReportLine && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-lg text-sm text-foreground-secondary">
            <strong className="text-foreground">Tutorial:</strong> {tutorialReportLine}
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface-raised">
        <CardHeader>
          <CardTitle>Round {params.round} report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-lg">
          {reportQuery.isLoading && (
            <p className="text-foreground-muted">Loading report…</p>
          )}
          {report && (
            <>
              <p className="text-foreground-secondary">{report.publicSummary}</p>
              <ul className="space-y-sm text-sm text-foreground-secondary">
                {report.publicEvents.map((event, i) => (
                  <li key={i}>• {event.description}</li>
                ))}
              </ul>
              <p className="rounded-md bg-surface-sunken p-md text-sm">
                Cash change this round:{" "}
                <strong>
                  {view?.me.slot === "A"
                    ? report.deltas.A.cashDelta
                    : report.deltas.B.cashDelta}
                </strong>
              </p>
            </>
          )}
          <div className="flex gap-md">
            <Button asChild>
              <Link href={nextHref}>
                {isComplete ? "Post-match" : "Next round"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/play">Back to lobby</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
