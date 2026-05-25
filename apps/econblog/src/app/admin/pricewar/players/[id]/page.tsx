"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPlayerDebugPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("review");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const debugQuery = useQuery({
    queryKey: ["admin", "pricewar", "player", userId],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/admin/players/${userId}`);
      if (!res.ok) throw new Error("Failed to load player");
      return res.json();
    },
  });

  async function submitFlag() {
    setSubmitting(true);
    try {
      await fetch(`/api/pricewar/admin/players/${userId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, severity, notes }),
      });
      setReason("");
      setNotes("");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "pricewar", "player", userId],
      });
    } finally {
      setSubmitting(false);
    }
  }

  const data = debugQuery.data;

  return (
    <div className="mx-auto max-w-4xl space-y-xl p-xl">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/pricewar">← Price War admin</Link>
      </Button>

      {debugQuery.isLoading && (
        <p className="text-foreground-muted">Loading player…</p>
      )}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{data.profile.username}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              <p>ID: {data.profile.id}</p>
              <p>
                Level {data.profile.currentLevel} · {data.profile.totalXp} XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm text-sm">
              {data.ratings.length === 0 && (
                <p className="text-foreground-muted">No rated modes yet.</p>
              )}
              {data.ratings.map(
                (r: {
                  playModeId: string;
                  rating: number;
                  gamesPlayed: number;
                }) => (
                  <p key={r.playModeId}>
                    {r.playModeId}: {r.rating} ({r.gamesPlayed} games)
                  </p>
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              {data.matches.map(
                (m: {
                  matchId: string;
                  playModeId: string;
                  phase: string;
                  outcomeKind: string;
                  outcomeReason: string | null;
                  ratingDelta: number | null;
                }) => (
                  <div
                    key={m.matchId}
                    className="flex items-center justify-between rounded border border-border p-sm text-sm"
                  >
                    <span className="capitalize">
                      {m.playModeId} · {m.outcomeKind}
                      {m.outcomeReason ? ` (${m.outcomeReason})` : ""}
                      {m.ratingDelta != null && (
                        <span className="ml-sm text-foreground-muted">
                          Δ{m.ratingDelta}
                        </span>
                      )}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/pricewar/matches/${m.matchId}`}>Trace</Link>
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flag player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Input
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button disabled={submitting} onClick={submitFlag}>
                Add flag
              </Button>
              {data.flags?.length > 0 && (
                <div className="mt-lg space-y-sm text-xs text-foreground-muted">
                  {data.flags.map(
                    (f: { id: string; reason: string; severity: string; createdAt: string }) => (
                      <p key={f.id}>
                        [{f.severity}] {f.reason} — {new Date(f.createdAt).toLocaleString()}
                      </p>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
