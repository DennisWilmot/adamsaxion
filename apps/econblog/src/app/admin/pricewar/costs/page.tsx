"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCostsPage() {
  const costsQuery = useQuery({
    queryKey: ["admin", "pricewar", "costs", "extended"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/admin/costs?extended=1");
      if (!res.ok) throw new Error("Failed to load costs");
      return res.json();
    },
  });

  const data = costsQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-xl p-xl">
      <div className="flex flex-wrap items-center gap-md">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar">← Price War admin</Link>
        </Button>
        <h1 className="font-display text-2xl font-bold">LLM spend</h1>
      </div>

      {data?.globalCapExceeded && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Global daily LLM cap exceeded</AlertTitle>
          <AlertDescription>
            Today&apos;s spend (${data.todayTotalUsd.toFixed(2)}) is above the global cap of $
            {data.globalDailyCapUsd.toFixed(2)} (PRICEWAR_COACH_GLOBAL_DAILY_USD). New AI coach
            calls fall back to templates until UTC midnight.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-lg md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today (UTC)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {costsQuery.isLoading && <p className="text-foreground-muted">Loading…</p>}
            {data && (
              <>
                <p className="text-2xl font-bold">${data.todayTotalUsd.toFixed(4)}</p>
                <p className="text-foreground-muted">{data.todayCalls} API calls</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By feature (today)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-sm text-sm">
            {data?.byFeature?.map(
              (row: { feature: string; totalUsd: number; calls: number }) => (
                <p key={row.feature}>
                  {row.feature}: <strong>${row.totalUsd.toFixed(4)}</strong> ({row.calls})
                </p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-sm text-sm">
          {data?.dailyLast7Days?.map(
            (row: { day: string; totalUsd: number; calls: number }) => (
              <p key={row.day} className="flex justify-between">
                <span>{row.day}</span>
                <span>
                  ${row.totalUsd.toFixed(4)} ({row.calls} calls)
                </span>
              </p>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top users today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md text-sm">
          {(data?.topUsersToday ?? []).length === 0 && (
            <p className="text-foreground-muted">No user-attributed spend today.</p>
          )}
          {data?.topUsersToday?.map(
            (row: {
              userId: string;
              username: string | null;
              totalUsd: number;
              calls: number;
            }) => (
              <div key={row.userId} className="flex flex-wrap items-center justify-between gap-sm">
                <Link
                  href={`/admin/pricewar/players/${row.userId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.username ?? row.userId.slice(0, 8)}
                </Link>
                <span>
                  ${row.totalUsd.toFixed(4)} ({row.calls})
                </span>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
