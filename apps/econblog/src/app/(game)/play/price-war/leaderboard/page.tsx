"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardScreen } from "@/components/pricewar/screens/LeaderboardScreen";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";

type LeaderboardResponse = {
  available: boolean;
  reason: "rated_disabled" | null;
  canSeeOwnRank: boolean;
  title: string;
  playModeId: string;
  rows: Array<{
    rank: number;
    name: string;
    elo: number;
    isYou?: boolean;
  }>;
};

function emptyMessage(data: LeaderboardResponse | undefined, ratedEnabled: boolean): string {
  if (!ratedEnabled || data?.reason === "rated_disabled") {
    return "Rated ladder is not enabled yet.";
  }
  if (data?.available && data.rows.length === 0) {
    return "No rated games on this ladder yet. Play a match to appear here.";
  }
  return "No players on this ladder yet.";
}

export default function LeaderboardPage() {
  const [selectedMode, setSelectedMode] = useState(DEFAULT_MARGIN_PLAY_MODE);
  const ratedEnabled = isMarginRatedEnabledClient();

  const subscriptionQuery = useQuery({
    queryKey: ["user", "subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) return { subscription: { hasAccess: false } };
      return res.json();
    },
  });
  const isPaid = subscriptionQuery.data?.subscription?.hasAccess === true;

  const ladderQuery = useQuery({
    queryKey: ["pricewar", "leaderboard", "coffee-shop", selectedMode],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricewar/leaderboard?scenarioId=coffee-shop&playModeId=${selectedMode}`,
      );
      if (!res.ok) {
        return {
          available: false,
          reason: null,
          canSeeOwnRank: false,
          title: "Ladder",
          playModeId: selectedMode,
          rows: [],
        } satisfies LeaderboardResponse;
      }
      return res.json() as Promise<LeaderboardResponse>;
    },
    enabled: subscriptionQuery.isSuccess,
  });

  const data = ladderQuery.data;
  const showLadder = ratedEnabled && data?.available === true;
  const showOwnRankUpgrade = showLadder && !isPaid;

  return (
    <MarginShellFrame flat>
      <LeaderboardScreen
        title={data?.title ?? "Ladder"}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        isPaid={isPaid}
        rows={showLadder ? (data?.rows ?? []) : []}
        loading={ladderQuery.isLoading || subscriptionQuery.isLoading}
        available={showLadder}
        emptyMessage={emptyMessage(data, ratedEnabled)}
        showOwnRankUpgrade={showOwnRankUpgrade}
      />
    </MarginShellFrame>
  );
}
