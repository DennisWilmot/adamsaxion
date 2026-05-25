"use client";

import { useQuery } from "@tanstack/react-query";
import { LeaderboardScreen } from "@/components/pricewar/screens/LeaderboardScreen";

export default function LeaderboardPage() {
  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", "blitz"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/rating/coffee-shop?playModeId=blitz");
      if (!res.ok) return { rating: null, gamesPlayed: 0 };
      return res.json() as Promise<{ rating: number; gamesPlayed: number }>;
    },
  });

  const winsQuery = useQuery({
    queryKey: ["pricewar", "history"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history");
      if (!res.ok) return { matches: [] };
      return res.json();
    },
  });

  const completed = (winsQuery.data?.matches ?? []).filter(
    (m: { phase: string }) => m.phase === "completed"
  );
  const wins = completed.filter((m: { outcomeKind: string }) => m.outcomeKind === "win").length;
  const losses = completed.length - wins;
  const myRecord =
    ratingQuery.data?.gamesPlayed != null
      ? `${wins} · ${losses}`
      : "—";

  return (
    <LeaderboardScreen myElo={ratingQuery.data?.rating ?? null} myRecord={myRecord} />
  );
}
