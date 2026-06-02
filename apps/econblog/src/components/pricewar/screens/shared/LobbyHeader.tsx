"use client";

import Link from "next/link";
import { Settings, Shield } from "lucide-react";
import { AvatarPlayer } from "../../design-system/avatars";
import { CD } from "../../design-system/tokens";
import { LOBBY } from "../lobby/lobby-tokens";
import { LobbyIcon } from "../lobby/LobbyIcon";
import { LOBBY_ICONS } from "../lobby/lobby-icons";
import { MARGIN_GAME_NAME } from "@/lib/games/routes";

export function LobbyHeader({
  username,
  elo,
  unrated,
  onlineNow,
}: {
  username: string;
  elo: number | null;
  unrated: boolean;
  onlineNow?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LobbyIcon src={LOBBY_ICONS.coffee} alt={MARGIN_GAME_NAME} size={40} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="serif" style={{ fontSize: 28, color: CD.ink, fontStyle: "italic", lineHeight: 1 }}>
            {MARGIN_GAME_NAME}
          </div>
          {onlineNow != null && onlineNow > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: CD.ink3,
              }}
            >
              <span
                className="cd-pulse"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: CD.green,
                }}
              />
              {onlineNow} online now
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px 6px 12px",
            background: LOBBY.cardBg,
            border: `1px solid ${LOBBY.cardBorder}`,
            borderRadius: 999,
          }}
        >
          {unrated ? (
            <>
              <Shield size={14} color={CD.ink3} />
              <span style={{ fontSize: 12, color: CD.ink3, fontWeight: 600 }}>Unrated</span>
            </>
          ) : (
            <>
              <span className="num" style={{ fontSize: 13, color: CD.ink, fontWeight: 600 }}>
                {elo?.toLocaleString() ?? "—"}
              </span>
              <span style={{ fontSize: 11, color: CD.ink3 }}>Elo</span>
            </>
          )}
          <AvatarPlayer size={30} />
          <span style={{ fontSize: 12, color: CD.ink, fontWeight: 600, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {username}
          </span>
        </div>
        <Link
          href="/profile"
          aria-label="Settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${LOBBY.cardBorder}`,
            background: LOBBY.cardBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: CD.ink3,
          }}
        >
          <Settings size={16} />
        </Link>
      </div>
    </div>
  );
}
