"use client";

import { CD } from "../../design-system/tokens";
import { LOBBY } from "./lobby-tokens";
import { LobbyIcon } from "./LobbyIcon";

export function LobbyModeCard({
  iconSrc,
  iconAlt,
  title,
  subtitle,
  meta,
  tag,
  selected,
  locked,
  disabled,
  onClick,
}: {
  iconSrc: string;
  iconAlt: string;
  title: string;
  subtitle: string;
  meta: string;
  tag?: string;
  selected?: boolean;
  locked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || locked}
      onClick={onClick}
      className="cd-move"
      style={{
        position: "relative",
        textAlign: "left",
        padding: "16px 16px 14px",
        borderRadius: 14,
        border: `1px solid ${selected ? CD.primary : LOBBY.cardBorder}`,
        background: selected ? LOBBY.cardMuted : LOBBY.cardBg,
        cursor: locked || disabled ? "not-allowed" : "pointer",
        opacity: locked ? 0.58 : 1,
        boxShadow: selected ? `0 0 0 3px ${CD.primary}22` : "none",
        width: "100%",
      }}
    >
      {tag && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 999,
            background: LOBBY.goldSoft,
            color: "#92400e",
          }}
        >
          {tag}
        </span>
      )}
      <div style={{ marginBottom: 10 }}>
        <LobbyIcon src={iconSrc} alt={iconAlt} size={44} selected={selected ?? false} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: CD.ink }}>{title}</div>
      <div style={{ fontSize: 12, color: CD.ink2, marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>
      <div style={{ fontSize: 11, color: CD.ink3, marginTop: 8 }}>{meta}</div>
    </button>
  );
}
