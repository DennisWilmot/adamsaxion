"use client";

import { useQuery } from "@tanstack/react-query";
import { ProfileScreen } from "@/components/pricewar/screens/ProfileScreen";

export default function HistoryPage() {
  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", "blitz"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/rating/coffee-shop?playModeId=blitz");
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number; gamesPlayed: number }>;
    },
  });

  const historyQuery = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  return (
    <ProfileScreen
      elo={ratingQuery.data?.rating ?? null}
      matches={historyQuery.data?.matches ?? []}
    />
  );
}
