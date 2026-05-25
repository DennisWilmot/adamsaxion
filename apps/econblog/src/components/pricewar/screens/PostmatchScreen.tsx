"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { CashLine } from "./shared/CashLine";
import { Stat } from "./shared/Stat";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

export interface PostmatchScreenProps {
  view: PlayerView;
  youWon: boolean;
  ratingDelta: number | null;
  ratingAfter: number | null;
  coachLine?: string;
  onPlayAgain: () => void;
}

export function PostmatchScreen({
  view,
  youWon,
  ratingDelta,
  ratingAfter,
  coachLine,
  onPlayAgain,
}: PostmatchScreenProps) {
  const scenario = SCENARIO_LABELS[view.scenarioId] ?? view.scenarioId;
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  const isTutorial = view.playModeId === "tutorial";

  const headline = isTutorial
    ? "Tutorial complete."
    : youWon
      ? "You won the morning."
      : `${oppFirst} took it.`;

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
        }}
      >
        <CoffeeBackdrop opacity={0.05} height={200} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <div className="tab">
            Match · {scenario} · {view.market.totalRounds} rounds
          </div>
          <h1
            className="serif"
            style={{ fontSize: 64, color: CD.ink, marginTop: 4, lineHeight: 1, fontStyle: "italic" }}
          >
            {headline}
          </h1>
          {ratingDelta != null && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginTop: 16,
                padding: "6px 14px",
                background: youWon ? CD.primarySoft : CD.paper,
                border: `1px solid ${youWon ? CD.primary : CD.rule}`,
                borderRadius: 999,
              }}
            >
              <span className="num serif" style={{ fontSize: 22, color: CD.primary }}>
                {ratingDelta >= 0 ? "+" : ""}
                {ratingDelta}
              </span>
              <span style={{ fontSize: 13, color: CD.ink2 }}>
                Elo
                {ratingAfter != null && (
                  <>
                    {" "}
                    · now <b className="num" style={{ color: CD.ink }}>{ratingAfter.toLocaleString()}</b>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 32,
          }}
          className="max-md:grid-cols-1"
        >
          <div
            style={{
              background: CD.cardstock,
              border: `1px solid ${youWon ? CD.primary : CD.rule}`,
              borderRadius: 14,
              padding: 20,
              boxShadow: youWon ? `0 0 0 3px ${CD.primarySoft}` : "none",
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
                <div className="serif" style={{ fontSize: 26, color: CD.ink }}>
                  Final cash
                </div>
              </div>
              <div className="num serif" style={{ marginLeft: "auto", fontSize: 40, color: CD.ink }}>
                ${view.me.cash.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 16,
                paddingTop: 14,
                borderTop: `1px dashed ${CD.rule}`,
              }}
            >
              <Stat label="Price" value={`${view.me.currentPrice}¢`} />
              <Stat label="Inventory" value={String(view.me.inventory)} />
              <Stat label="Mode" value={view.playModeId} />
            </div>
          </div>
          <div
            style={{
              background: CD.cardstock,
              border: `1px solid ${CD.rule}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <AvatarOpponent size={64} ring={CD.ink4} />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: CD.ink3,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {view.opponent.displayName}
                </div>
                <div className="serif" style={{ fontSize: 26, color: CD.ink }}>
                  Final cash
                </div>
              </div>
              <div
                className="num serif"
                style={{ marginLeft: "auto", fontSize: 40, color: CD.ink2 }}
              >
                —
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 16,
                paddingTop: 14,
                borderTop: `1px dashed ${CD.rule}`,
              }}
            >
              <Stat label="Price" value={`${view.opponent.currentPrice}¢`} />
              {view.opponent.isBot && <Stat label="Type" value="CPU" />}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            background: CD.cardstock,
            border: `1px solid ${CD.rule}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div className="tab" style={{ marginBottom: 12 }}>
            Cash snapshot
          </div>
          <CashLine you={[view.me.cash]} opp={[view.me.cash]} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <PillBtn variant="solid" color={CD.primary} size="lg" onClick={onPlayAgain}>
            Play again →
          </PillBtn>
          <Link href={priceWarPaths.lobby}>
            <PillBtn variant="ghost" color={CD.ink3}>
              Back to lobby
            </PillBtn>
          </Link>
        </div>
      </div>

      {coachLine && (
        <div style={{ marginTop: 18 }}>
          <CoachBubble label="Prof. Aldo · Debrief">{coachLine}</CoachBubble>
        </div>
      )}
    </CafeDuelRoot>
  );
}
