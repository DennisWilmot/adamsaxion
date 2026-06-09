"use client";

import { AvatarOpponent, AvatarPlayer } from "./avatars";

export function UserPortrait({
  avatarUrl,
  isBot = false,
  kind = "player",
  size = 56,
  ring,
  shape = "rounded",
}: {
  avatarUrl?: string | null | undefined;
  isBot?: boolean | undefined;
  kind?: "player" | "opponent";
  size?: number;
  ring?: string | undefined;
  shape?: "rounded" | "circle";
}) {
  const resolvedUrl = avatarUrl ?? null;
  if (resolvedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedUrl}
        alt=""
        width={size}
        height={size}
        style={{
          display: "block",
          width: size,
          height: size,
          borderRadius: shape === "circle" ? "999px" : 12,
          boxShadow: ring ? `0 0 0 2px ${ring}` : "none",
          objectFit: "cover",
          background: "oklch(0.92 0.02 80)",
        }}
      />
    );
  }

  if (isBot || kind === "opponent") {
    return <AvatarOpponent size={size} {...(ring ? { ring } : {})} />;
  }

  return <AvatarPlayer size={size} {...(ring ? { ring } : {})} />;
}
