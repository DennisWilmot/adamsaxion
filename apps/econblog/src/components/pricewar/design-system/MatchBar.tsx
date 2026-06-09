"use client";

import { AvatarOpponent, AvatarPlayer } from "./avatars";
import { UserPortrait } from "./UserPortrait";
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
  compact?: boolean;
}

export function MatchBar({
  scenario = "Coffee Shop · Downtown",
  round = 1,
  total = 8,
  timerMs,
  timerLabel = "left this match",
  you,
  opp,
  forfeitSlot,
  compact = false,
}: MatchBarProps) {
  const timer = timerMs != null ? formatMs(timerMs) : "—";
  const avatarSize = compact ? 52 : 64;
  const nameSize = compact ? 22 : 26;
  const roundSize = compact ? 26 : 32;
  const pad = compact ? "12px 18px" : "18px 22px";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: compact ? 14 : 18,
        background: CD.paperDeep,
        border: `1px solid ${CD.rule}`,
        flexShrink: 0,
      }}
    >
      <CoffeeBackdrop opacity={0.07} height={compact ? 100 : 140} />
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: compact ? 16 : 24,
          padding: pad,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14 }}>
          <UserPortrait avatarUrl={you.avatarUrl} size={avatarSize} ring={CD.primary} />
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
            <div className="serif" style={{ fontSize: nameSize, lineHeight: 1.05, color: CD.ink }}>
              {you.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: compact ? 4 : 6 }}>
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
          <div className="serif" style={{ fontSize: roundSize, color: CD.ink, lineHeight: 1, marginTop: 2 }}>
            Round <span className="num" style={{ fontSize: roundSize - 2 }}>{round}</span>
            <span style={{ color: CD.ink3 }}> / {total}</span>
          </div>
          <div style={{ marginTop: compact ? 4 : 8 }}>
            <RoundDots total={total} current={round} />
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: compact ? 6 : 10,
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

        <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14, justifyContent: "flex-end" }}>
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
              {opp.elo != null ? ` · Elo ${opp.elo}` : ""}
            </div>
            <div className="serif" style={{ fontSize: nameSize, lineHeight: 1.05, color: CD.ink }}>
              {opp.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: compact ? 4 : 6,
              }}
            >
              <span style={{ fontSize: 12, color: CD.ink3 }}>their price</span>
              <span className="num" style={{ fontSize: compact ? 18 : 22, color: CD.ink, fontWeight: 500 }}>
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
          <UserPortrait
            avatarUrl={opp.avatarUrl}
            isBot={opp.isBot}
            kind="opponent"
            size={avatarSize}
            ring={CD.ink4}
          />
        </div>
      </div>
    </div>
  );
}
