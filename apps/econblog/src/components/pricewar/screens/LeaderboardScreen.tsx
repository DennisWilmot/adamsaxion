"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn, Segmented } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";

interface LeaderRow {
  rank: number;
  name: string;
  elo: number;
  record: string;
  streak: number;
  trend: number;
  you?: boolean;
}

const PLACEHOLDER: LeaderRow[] = [
  { rank: 1, name: "Aiko T.", elo: 1742, record: "142 · 38", streak: 6, trend: 18 },
  { rank: 2, name: "Dom V.", elo: 1681, record: "128 · 44", streak: -1, trend: -8 },
  { rank: 3, name: "Wren O.", elo: 1623, record: "111 · 52", streak: 2, trend: 5 },
  { rank: 4, name: "Sasha B.", elo: 1592, record: "98 · 51", streak: 4, trend: 12 },
  { rank: 5, name: "Marina K.", elo: 1284, record: "54 · 38", streak: 1, trend: 6 },
];

function TrendBadge({ v }: { v: number }) {
  return (
    <span
      className="num"
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: v > 0 ? CD.green : v < 0 ? CD.red : CD.ink3,
      }}
    >
      {v > 0 ? "↑" : v < 0 ? "↓" : "·"} {Math.abs(v)}
    </span>
  );
}

function StreakBadge({ v }: { v: number }) {
  const positive = v >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: positive ? CD.greenSoft : CD.redSoft,
        color: positive ? CD.green : CD.red,
      }}
    >
      {positive ? "W" : "L"}
      {Math.abs(v)}
    </span>
  );
}

export interface LeaderboardScreenProps {
  myElo: number | null;
  myRecord?: string;
}

export function LeaderboardScreen({ myElo, myRecord = "—" }: LeaderboardScreenProps) {
  const router = useRouter();
  const [scope, setScope] = useState("coffee");

  const rows: LeaderRow[] = [
    ...PLACEHOLDER,
    ...(myElo != null
      ? [
          {
            rank: 14,
            name: "You",
            elo: myElo,
            record: myRecord,
            streak: 0,
            trend: 0,
            you: true,
          },
        ]
      : []),
  ];

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm" onClick={() => router.push(priceWarPaths.lobby)}>
        ← Lobby
      </PillBtn>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: 16,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="tab">Ladder</div>
          <h1
            className="serif"
            style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: "italic" }}
          >
            Who&apos;s calling the prices.
          </h1>
        </div>
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: "coffee", label: "Coffee Shop" },
            { value: "global", label: "Global" },
          ]}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr 1fr",
          gap: 14,
          marginTop: 28,
          alignItems: "end",
        }}
        className="max-md:grid-cols-1"
      >
        {[rows[1], rows[0], rows[2]].filter(Boolean).map((r) => {
          if (!r) return null;
          const isFirst = r.rank === 1;
          return (
            <div
              key={r.rank}
              style={{
                background: isFirst ? CD.primarySoft : CD.cardstock,
                border: `1px solid ${isFirst ? CD.primary : CD.rule}`,
                borderRadius: 18,
                padding: "22px 20px",
                textAlign: "center",
                boxShadow: isFirst ? `0 0 0 3px ${CD.primarySoft}` : "none",
                transform: isFirst ? "translateY(-12px)" : "none",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isFirst ? CD.primary : CD.paper,
                  border: `2px solid ${isFirst ? CD.primary : CD.rule}`,
                  color: isFirst ? CD.paper : CD.ink,
                  fontFamily: "var(--font-cd-serif), serif",
                  fontStyle: "italic",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                }}
              >
                {r.rank}
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                {r.you ? (
                  <AvatarPlayer size={isFirst ? 72 : 56} ring={CD.primary} />
                ) : (
                  <AvatarOpponent size={isFirst ? 72 : 56} ring={isFirst ? CD.primary : CD.ink4} />
                )}
              </div>
              <div className="serif" style={{ fontSize: isFirst ? 22 : 18, color: CD.ink, marginTop: 10 }}>
                {r.name}
              </div>
              <div
                className="num serif"
                style={{ fontSize: isFirst ? 32 : 26, color: CD.ink, lineHeight: 1, marginTop: 4 }}
              >
                {r.elo.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: "0.08em", marginTop: 2 }}>
                {r.record}
              </div>
              <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 6 }}>
                <StreakBadge v={r.streak} />
                <TrendBadge v={r.trend} />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 28,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 100px 120px 80px 80px",
            padding: "12px 18px",
            background: CD.paperDeep,
            borderBottom: `1px solid ${CD.rule}`,
            fontSize: 11,
            color: CD.ink3,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span>Rank</span>
          <span>Player</span>
          <span>Elo</span>
          <span>Record</span>
          <span>Streak</span>
          <span>7d</span>
        </div>
        {rows.slice(3).map((r) => (
          <div
            key={r.rank}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px 120px 80px 80px",
              padding: "12px 18px",
              borderBottom: `1px solid ${CD.rule}`,
              alignItems: "center",
              background: r.you ? CD.primarySoft : "transparent",
            }}
          >
            <span className="num serif" style={{ fontSize: 18, color: CD.ink }}>
              {r.rank}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {r.you ? (
                <AvatarPlayer size={32} ring={CD.primary} />
              ) : (
                <AvatarOpponent size={32} />
              )}
              <span
                className="serif"
                style={{ fontSize: 18, color: CD.ink, fontStyle: r.you ? "italic" : "normal" }}
              >
                {r.name}
                {r.you && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: CD.primary,
                      color: CD.paper,
                      letterSpacing: "0.08em",
                      fontFamily: "var(--font-cd-body), sans-serif",
                    }}
                  >
                    YOU
                  </span>
                )}
              </span>
            </span>
            <span className="num" style={{ fontSize: 15, color: CD.ink, fontWeight: 600 }}>
              {r.elo.toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: CD.ink2 }} className="num">
              {r.record}
            </span>
            <span>
              <StreakBadge v={r.streak} />
            </span>
            <span>
              <TrendBadge v={r.trend} />
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <CoachBubble label="Prof. Aldo · Your climb">
          Full global ladder sync is coming — for now, climb Coffee Shop Blitz and watch your rating
          move.
        </CoachBubble>
      </div>
    </CafeDuelRoot>
  );
}
