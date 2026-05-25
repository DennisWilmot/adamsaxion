"use client";

import Link from "next/link";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";

export interface AbandonmentScreenProps {
  view: PlayerView;
  reason: string;
  partialElo?: number | null;
}

export function AbandonmentScreen({ view, reason, partialElo }: AbandonmentScreenProps) {
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  const youLeading = view.me.cash > 0;

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          borderRadius: 22,
          padding: "40px 36px",
          textAlign: "center",
        }}
      >
        <CoffeeBackdrop opacity={0.05} />
        <div className="tab" style={{ marginTop: 8 }}>
          Match · Round {view.market.currentRound} of {view.market.totalRounds}
        </div>
        <h1
          className="serif"
          style={{ fontSize: 56, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: "italic" }}
        >
          {oppFirst} stepped out.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: CD.ink2,
            marginTop: 10,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.5,
          }}
        >
          {reason}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 36,
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <AvatarPlayer size={96} ring={CD.primary} />
            <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>
              You
            </div>
            <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>
              ${view.me.cash.toLocaleString()}
              {youLeading ? " · leading" : ""}
            </div>
          </div>
          <div className="serif" style={{ fontSize: 36, color: CD.ink3, fontStyle: "italic" }}>
            vs
          </div>
          <div style={{ textAlign: "center", opacity: 0.5, filter: "grayscale(0.6)" }}>
            <AvatarOpponent size={96} ring={CD.ink4} />
            <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>
              {view.opponent.displayName}
            </div>
            <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>Disconnected</div>
          </div>
        </div>

        {partialElo != null && (
          <div
            style={{
              margin: "28px auto 0",
              maxWidth: 480,
              background: CD.cardstock,
              border: `1px solid ${CD.rule}`,
              borderRadius: 14,
              padding: 18,
              textAlign: "left",
            }}
          >
            <div className="tab">Match resolution</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 14, color: CD.ink }}>Partial-credit result</span>
              <span className="num serif" style={{ fontSize: 22, color: CD.primary }}>
                {partialElo >= 0 ? "+" : ""}
                {partialElo} Elo
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          <Link href={priceWarPaths.history}>
            <PillBtn variant="solid" color={CD.primary}>
              View history
            </PillBtn>
          </Link>
          <Link href={priceWarPaths.lobby}>
            <PillBtn variant="outline" color={CD.ink}>
              Back to lobby
            </PillBtn>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · Sportsmanship">
          A win is a win. But the rating doesn&apos;t tell the full story of a match like this — log
          it, find a better fight.
        </CoachBubble>
      </div>
    </CafeDuelRoot>
  );
}
