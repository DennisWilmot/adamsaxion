"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function TutorialStartPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const res = await fetch("/api/pricewar/match/vs-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "coffee-shop",
          playModeId: "tutorial",
        }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.message ?? "Could not start tutorial");
        return;
      }
      router.replace(`/play/match/${data.matchId}/decide`);
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <Card className="mx-auto max-w-lg bg-surface-raised">
        <CardContent className="py-2xl text-center text-error">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg bg-surface-raised">
      <CardContent className="py-3xl text-center">
        <p className="font-display text-xl font-bold">Starting tutorial…</p>
        <p className="mt-md text-sm text-foreground-muted">
          A guided match against a scripted opponent. No clock, no rating impact.
        </p>
      </CardContent>
    </Card>
  );
}
