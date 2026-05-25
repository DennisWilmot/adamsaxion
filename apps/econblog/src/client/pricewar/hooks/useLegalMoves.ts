"use client";

import { useQuery } from "@tanstack/react-query";
import type { LegalMoveStatus } from "@adamsaxion/pricewar-engine";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";

export function useLegalMoves(matchId: string, draft: SubmittedMove[]) {
  const draftKey = draft.map((m) => m.moveId).join(",");

  return useQuery({
    queryKey: ["pricewar", "match", matchId, "legal-moves", draftKey],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/legal-moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moves: draft }),
      });
      if (!res.ok) throw new Error("Failed to load legal moves");
      const data = (await res.json()) as { moves: LegalMoveStatus[] };
      return new Map(data.moves.map((m) => [m.id, m]));
    },
    staleTime: 5_000,
  });
}
