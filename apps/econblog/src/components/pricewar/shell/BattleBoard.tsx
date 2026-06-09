"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { UserPortrait } from "@/components/pricewar/design-system/UserPortrait";
import {
  Eyebrow,
  MT,
  Price,
  StatusDot,
} from "@/components/pricewar/design-system/margin-kit";
import { useLiveClockMs } from "@/client/pricewar/hooks/useLiveClockMs";
import { useGameAudio } from "@/client/pricewar/audio/useGameAudio";

const CLOCK_DANGER_MS = 6_000;

type BoardStatus = "connecting" | "thinking" | "locked" | "revealed";

const STATUS_TEXT: Record<BoardStatus, string> = {
  connecting: "○ Connecting…",
  thinking: "○ Thinking…",
  locked: "● Locked in",
  revealed: "● Revealed",
};

function deriveStatuses(view: PlayerView, reveal: boolean): { you: BoardStatus; opp: BoardStatus } {
  if (reveal) {
    return { you: "revealed", opp: "revealed" };
  }
  if (view.phase === "waiting_for_opponent") {
    return { you: "connecting", opp: "connecting" };
  }
  if (view.phase === "briefing") {
    return { you: "thinking", opp: "thinking" };
  }
  if (view.phase === "resolving") {
    return {
      you: view.meHasLocked ? "locked" : "thinking",
      opp: view.opponentHasLocked ? "locked" : "thinking",
    };
  }
  if (view.phase === "decide") {
    return {
      you: view.meHasLocked ? "locked" : "thinking",
      opp: view.opponentHasLocked ? "locked" : "thinking",
    };
  }
  // Round is resolved but not yet flipped face-up (the anticipation dwell before
  // a reveal). Both sides have committed — show "locked", not "thinking", so it
  // never reads like the match jumped back to deciding.
  if (view.phase === "report" || view.phase === "completed") {
    return { you: "locked", opp: "locked" };
  }
  return { you: "thinking", opp: "thinking" };
}

function capacityPct(view: PlayerView, reveal: boolean): number | null {
  if (!reveal) return null;
  return Math.min(100, Math.max(8, view.me.staffCount * 22));
}

function BoardSide({
  name,
  avatar,
  you,
  status,
  price,
  cap,
  reveal,
}: {
  name: string;
  avatar: ReactNode;
  you?: boolean;
  status: BoardStatus;
  price: number;
  cap: number | null;
  reveal: boolean;
}) {
  const statusColor =
    status === "locked" || status === "revealed" ? MT.green : MT.ink3;
  const showThinkingDots = status === "thinking";

  return (
    <div style={{ flex: 1, padding: "4px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {avatar}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: MT.ink }}>{name}</span>
            {you && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: MT.blue,
                  background: MT.blueSoft,
                  padding: "2px 6px",
                  borderRadius: 5,
                }}
              >
                YOU
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: statusColor,
              fontWeight: 600,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {showThinkingDots ? (
              <span style={{ display: "inline-flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="mtq-dot"
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 99,
                      background: MT.ink3,
                    }}
                  />
                ))}
              </span>
            ) : null}
            {STATUS_TEXT[status]}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Eyebrow>Their price</Eyebrow>
          <div style={{ marginTop: 2 }}>
            {reveal ? (
              <Price v={price} size={28} color={MT.ink} />
            ) : (
              <span
                className="mono"
                style={{
                  fontSize: 28,
                  color: MT.ink4,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                }}
              >
                — —
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Eyebrow>Capacity</Eyebrow>
          <div className="mono" style={{ fontSize: 15, marginTop: 2, color: MT.ink2 }}>
            {cap != null ? `${cap}%` : "·"}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 99,
          background: MT.ruleSoft,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${cap ?? 0}%`,
            background: you ? MT.blue : MT.ink4,
            borderRadius: 99,
            transition: reveal ? "width .6s ease" : "none",
          }}
        />
      </div>
    </div>
  );
}

export function BattleBoard({
  view,
  reveal = false,
}: {
  view: PlayerView;
  reveal?: boolean;
}) {
  const clockActive =
    view.playModeId !== "tutorial" &&
    (view.phase === "decide" || view.phase === "briefing");
  const liveClockMs = useLiveClockMs(
    view.myClockMs,
    view.myClockTickingSince,
    clockActive
  );
  const minutes = Math.floor(Math.max(0, liveClockMs) / 60_000);
  const seconds = Math.floor((Math.max(0, liveClockMs) % 60_000) / 1000);

  // Telegraph the danger: in the final seconds the clock turns red, pulses, and
  // ticks louder — so a timeout loss reads as earned, not a sudden jump.
  const clockDanger = clockActive && liveClockMs > 0 && liveClockMs <= CLOCK_DANGER_MS;
  const { play } = useGameAudio();
  const lastDangerSecond = useRef<number | null>(null);
  useEffect(() => {
    if (!clockDanger) {
      lastDangerSecond.current = null;
      return;
    }
    if (lastDangerSecond.current !== seconds) {
      lastDangerSecond.current = seconds;
      play("clock.tick.escalate");
    }
  }, [clockDanger, seconds, play]);

  const { you: youStatus, opp: oppStatus } = deriveStatuses(view, reveal);
  const youCap = capacityPct(view, reveal);
  const oppCap = reveal
    ? Math.min(100, Math.max(8, view.opponent.brandTier * 18 + 20))
    : null;

  const timerLabel =
    view.playModeId === "tutorial"
      ? "no timer"
      : view.phase === "briefing"
        ? `${minutes}:${seconds.toString().padStart(2, "0")}`
        : `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const timerSub =
    view.phase === "briefing"
      ? "clock running"
      : reveal
        ? "revealed"
        : "to lock";

  return (
    <div
      style={{
        background: MT.paper2,
        border: `1px solid ${MT.rule}`,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Eyebrow>Head to head</Eyebrow>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: MT.card,
            border: `1px solid ${MT.rule}`,
          }}
        >
          <StatusDot color={clockDanger ? MT.red : reveal ? MT.green : MT.blue} />
          <span
            className={`mono${clockDanger ? " mtx-clock-danger" : ""}`}
            style={{
              fontSize: 12,
              fontWeight: clockDanger ? 800 : undefined,
              color: clockDanger ? MT.red : MT.ink2,
            }}
          >
            {timerLabel}
          </span>
          {timerSub && (
            <span style={{ fontSize: 11, color: MT.ink3 }}>{timerSub}</span>
          )}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
        <BoardSide
          name={view.opponent.displayName}
          avatar={
            <UserPortrait
              avatarUrl={view.opponent.avatarUrl}
              isBot={view.opponent.isBot}
              kind="opponent"
              size={44}
              ring={MT.ink4}
            />
          }
          status={oppStatus}
          price={view.opponent.currentPrice}
          cap={oppCap}
          reveal={reveal}
        />
        <div style={{ width: 1, background: MT.rule, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: MT.paper2,
              padding: "2px 0",
              fontSize: 11,
              fontWeight: 700,
              color: MT.ink4,
              letterSpacing: "0.1em",
            }}
          >
            VS
          </span>
        </div>
        <BoardSide
          name="You"
          you
          avatar={<UserPortrait avatarUrl={view.me.avatarUrl} size={44} ring={MT.blue} />}
          status={youStatus}
          price={view.me.currentPrice}
          cap={youCap}
          reveal={reveal}
        />
      </div>
    </div>
  );
}
