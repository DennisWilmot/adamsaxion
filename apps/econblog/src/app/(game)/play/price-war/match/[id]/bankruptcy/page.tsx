"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import { BankruptcyScreen } from "@/components/pricewar/screens/BankruptcyScreen";

export default function BankruptcyPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  const summaryQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: view?.phase === "completed",
  });

  if (!view) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <BankruptcyScreen
      view={view}
      ratingDelta={summaryQuery.data?.ratingDelta ?? null}
      ratingAfter={summaryQuery.data?.ratingAfter ?? null}
    />
  );
}
