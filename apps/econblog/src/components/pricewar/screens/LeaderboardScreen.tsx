"use client";

import Link from "next/link";
import { UserPortrait } from "../design-system/UserPortrait";
import { CD } from "../design-system/tokens";
import { Eyebrow, MT } from "../design-system/margin-kit";
import { ModePicker } from "@/components/pricewar/shell/ModePicker";

export type LeaderboardRow = {
  rank: number;
  name: string;
  avatarUrl?: string | null;
  elo: number;
  isYou?: boolean;
};

export interface LeaderboardScreenProps {
  title: string;
  selectedMode: string;
  onSelectMode: (modeId: string) => void;
  isPaid: boolean;
  rows: LeaderboardRow[];
  loading?: boolean;
  available: boolean;
  emptyMessage: string;
  showOwnRankUpgrade?: boolean;
}

export function LeaderboardScreen({
  title,
  selectedMode,
  onSelectMode,
  isPaid,
  rows,
  loading = false,
  available,
  emptyMessage,
  showOwnRankUpgrade = false,
}: LeaderboardScreenProps) {
  const showTable = loading || available;

  return (
    <div className="cd">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>Margin ladder</Eyebrow>
          <h1
            className="serif"
            style={{
              fontSize: 30,
              color: MT.ink,
              fontWeight: 700,
              marginTop: 4,
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 14, color: MT.ink2, marginTop: 6 }}>Coffee Shop · ranked by Elo</p>
        </div>
        <ModePicker selectedMode={selectedMode} onSelectMode={onSelectMode} isPaid={isPaid} />
      </div>

      {showOwnRankUpgrade && (
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 14, color: MT.ink2 }}>
          Upgrade to see your current ranking on this ladder.{" "}
          <Link href="/subscribe" style={{ color: MT.blue, fontWeight: 600, textDecoration: "none" }}>
            Upgrade →
          </Link>
        </p>
      )}

      {showTable && (
        <div style={{ marginTop: 20, borderTop: `1px solid ${MT.rule}` }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr 88px",
              padding: "10px 0",
              borderBottom: `1px solid ${MT.rule}`,
              fontSize: 11,
              color: MT.ink3,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: "right" }}>Elo</span>
          </div>

          {loading ? (
            <div style={{ padding: "24px 0", fontSize: 14, color: MT.ink3, textAlign: "center" }}>
              Loading ladder…
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "24px 0", fontSize: 14, color: MT.ink2, textAlign: "center" }}>
              {emptyMessage}
            </div>
          ) : (
            rows.map((r, index) => (
              <div
                key={`${r.rank}-${r.name}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr 88px",
                  padding: "11px 0",
                  alignItems: "center",
                  borderBottom: index < rows.length - 1 ? `1px solid ${MT.rule}` : undefined,
                  background: r.isYou ? MT.blueSoft : "transparent",
                }}
              >
                <span className="num serif" style={{ fontSize: 17, color: MT.ink }}>
                  {r.rank}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <UserPortrait
                    avatarUrl={r.avatarUrl}
                    isBot={!r.isYou}
                    kind={r.isYou ? "player" : "opponent"}
                    size={34}
                    ring={r.isYou ? CD.primary : undefined}
                  />
                  <span
                    className="serif"
                    style={{
                      fontSize: 16,
                      color: MT.ink,
                      fontStyle: r.isYou ? "italic" : "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                    {r.isYou && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: MT.blue,
                          color: "#fff",
                          letterSpacing: "0.08em",
                          fontFamily: "var(--font-cd-body), sans-serif",
                          fontStyle: "normal",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </span>
                </span>
                <span
                  className="num"
                  style={{ fontSize: 14, color: MT.ink, fontWeight: 600, textAlign: "right" }}
                >
                  {r.elo.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {!showTable && (
        <p style={{ marginTop: 20, fontSize: 14, color: MT.ink2, textAlign: "center" }}>{emptyMessage}</p>
      )}
    </div>
  );
}
