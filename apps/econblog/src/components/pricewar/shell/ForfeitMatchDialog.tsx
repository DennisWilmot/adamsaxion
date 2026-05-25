"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { priceWarPaths } from "@/lib/games/routes";
import { usePriceWarErrorOptional } from "@/components/pricewar/screens/PriceWarErrorModal";

export function ForfeitMatchDialog({
  matchId,
  disabled,
}: {
  matchId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const errorModal = usePriceWarErrorOptional();

  async function confirmForfeit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pricewar/match/${matchId}/forfeit`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        if (errorModal) {
          errorModal.showApiError(data, "Could not forfeit match");
        }
        return;
      }
      router.push(priceWarPaths.match.postmatch(matchId));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || loading}>
          Forfeit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Forfeit this match?</AlertDialogTitle>
          <AlertDialogDescription>
            Your opponent wins immediately. Rated matches may affect your rating.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep playing</AlertDialogCancel>
          <AlertDialogAction onClick={confirmForfeit} disabled={loading}>
            Forfeit match
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
