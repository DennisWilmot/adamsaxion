"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminMatchTracePage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const queryClient = useQueryClient();
  const [actionResult, setActionResult] = useState<unknown>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const traceQuery = useQuery({
    queryKey: ["admin", "pricewar", "trace", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/admin/matches/${matchId}/trace`);
      if (!res.ok) throw new Error("Failed to load trace");
      return res.json();
    },
  });

  async function runAction(path: "void" | "re-resolve") {
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`/api/pricewar/admin/matches/${matchId}/${path}`, {
        method: "POST",
      });
      const data = await res.json();
      setActionResult(data);
      if (res.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["admin", "pricewar", "trace", matchId],
        });
      }
    } finally {
      setActionLoading(false);
    }
  }

  const trace = traceQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-xl p-xl">
      <div className="flex flex-wrap items-center gap-md">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar">← Matches</Link>
        </Button>
        <h1 className="font-display text-2xl font-bold">Match trace</h1>
        <div className="ml-auto flex gap-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading}
            onClick={() => runAction("re-resolve")}
          >
            Re-resolve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={actionLoading}
            onClick={() => runAction("void")}
          >
            Void match
          </Button>
        </div>
      </div>

      {actionResult && (
        <Card className="border-border">
          <CardContent className="py-md">
            <pre className="max-h-40 overflow-auto text-xs">
              {JSON.stringify(actionResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {traceQuery.isLoading && (
        <p className="text-foreground-muted">Loading trace…</p>
      )}

      {trace && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {trace.state.playModeId} · {trace.state.phase} · R
                {trace.state.market.currentRound}/{trace.state.market.totalRounds}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm text-sm text-foreground-muted">
              <p>
                Outcome: {trace.state.outcome.kind}
                {trace.state.outcome.kind === "win" &&
                  ` — winner ${trace.state.outcome.winner}`}
              </p>
              {trace.participants?.length > 0 && (
                <p>
                  Players:{" "}
                  {trace.participants.map(
                    (p: {
                      slot: string;
                      userId: string | null;
                      isBot: boolean;
                    }) => (
                      <span key={p.slot} className="mr-md">
                        {p.slot}:{" "}
                        {!p.isBot && p.userId ? (
                          <Link
                            href={`/admin/pricewar/players/${p.userId}`}
                            className="text-primary hover:underline"
                          >
                            {p.userId.slice(0, 8)}…
                          </Link>
                        ) : (
                          "Bot"
                        )}
                      </span>
                    )
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="events">
            <TabsList>
              <TabsTrigger value="events">Events ({trace.events.length})</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions ({trace.submissions.length})
              </TabsTrigger>
              <TabsTrigger value="state">Canonical state</TabsTrigger>
              <TabsTrigger value="views">Player views</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-lg">
              <Card>
                <CardContent className="max-h-[480px] overflow-auto py-lg">
                  <pre className="text-xs">{JSON.stringify(trace.events, null, 2)}</pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="mt-lg">
              <Card>
                <CardContent className="max-h-[480px] overflow-auto py-lg">
                  <pre className="text-xs">
                    {JSON.stringify(trace.submissions, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="state" className="mt-lg">
              <Card>
                <CardContent className="max-h-[480px] overflow-auto py-lg">
                  <pre className="text-xs">{JSON.stringify(trace.state, null, 2)}</pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="views" className="mt-lg">
              <div className="grid gap-lg md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">View A</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-auto">
                    <pre className="text-xs">{JSON.stringify(trace.viewA, null, 2)}</pre>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">View B</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-auto">
                    <pre className="text-xs">{JSON.stringify(trace.viewB, null, 2)}</pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
