"use client";

import { AvatarOpponent, AvatarPlayer } from "./avatars";
import { CoffeeBackdrop } from "./CoffeeBackdrop";
import { CashTicker, CashTrend } from "./CashTicker";
import { RoundDots } from "./Domain";
import { CD } from "./tokens";
import type { Opponent, Player } from "./types";

function formatMs(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export interface MatchBarProps {
  scenario?: string;
  round?: number;
  total?: number;
  timerMs?: number;
  timerLabel?: string;
  you: Player;
  opp: Opponent;
  forfeitSlot?: React.ReactNode;
}

export function MatchBar({
  scenario = "Coffee Shop · Downtown",
  round = 1,
  total = 8,
  timerMs,
  timerLabel = "until reveal",
  you,
  opp,
  forfeitSlot,
}: MatchBarProps) {
  const timer = timerMs != null ? formatMs(timerMs) : "—";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 18,
        background: CD.paperDeep,
        border: `1px solid ${CD.rule}`,
      }}
    >
      <CoffeeBackdrop opacity={0.07} height={140} />
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 24,
          padding: "18px 22px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AvatarPlayer size={64} ring={CD.primary} />
          <div>
            <div
              style={{
                fontSize: 11,
                color: CD.ink3,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              You
            </div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, color: CD.ink }}>
              {you.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <CashTicker value={you.cash} />
              {you.trend && you.trend.length >= 2 && <CashTrend points={you.trend} color={CD.ink} />}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <div
            style={{
              fontSize: 11,
              color: CD.ink3,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {scenario}
          </div>
          <div className="serif" style={{ fontSize: 32, color: CD.ink, lineHeight: 1, marginTop: 2 }}>
            Round <span className="num" style={{ fontSize: 30 }}>{round}</span>
            <span style={{ color: CD.ink3 }}> / {total}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <RoundDots total={total} current={round} />
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "3px 10px",
              borderRadius: 999,
              background: CD.paper,
              border: `1px solid ${CD.rule}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: CD.primary,
              }}
              className="cd-pulse"
            />
            <span className="mono" style={{ fontSize: 12, color: CD.ink2 }}>
              {timer}
            </span>
            <span style={{ fontSize: 11, color: CD.ink3 }}>{timerLabel}</span>
          </div>
          {forfeitSlot && <div style={{ marginTop: 10 }}>{forfeitSlot}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                color: CD.ink3,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Opponent
              {opp.isBot
                ? " · Bot"
                : opp.elo != null
                  ? ` · Elo ${opp.elo}`
                  : ""}
            </div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, color: CD.ink }}>
              {opp.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 12, color: CD.ink3 }}>their menu</span>
              <span className="num" style={{ fontSize: 22, color: CD.ink, fontWeight: 500 }}>
                {opp.price}¢
              </span>
              {opp.locked && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: CD.ink,
                    color: CD.paper,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 999,
                      background: CD.primary,
                    }}
                    className="cd-pulse"
                  />
                  Locked
                </span>
              )}
            </div>
          </div>
          <AvatarOpponent size={64} ring={CD.ink4} />
        </div>
      </div>
    </div>
  );
}
