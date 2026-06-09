"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { AvatarOpponent } from "./avatars";
import { isMarginDebugClient } from "@/lib/games/margin-flags";

export type OpponentAvatarKind = "human" | "guide" | "coach" | "bot";

const GUIDE_PORTRAIT = "/pricewar/guide-portrait.webp";
const COACH_PORTRAIT = "/pricewar/prof-aldo-coach.webp";

export function resolveOpponentAvatarKind(args: {
  opponentName?: string;
  opponentIsBot?: boolean;
  playModeId?: string;
}): OpponentAvatarKind {
  const name = (args.opponentName ?? "").trim().toLowerCase();

  if (name === "guide" || name.startsWith("guide ") || args.playModeId === "tutorial") {
    return "guide";
  }

  if (name.includes("coach") || name.includes("aldo")) {
    return "coach";
  }

  if (isMarginDebugClient() && args.opponentIsBot === true) {
    return "bot";
  }

  return "human";
}

export function isRatedHumanOpponent(args: {
  opponentName?: string;
  opponentIsBot?: boolean;
  playModeId?: string;
}): boolean {
  return resolveOpponentAvatarKind(args) === "human";
}

export function OpponentAvatarFace({
  kind,
  size = 42,
  ring,
  avatarUrl,
}: {
  kind: OpponentAvatarKind;
  size?: number;
  ring: string;
  avatarUrl?: string | null | undefined;
}) {
  if (avatarUrl && kind === "human") {
    return (
      <PortraitFrame size={size} ring={ring}>
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </PortraitFrame>
    );
  }

  if (kind === "guide") {
    return (
      <PortraitFrame size={size} ring={ring}>
        <Image
          src={GUIDE_PORTRAIT}
          alt="Guide"
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </PortraitFrame>
    );
  }

  if (kind === "coach") {
    return (
      <PortraitFrame size={size} ring={ring}>
        <Image
          src={COACH_PORTRAIT}
          alt="Coach"
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </PortraitFrame>
    );
  }

  return <AvatarOpponent size={size} ring={ring} />;
}

function PortraitFrame({
  size,
  ring,
  children,
}: {
  size: number;
  ring: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: `0 0 0 2px ${ring}`,
      }}
    >
      {children}
    </div>
  );
}
