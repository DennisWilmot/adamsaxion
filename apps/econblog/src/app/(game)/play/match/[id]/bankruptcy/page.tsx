"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";

export default function BankruptcyPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: view } = useMatchView(matchId);

  return (
    <Card className="mx-auto max-w-lg bg-surface-raised">
      <CardHeader>
        <CardTitle className="text-error">Bankruptcy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-lg">
        <p className="text-foreground-secondary">
          Your shop ran out of cash for two consecutive rounds. In The Price War,
          liquidity matters as much as pricing — you cannot spend your way out of
          a hole without revenue to match.
        </p>
        {view && (
          <p className="text-sm text-foreground-muted">
            Final cash: ${view.me.cash.toLocaleString()}
          </p>
        )}
        <Button asChild>
          <Link href="/play">Back to lobby</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
