"use client";

import { useEffect, useState } from "react";

interface Leader {
  rank: number;
  username: string;
  totalXp: number;
  currentLevel: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50")
      .then((r) => r.json())
      .then((data) => setLeaders(data.leaders ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[48rem] mx-auto px-xl py-3xl">
      <div className="mb-3xl">
        <h1 className="font-display font-bold text-3xl text-foreground mb-sm">
          Leaderboard
        </h1>
        <p className="font-body text-base text-foreground-secondary">
          Ranked by total XP earned across all lessons.
        </p>
      </div>

      {loading ? (
        <div className="py-5xl text-center">
          <p className="font-body text-foreground-muted animate-pulse">
            Loading rankings...
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-surface-raised overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[3rem_1fr_4rem_5rem] gap-md px-xl py-md border-b border-border bg-surface-sunken">
            <span className="font-body text-xs font-semibold tracking-widest uppercase text-foreground-muted">
              #
            </span>
            <span className="font-body text-xs font-semibold tracking-widest uppercase text-foreground-muted">
              User
            </span>
            <span className="font-body text-xs font-semibold tracking-widest uppercase text-foreground-muted text-right">
              Lvl
            </span>
            <span className="font-body text-xs font-semibold tracking-widest uppercase text-foreground-muted text-right">
              XP
            </span>
          </div>

          {/* Rows */}
          {leaders.map((leader) => (
            <div
              key={`${leader.rank}-${leader.username}`}
              className={`grid grid-cols-[3rem_1fr_4rem_5rem] gap-md px-xl py-md items-center border-b border-border-subtle last:border-b-0 ${
                leader.rank <= 3
                  ? "bg-gold-subtle/40"
                  : "hover:bg-surface-sunken/50"
              } transition-colors`}
            >
              <span
                className={`font-display font-bold text-base tabular-nums ${
                  leader.rank <= 3
                    ? "text-gold"
                    : "text-foreground-muted"
                }`}
              >
                {leader.rank}
              </span>
              <span className="font-body text-sm font-medium text-foreground truncate">
                {leader.username}
              </span>
              <span className="font-body text-sm text-foreground-muted text-right tabular-nums">
                {leader.currentLevel}
              </span>
              <span className="font-display font-semibold text-sm text-gold text-right tabular-nums">
                {leader.totalXp.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
