"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { HistoryMatch } from "@/client/pricewar/history-match";
import {
  didLoseHistoryMatch,
  didWinHistoryMatch,
  formatBattleDetail,
  formatRelativeTime,
  getHistoryMatchHref,
  isActiveHistoryMatch,
  playModeLabel,
} from "@/client/pricewar/history-match";
import {
  isRatedHumanOpponent,
  OpponentAvatarFace,
  resolveOpponentAvatarKind,
} from "../../design-system/opponent-avatar";
import { CD } from "../../design-system/tokens";
import { LOBBY } from "./lobby-tokens";

export function LobbyBattleRow({ match }: { match: HistoryMatch }) {
  const href = getHistoryMatchHref(match);
  const active = isActiveHistoryMatch(match);
  const won = match.phase === "completed" ? didWinHistoryMatch(match) : undefined;
  const lost = match.phase === "completed" ? didLoseHistoryMatch(match) : undefined;
  const opponent = match.opponentName ?? "Opponent";
  const opponentMeta = {
    opponentName: opponent,
    playModeId: match.playModeId,
    ...(match.opponentIsBot != null ? { opponentIsBot: match.opponentIsBot } : {}),
  };
  const avatarKind = resolveOpponentAvatarKind(opponentMeta);
  const isHuman = isRatedHumanOpponent(opponentMeta);
  const firstName = opponent.split(" ")[0] ?? opponent;

  const rowBg = active ? LOBBY.liveRow : won ? LOBBY.winRow : lost ? LOBBY.lossRow : LOBBY.cardMuted;
  const rowBorder = active
    ? LOBBY.livePill
    : won
      ? LOBBY.winBorder
      : lost
        ? LOBBY.lossBorder
        : LOBBY.cardBorder;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="cd-move"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 12px",
          background: rowBg,
          border: `1px solid ${rowBorder}`,
          borderRadius: 12,
        }}
      >
        <OpponentAvatarFace
          kind={avatarKind}
          avatarUrl={match.opponentAvatarUrl}
          ring={
            active ? LOBBY.livePill : won ? LOBBY.winPill : lost ? LOBBY.lossPill : LOBBY.cardBorder
          }
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {active ? (
              <ResultPill label="Live" tone="live" />
            ) : won ? (
              <ResultPill label="Win" tone="win" />
            ) : lost ? (
              <ResultPill label="Loss" tone="loss" />
            ) : null}
            <span style={{ fontSize: 14, fontWeight: 600, color: CD.ink, display: "inline-flex", alignItems: "center", gap: 5 }}>
              vs {firstName}
              {isHuman && <Crown size={13} color={LOBBY.gold} fill={LOBBY.goldSoft} strokeWidth={2} />}
            </span>
          </div>
          <div style={{ fontSize: 12, color: CD.ink2, marginTop: 4 }}>
            {playModeLabel(match.playModeId)}
            {match.phase === "completed" && (() => {
              const detail = formatBattleDetail(match).replace(/^(Win|Loss|Draw)( · )?/, "");
              return detail ? <span style={{ color: CD.ink3 }}> · {detail}</span> : null;
            })()}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 52 }}>
          {match.ratingDelta != null && match.phase === "completed" ? (
            <div
              className="num"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: match.ratingDelta >= 0 ? LOBBY.winPill : LOBBY.lossPill,
                lineHeight: 1.2,
              }}
            >
              {match.ratingDelta >= 0 ? "+" : ""}
              {match.ratingDelta}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: CD.ink3, fontWeight: 500 }}>—</div>
          )}
          <div style={{ fontSize: 11, color: CD.ink3, marginTop: 3 }}>{formatRelativeTime(match.updatedAt)}</div>
        </div>
      </div>
    </Link>
  );
}

function ResultPill({
  label,
  tone,
}: {
  label: string;
  tone: "win" | "loss" | "live";
}) {
  const bg =
    tone === "win" ? LOBBY.winPill : tone === "loss" ? LOBBY.lossPill : LOBBY.livePill;

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 6,
        background: bg,
        color: "white",
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}
