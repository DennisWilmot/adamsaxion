"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "@adamsaxion/pricewar-engine";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { getMatchEndPath } from "@/client/pricewar/match-routing";
import { MatchHeaderStrip } from "@/components/pricewar/shell/MatchHeaderStrip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);
  const [draft, setDraft] = useState<SubmittedMove[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`pricewar:draft:${matchId}`);
    if (raw) setDraft(JSON.parse(raw) as SubmittedMove[]);
  }, [matchId]);

  async function lockIn() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pricewar/match/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moves: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Submit failed");
        return;
      }
      sessionStorage.removeItem(`pricewar:draft:${matchId}`);
      if (data.resolved) {
        router.push(
          `/play/match/${matchId}/report/${data.resolvedRound ?? view?.market.currentRound ?? 1}`
        );
      } else if (data.phase === "completed") {
        const viewRes = await fetch(`/api/pricewar/match/${matchId}/view`);
        if (viewRes.ok) {
          const freshView = await viewRes.json();
          router.push(getMatchEndPath(matchId, freshView));
        } else {
          router.push(`/play/match/${matchId}/postmatch`);
        }
      } else {
        router.push(`/play/match/${matchId}/waiting`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-xl">
      {view && <MatchHeaderStrip view={view} />}

      <Card className="bg-surface-raised">
        <CardHeader>
          <CardTitle>Review your moves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          {draft.length === 0 ? (
            <p className="text-foreground-muted">No moves drafted.</p>
          ) : (
            draft.map((move, i) => {
              const def = MOVE_BY_ID.get(move.moveId);
              return (
                <div key={i} className="rounded-md border border-border p-md">
                  <p className="font-medium">{def?.name ?? move.moveId}</p>
                  <p className="text-sm text-foreground-secondary">{def?.description}</p>
                  <p className="mt-sm text-xs text-foreground-muted">
                    {JSON.stringify(move.input)}
                  </p>
                </div>
              );
            })
          )}

          <div className="flex flex-wrap gap-md pt-md">
            <Button variant="outline" onClick={() => router.push(`/play/match/${matchId}/decide`)}>
              Back to edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={draft.length === 0 || submitting}>
                  Lock in {draft.length} move{draft.length === 1 ? "" : "s"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Lock in your moves?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You cannot change these moves after locking in. Your opponent will not see
                    hidden moves until the round resolves.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={lockIn}>Lock in</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
