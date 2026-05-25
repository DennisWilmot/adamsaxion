"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { MatchHeaderStrip } from "@/components/pricewar/shell/MatchHeaderStrip";
import { Card, CardContent } from "@/components/ui/card";

export default function WaitingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  useEffect(() => {
    const source = new EventSource(`/api/pricewar/match/${matchId}/events`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "round_resolved") {
          router.push(`/play/match/${matchId}/report/${payload.round}`);
        }
      } catch {
        // ignore heartbeat / malformed
      }
    };
    return () => source.close();
  }, [matchId, router]);

  if (!view) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <div>
      <MatchHeaderStrip view={view} matchId={matchId} />
      <Card className="bg-surface-raised">
        <CardContent className="py-3xl text-center">
          <p className="font-display text-xl font-bold">Your moves are locked</p>
          <p className="mt-md text-foreground-secondary">
            Waiting for the round to resolve…
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
