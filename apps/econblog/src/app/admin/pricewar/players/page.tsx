"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminPlayersSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const searchQuery = useQuery({
    queryKey: ["admin", "pricewar", "players", "search", submitted],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricewar/admin/players/search?q=${encodeURIComponent(submitted)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: submitted.length >= 2,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-xl p-xl">
      <div className="flex flex-wrap items-center gap-md">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricewar">← Price War admin</Link>
        </Button>
        <h1 className="font-display text-2xl font-bold">Find player</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search by username or user ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          <form
            className="flex gap-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(query.trim());
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="username or UUID"
            />
            <Button type="submit" disabled={query.trim().length < 2}>
              Search
            </Button>
          </form>

          {searchQuery.isLoading && (
            <p className="text-sm text-foreground-muted">Searching…</p>
          )}

          {submitted.length >= 2 && !searchQuery.isLoading && (
            <ul className="space-y-sm">
              {(searchQuery.data?.players ?? []).length === 0 ? (
                <li className="text-sm text-foreground-muted">No players found.</li>
              ) : (
                searchQuery.data?.players.map((p: { id: string; username: string }) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/pricewar/players/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      {p.username}
                    </Link>
                    <span className="ml-sm text-xs text-foreground-muted">{p.id}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
