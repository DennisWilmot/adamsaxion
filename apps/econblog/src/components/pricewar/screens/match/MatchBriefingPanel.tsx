"use client";

import { useQuery } from "@tanstack/react-query";
import type { MarginMatchView } from "@/client/pricewar/match-view-types";
import { CoachBubble } from "@/components/pricewar/design-system/CoachBubble";
import { CD } from "@/components/pricewar/design-system/tokens";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";
import { SquareBtn } from "@/components/pricewar/shell/PriceWarShellChrome";
import { ActionCard } from "@/components/pricewar/shell/ActionCard";

export function BriefingControls({
  view,
  onBegin,
  starting = false,
}: {
  view: MarginMatchView;
  onBegin: () => void;
  starting?: boolean;
}) {
  const subscriptionQuery = useQuery({
    queryKey: ["user", "subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) return { subscription: { hasAccess: false } };
      return res.json();
    },
  });

  const isPaid = subscriptionQuery.data?.subscription?.hasAccess === true;

  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", view.scenarioId, view.playModeId],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricewar/rating/${view.scenarioId}?playModeId=${encodeURIComponent(view.playModeId)}`
      );
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number; gamesPlayed: number }>;
    },
    enabled: isPaid,
  });

  const opp = view.opponent.displayName;
  const firstName = opp.split(" ")[0] ?? opp;
  const myElo = isPaid ? (ratingQuery.data?.rating ?? null) : null;
  const isRated =
    isMarginRatedEnabledClient() && view.playModeId !== "tutorial" && isPaid;
  const opponentElo = isRated ? (view.opponentRating ?? null) : null;
  const showClock = view.playModeId !== "tutorial";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <ActionCard eyebrow={`Briefing · Round ${view.market.currentRound}`} title={`You've drawn ${firstName}.`}>
        <p style={{ color: CD.ink2, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {view.market.totalRounds} rounds
          {isRated ? " · Ranked match" : " · Unrated match"}
          {isRated && myElo != null ? (
            <>
              {" "}
              · Your Elo{" "}
              <span className="num" style={{ color: CD.ink, fontWeight: 700 }}>
                {myElo.toLocaleString()}
              </span>
            </>
          ) : null}
          {isRated && opponentElo != null ? (
            <>
              {" "}
              · {firstName}&apos;s Elo{" "}
              <span className="num" style={{ color: CD.ink, fontWeight: 700 }}>
                {opponentElo.toLocaleString()}
              </span>
            </>
          ) : null}
          .
        </p>
        {showClock && (
          <p style={{ color: CD.ink3, fontSize: 12, lineHeight: 1.45, margin: "10px 0 0" }}>
            Your match clock is already running — read the board, then begin when ready.
          </p>
        )}
        <div style={{ marginTop: 14 }}>
          <SquareBtn
            variant="solid"
            color={CD.ink}
            size="lg"
            full
            onClick={onBegin}
            disabled={starting}
          >
            {starting ? "Starting…" : "Begin Round 1 →"}
          </SquareBtn>
        </div>
      </ActionCard>

      <CoachBubble label="Prof. Aldo · The bell">
        Discount-heavy opponents often open cheap. Do not panic-match their price. Read the room,
        then commit.
      </CoachBubble>
    </div>
  );
}
