"use client";

import Link from "next/link";
import { UserPortrait } from "@/components/pricewar/design-system/UserPortrait";
import { MT } from "@/components/pricewar/design-system/margin-kit";
import { MARGIN_GAME_NAME, priceWarPaths } from "@/lib/games/routes";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";

/** Margin wordmark — sits beside shell tabs (Showdown-style). */
export function MarginShellWordmark() {
  return (
    <Link
      href={priceWarPaths.lobby}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: MT.blue,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 2, background: "#fff" }} />
      </span>
      <span
        className="serif"
        style={{ fontSize: 17, fontWeight: 700, color: MT.ink, letterSpacing: "-0.02em" }}
      >
        {MARGIN_GAME_NAME}
      </span>
    </Link>
  );
}

export function ShellEloChip({
  elo,
  eloTrend,
  avatarUrl,
}: {
  elo: number;
  eloTrend?: string | null;
  avatarUrl?: string | null | undefined;
}) {
  if (!isMarginRatedEnabledClient()) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 6px 5px 11px",
        borderRadius: 999,
        border: `1px solid ${MT.rule}`,
        background: MT.card,
      }}
    >
      <div style={{ lineHeight: 1 }}>
        <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: MT.ink }}>
          {elo.toLocaleString()}
        </span>
        {eloTrend && (
          <span className="mono" style={{ fontSize: 11, color: MT.green, marginLeft: 5 }}>
            {eloTrend}
          </span>
        )}
      </div>
      <UserPortrait avatarUrl={avatarUrl} size={28} />
    </div>
  );
}
