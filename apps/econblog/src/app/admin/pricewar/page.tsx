"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPriceWarPage() {
  const matchesQuery = useQuery({
    queryKey: ["admin", "pricewar", "matches"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/admin/matches?limit=50");
      if (!res.ok) throw new Error("Failed to load matches");
      return res.json();
    },
  });

  const costsQuery = useQuery({
    queryKey: ["admin", "pricewar", "costs"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/admin/costs");
      if (!res.ok) throw new Error("Failed to load costs");
      return res.json();
    },
  });

  const catalogQuery = useQuery({
    queryKey: ["admin", "pricewar", "move-catalog"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/admin/move-catalog");
      if (!res.ok) throw new Error("Failed to load catalog");
      return res.json();
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-2xl p-xl">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-display text-3xl font-bold">Price War Admin</h1>
          <p className="mt-sm text-foreground-muted">
            Match debug, move catalog analytics, LLM spend, player lookup.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Lessons admin</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-sm">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar/catalog">Move catalog</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar/costs">LLM costs</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar/players">Find player</Link>
        </Button>
      </div>

      <div className="grid gap-lg md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>LLM spend today</CardTitle>
          </CardHeader>
          <CardContent>
            {costsQuery.isLoading && (
              <p className="text-sm text-foreground-muted">Loading…</p>
            )}
            {costsQuery.data && (
              <div className="space-y-sm text-sm">
                <p>
                  Total:{" "}
                  <strong>${costsQuery.data.todayTotalUsd.toFixed(4)}</strong> (
                  {costsQuery.data.todayCalls} calls)
                </p>
                {costsQuery.data.byFeature?.map(
                  (row: { feature: string; totalUsd: number; calls: number }) => (
                    <p key={row.feature} className="text-foreground-muted">
                      {row.feature}: ${row.totalUsd.toFixed(4)} ({row.calls})
                    </p>
                  )
                )}
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/admin/pricewar/costs">Full dashboard →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Move catalog</CardTitle>
          </CardHeader>
          <CardContent>
            {catalogQuery.data && (
              <div className="space-y-sm text-sm">
                <p className="text-foreground-muted">
                  {catalogQuery.data.moves?.length ?? 0} moves ·{" "}
                  {(catalogQuery.data.totalPicks ?? 0).toLocaleString()} picks logged
                </p>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/admin/pricewar/catalog">View analytics →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          {matchesQuery.isLoading && (
            <p className="text-sm text-foreground-muted">Loading matches…</p>
          )}
          {(matchesQuery.data?.matches ?? []).map(
            (m: {
              id: string;
              playModeId: string;
              phase: string;
              outcomeKind: string;
              players: Array<{
                slot: string;
                displayName: string;
                isBot: boolean;
                userId?: string | null;
              }>;
              updatedAt: string;
            }) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-md rounded-md border border-border p-md"
              >
                <div>
                  <p className="font-medium capitalize">
                    {m.playModeId}{" "}
                    <Badge variant="outline" className="ml-sm">
                      {m.phase}
                    </Badge>
                    {m.outcomeKind !== "in_progress" && (
                      <Badge variant="secondary" className="ml-sm">
                        {m.outcomeKind}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {m.players.map((p) => (
                      <span key={p.slot} className="mr-md">
                        {p.slot}:{" "}
                        {!p.isBot && p.userId ? (
                          <Link
                            href={`/admin/pricewar/players/${p.userId}`}
                            className="text-primary hover:underline"
                          >
                            {p.displayName}
                          </Link>
                        ) : (
                          p.displayName
                        )}
                      </span>
                    ))}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/pricewar/matches/${m.id}`}>Trace</Link>
                </Button>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
