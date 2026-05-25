"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";

export default function PostMatchPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  const summaryQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed",
  });

  const coachQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "coach"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/coach`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed" && view?.playModeId !== "tutorial",
  });

  const tutorialStatusQuery = useQuery({
    queryKey: ["pricewar", "tutorial", "status"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/tutorial/status");
      if (!res.ok) return { completed: false, completedCount: 0 };
      return res.json() as Promise<{
        completed: boolean;
        completedCount: number;
      }>;
    },
    enabled: view?.playModeId === "tutorial" && view?.phase === "completed",
  });

  const coach = coachQuery.data?.report;
  const upgradePrompt = coachQuery.data?.upgradePrompt;
  const summary = summaryQuery.data;
  const isTutorial = view?.playModeId === "tutorial";

  const won =
    view?.outcome.kind === "win" && view.me.slot === view.outcome.winner;
  const lost =
    view?.outcome.kind === "win" && view.me.slot !== view.outcome.winner;

  const title = isTutorial
    ? "Tutorial complete"
    : won
      ? "Victory"
      : lost
        ? "Defeat"
        : view?.outcome.kind === "draw"
          ? "Draw"
          : "Match complete";

  return (
    <div className="space-y-xl">
      <Card className="bg-surface-raised">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-lg">
          {view && (
            <p className="text-foreground-secondary">
              Final cash: <strong>${view.me.cash.toLocaleString()}</strong>
            </p>
          )}

          {isTutorial && (
            <p className="text-sm text-foreground-secondary">
              {tutorialStatusQuery.data?.completedCount === 1
                ? "Nice work — you finished your first tutorial. Replay anytime from the lobby; only your first run counts toward onboarding."
                : "Tutorial replay complete. Ready for a rated Blitz match?"}
            </p>
          )}

          {summary?.isRated && summary.ratingDelta !== null && (
            <p className="text-foreground-secondary">
              Rating:{" "}
              <strong className={summary.ratingDelta >= 0 ? "text-success" : "text-error"}>
                {summary.ratingDelta >= 0 ? "+" : ""}
                {summary.ratingDelta}
              </strong>
              {summary.ratingAfter !== null && (
                <span className="text-foreground-muted"> → {summary.ratingAfter}</span>
              )}
            </p>
          )}

          {summary && !summary.isRated && view?.phase === "completed" && !isTutorial && (
            <p className="text-sm text-foreground-muted">Unrated match</p>
          )}

          {coachQuery.isLoading && (
            <p className="text-foreground-muted">Generating coach summary…</p>
          )}

          {coach && (
            <Card className="border border-border-subtle bg-surface-sunken">
              <CardContent className="space-y-md py-lg">
                <p className="font-medium">{coach.oneLinerVerdict}</p>
                <p className="text-sm text-foreground-secondary">
                  Turning point (R{coach.turningPoint.round}): {coach.turningPoint.explanation}
                </p>
                <div>
                  <p className="text-sm font-medium">What you did well</p>
                  <ul className="mt-sm list-disc pl-lg text-sm text-foreground-secondary">
                    {coach.whatYouDidWell.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">What to improve</p>
                  <ul className="mt-sm list-disc pl-lg text-sm text-foreground-secondary">
                    {coach.whatToImprove.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {coach.recommendedLessonSlugs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Recommended lessons</p>
                    <ul className="mt-sm space-y-sm text-sm">
                      {coach.recommendedLessonSlugs.map((slug: string) => (
                        <li key={slug}>
                          <Link href={`/lessons/${slug}`} className="text-primary underline">
                            {slug.replace(/-/g, " ")}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {upgradePrompt && (
                  <p className="text-sm text-primary">
                    Upgrade for personalized AI coaching.{" "}
                    <Link href="/subscribe" className="underline">
                      Subscribe
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-md">
            <Button asChild>
              <Link href="/play">Back to lobby</Link>
            </Button>
            {isTutorial && (
              <Button asChild variant="outline">
                <Link href="/play/tutorial">Replay tutorial</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
