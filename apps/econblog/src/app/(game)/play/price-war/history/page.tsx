"use client";

import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "@/client/hooks/useUserProfile";
import { ProfileScreen } from "@/components/pricewar/screens/ProfileScreen";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";

export default function HistoryPage() {
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
    queryKey: ["pricewar", "rating", "coffee-shop", DEFAULT_MARGIN_PLAY_MODE],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricewar/rating/coffee-shop?playModeId=${DEFAULT_MARGIN_PLAY_MODE}`,
      );
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number; gamesPlayed: number }>;
    },
    enabled: isPaid,
  });

  const historyQuery = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  const profileQuery = useUserProfile();

  return (
    <MarginShellFrame contentPadding={18}>
      <ProfileScreen
        username={profileQuery.data?.username ?? "You"}
        avatarUrl={profileQuery.data?.avatarUrl ?? null}
        elo={isPaid ? (ratingQuery.data?.rating ?? null) : null}
        isPaid={isPaid}
        matches={historyQuery.data?.matches ?? []}
      />
    </MarginShellFrame>
  );
}
