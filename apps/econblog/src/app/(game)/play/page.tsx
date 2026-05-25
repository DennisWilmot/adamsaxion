"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAY_MODES } from "@adamsaxion/pricewar-engine";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOBBY_PLAY_MODES = PLAY_MODES.filter((mode) => mode.id !== "blitz-e2e");

export default function PlayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const subscriptionQuery = useQuery({
    queryKey: ["user", "subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) return { subscription: { hasAccess: false } };
      return res.json();
    },
  });

  const isPaid = subscriptionQuery.data?.subscription?.hasAccess === true;

  const historyQuery = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  async function startVsBot(playModeId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pricewar/match/vs-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "coffee-shop",
          playModeId,
          botPersonalityId: "bot.budget",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Could not start match");
        return;
      }
      router.push(`/play/match/${data.matchId}/decide`);
    } finally {
      setLoading(false);
    }
  }

  async function findHumanMatch(playModeId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pricewar/matchmaking/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: "coffee-shop", playModeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Could not join queue");
        return;
      }
      if (data.matched && data.matchId) {
        router.push(`/play/match/${data.matchId}/decide`);
        return;
      }
      router.push(`/play/queue?mode=${playModeId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2xl">
      <section>
        <h1 className="font-display text-3xl font-bold text-foreground">The Price War</h1>
        <p className="mt-md max-w-2xl text-foreground-secondary">
          Turn-based economics strategy. Pick up to 3 moves per round, outmaneuver your opponent,
          and learn by playing.
        </p>
      </section>

      <section className="grid gap-lg md:grid-cols-3">
        {LOBBY_PLAY_MODES.map((mode) => {
          const locked = mode.id === "rapid" && !isPaid;
          return (
          <Card key={mode.id} className="bg-surface-raised">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {mode.label}
                {mode.id === "rapid" && !isPaid && <Badge variant="secondary">Paid</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-sm text-foreground-muted">{mode.shortLabel}</p>
              <Button
                className="w-full"
                disabled={loading || locked}
                onClick={() =>
                  mode.id === "tutorial"
                    ? router.push("/play/tutorial")
                    : startVsBot(mode.id)
                }
              >
                {mode.id === "tutorial" ? "Start tutorial" : "Play vs bot"}
              </Button>
              {mode.id !== "tutorial" && (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={loading || locked}
                  onClick={() => findHumanMatch(mode.id)}
                >
                  Find human match
                </Button>
              )}
              {locked && (
                <p className="text-xs text-foreground-muted">
                  Upgrade to play Rapid.{" "}
                  <Link href="/subscribe" className="text-primary underline">
                    Subscribe
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        );
        })}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Your matches</h2>
        <div className="mt-lg space-y-md">
          {(historyQuery.data?.matches ?? []).length === 0 ? (
            <Card className="bg-surface-raised">
              <CardContent className="py-xl text-center text-foreground-muted">
                No matches yet. Start a Blitz game above.
              </CardContent>
            </Card>
          ) : (
            historyQuery.data?.matches.map(
              (m: {
                matchId: string;
                phase: string;
                playModeId: string;
                updatedAt: string;
                ratingDelta: number | null;
              }) => (
                <Card key={m.matchId} className="bg-surface-raised">
                  <CardContent className="flex items-center justify-between py-lg">
                    <div>
                      <p className="font-medium capitalize">{m.playModeId}</p>
                      <p className="text-sm text-foreground-muted">Phase: {m.phase}</p>
                      {m.ratingDelta !== null && m.ratingDelta !== undefined && (
                        <p
                          className={`text-sm ${m.ratingDelta >= 0 ? "text-success" : "text-error"}`}
                        >
                          Rating {m.ratingDelta >= 0 ? "+" : ""}
                          {m.ratingDelta}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/play/match/${m.matchId}/decide`}>Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            )
          )}
        </div>
      </section>
    </div>
  );
}
