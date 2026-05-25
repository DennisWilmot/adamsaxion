"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { data } = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  return (
    <div className="space-y-lg">
      <h1 className="font-display text-2xl font-bold">Match history</h1>
      {(data?.matches ?? []).map(
        (m: {
          matchId: string;
          playModeId: string;
          phase: string;
          outcomeKind: string;
          outcomeReason: string | null;
          ratingDelta: number | null;
        }) => (
          <Card key={m.matchId} className="bg-surface-raised">
            <CardContent className="flex items-center justify-between py-lg">
              <div>
                <p className="font-medium capitalize">{m.playModeId}</p>
                <p className="text-sm text-foreground-muted">
                  {m.outcomeKind}
                  {m.outcomeReason ? ` · ${m.outcomeReason}` : ""}
                </p>
                {m.ratingDelta != null && (
                  <p
                    className={`text-sm ${m.ratingDelta >= 0 ? "text-success" : "text-error"}`}
                  >
                    Rating {m.ratingDelta >= 0 ? "+" : ""}
                    {m.ratingDelta}
                  </p>
                )}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={
                    m.phase === "completed"
                      ? `/play/match/${m.matchId}/postmatch`
                      : `/play/match/${m.matchId}/decide`
                  }
                >
                  Open
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
