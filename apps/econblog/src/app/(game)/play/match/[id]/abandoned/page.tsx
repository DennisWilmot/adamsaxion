"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";

export default function AbandonedPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  const reason =
    view?.outcome.kind === "win" && view.outcome.reason === "forfeit_on_timeout"
      ? "Your clock expired twice — the match was forfeited."
      : "The match ended because a player abandoned or disconnected.";

  return (
    <Card className="mx-auto max-w-lg bg-surface-raised">
      <CardHeader>
        <CardTitle>Match forfeited</CardTitle>
      </CardHeader>
      <CardContent className="space-y-lg">
        <p className="text-foreground-secondary">{reason}</p>
        <Button asChild>
          <Link href="/play/history">View history</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/play">Back to lobby</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
