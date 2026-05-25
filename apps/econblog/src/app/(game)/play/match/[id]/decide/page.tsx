"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COFFEE_SHOP_MOVES, getTutorialNarration } from "@adamsaxion/pricewar-engine";
import type { MoveDefinition, SubmittedMove } from "@adamsaxion/pricewar-types";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { useMatchSummary } from "@/client/pricewar/hooks/useMatchSummary";
import { getMatchEndPath } from "@/client/pricewar/match-routing";
import { TutorialNarrationCard } from "@/components/pricewar/tutorial/TutorialNarration";
import { MatchHeaderStrip } from "@/components/pricewar/shell/MatchHeaderStrip";
import { MatchLobbyScreen } from "@/components/pricewar/shell/MatchStatusOverlays";
import { MoveCard } from "@/components/pricewar/moves/MoveCard";
import { MoveInputDialog } from "@/components/pricewar/moves/MoveInputDialog";
import { DraftSlot } from "@/components/pricewar/decide/DraftSlot";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOMAINS } from "@adamsaxion/pricewar-types";

export default function DecidePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = params.id;
  const { data: view, isLoading } = useMatchView(matchId);
  const { data: summary } = useMatchSummary(matchId);
  const [draft, setDraft] = useState<SubmittedMove[]>([]);
  const [activeMove, setActiveMove] = useState<MoveDefinition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const movesByDomain = useMemo(
    () =>
      DOMAINS.map((domain) => ({
        domain,
        moves: COFFEE_SHOP_MOVES.filter((m) => m.domain === domain),
      })).filter((g) => g.moves.length > 0),
    []
  );

  function addMove(moveId: string, input: unknown) {
    if (draft.length >= 3) return;
    setDraft((prev) => [
      ...prev,
      {
        moveId: moveId as SubmittedMove["moveId"],
        input,
        draftedAt: new Date().toISOString(),
      },
    ]);
    setDialogOpen(false);
    setActiveMove(null);
  }

  function goToReview() {
    sessionStorage.setItem(`pricewar:draft:${matchId}`, JSON.stringify(draft));
    router.push(`/play/match/${matchId}/review`);
  }

  useEffect(() => {
    if (view?.phase === "completed") {
      router.replace(getMatchEndPath(matchId, view));
    }
  }, [view, matchId, router]);

  if (isLoading || !view) {
    return <p className="text-foreground-muted">Loading match…</p>;
  }

  const tutorialStep =
    view.playModeId === "tutorial"
      ? getTutorialNarration(view.market.currentRound)
      : undefined;

  if (view.phase === "waiting_for_opponent") {
    return (
      <div>
        <MatchHeaderStrip view={view} matchId={matchId} />
        <MatchLobbyScreen view={view} />
      </div>
    );
  }

  return (
    <div>
      {summary ? (
        <MatchHeaderStrip
          view={view}
          isRated={summary.isRated}
          ratingAtStart={summary.ratingAtStart}
          matchId={matchId}
        />
      ) : (
        <MatchHeaderStrip view={view} matchId={matchId} />
      )}

      {tutorialStep && <TutorialNarrationCard step={tutorialStep} />}

      <div className="grid gap-xl lg:grid-cols-[1fr_280px]">
        <Tabs defaultValue={movesByDomain[0]?.domain ?? "sales"}>
          <TabsList className="flex flex-wrap h-auto">
            {movesByDomain.map(({ domain }) => (
              <TabsTrigger key={domain} value={domain} className="capitalize">
                {domain}
              </TabsTrigger>
            ))}
          </TabsList>
          {movesByDomain.map(({ domain, moves }) => (
            <TabsContent key={domain} value={domain} className="mt-lg grid gap-md sm:grid-cols-2">
              {moves.map((move) => (
                <MoveCard
                  key={move.id}
                  move={move}
                  disabled={draft.length >= 3}
                  onSelect={() => {
                    setActiveMove(move);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <aside className="space-y-md">
          <h2 className="font-display text-lg font-bold">My picks</h2>
          {[0, 1, 2].map((i) => (
            <DraftSlot
              key={i}
              index={i}
              move={draft[i]}
              onRemove={(idx) => setDraft((prev) => prev.filter((_, j) => j !== idx))}
            />
          ))}
          <Button className="w-full" disabled={draft.length === 0} onClick={goToReview}>
            Review & lock {draft.length} move{draft.length === 1 ? "" : "s"}
          </Button>
        </aside>
      </div>

      <MoveInputDialog
        move={activeMove}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPrice={view.me.currentPrice}
        onConfirm={(input) => {
          if (activeMove) addMove(activeMove.id, input);
        }}
      />
    </div>
  );
}
