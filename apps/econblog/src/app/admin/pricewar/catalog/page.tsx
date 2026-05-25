"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminMoveCatalogPage() {
  const catalogQuery = useQuery({
    queryKey: ["admin", "pricewar", "move-catalog"],
    queryFn: async () => {
      const res = await fetch("/api/pricewar/admin/move-catalog");
      if (!res.ok) throw new Error("Failed to load catalog");
      return res.json();
    },
  });

  const moves = catalogQuery.data?.moves ?? [];
  const totalPicks = catalogQuery.data?.totalPicks ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-xl p-xl">
      <div className="flex flex-wrap items-center gap-md">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar">← Price War admin</Link>
        </Button>
        <h1 className="font-display text-2xl font-bold">Move catalog</h1>
        <Badge variant="secondary">Read-only</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {moves.length} moves · {totalPicks.toLocaleString()} total picks logged
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {catalogQuery.isLoading && (
            <p className="text-sm text-foreground-muted">Loading…</p>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground-muted">
                <th className="py-sm pr-md">Move</th>
                <th className="py-sm pr-md">Domain</th>
                <th className="py-sm pr-md">Visibility</th>
                <th className="py-sm pr-md text-right">Picks</th>
                <th className="py-sm text-right">Matches</th>
              </tr>
            </thead>
            <tbody>
              {moves.map(
                (m: {
                  id: string;
                  name: string;
                  domain: string;
                  visibility: string;
                  pickCount: number;
                  matchCount: number;
                }) => (
                  <tr key={m.id} className="border-b border-border-subtle">
                    <td className="py-sm pr-md">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-foreground-muted">{m.id}</p>
                    </td>
                    <td className="py-sm pr-md capitalize">{m.domain}</td>
                    <td className="py-sm pr-md">{m.visibility}</td>
                    <td className="py-sm pr-md text-right">{m.pickCount}</td>
                    <td className="py-sm text-right">{m.matchCount}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
