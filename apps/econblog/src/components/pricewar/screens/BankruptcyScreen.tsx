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

export interface BankruptcyScreenProps {
  view: PlayerView;
  ratingDelta: number | null;
  ratingAfter: number | null;
}

export function BankruptcyScreen({ view, ratingDelta, ratingAfter }: BankruptcyScreenProps) {
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;

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
        <CoffeeBackdrop opacity={0.04} height={220} />

        <svg
          viewBox="0 0 120 120"
          width="84"
          height="84"
          style={{ position: "relative", margin: "0 auto", display: "block" }}
          aria-hidden
        >
          <g stroke={CD.ink} strokeWidth="2.4" fill="none">
            <path d="M 22 36 L 82 36 L 78 96 Q 76 104, 68 104 L 36 104 Q 28 104, 26 96 Z" />
            <path d="M 82 50 Q 102 54, 100 76 L 90 76 Q 92 62, 80 60" />
            <line x1="32" y1="48" x2="72" y2="48" strokeDasharray="3 4" opacity="0.3" />
          </g>
        </svg>

        <div className="tab" style={{ marginTop: 14 }}>
          Round {view.market.currentRound} · Match concluded
        </div>
        <h1
          className="serif"
          style={{ fontSize: 64, color: CD.ink, marginTop: 4, lineHeight: 1, fontStyle: "italic" }}
        >
          The till is empty.
        </h1>
        <p
          style={{
            fontSize: 15,
            color: CD.ink2,
            marginTop: 12,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.5,
          }}
        >
          You&apos;ve burned through your cash reserve. The shop can&apos;t make payroll. {oppFirst}{" "}
          wins by liquidity.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 36,
            marginTop: 28,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <AvatarPlayer size={80} ring={CD.ink4} />
            <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>
              You
            </div>
            <div className="num serif" style={{ fontSize: 36, color: CD.red, lineHeight: 1, marginTop: 4 }}>
              ${view.me.cash.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: "0.08em" }}>BANKRUPT</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <AvatarOpponent size={80} ring={CD.primary} />
            <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>
              {view.opponent.displayName}
            </div>
            <div className="num serif" style={{ fontSize: 36, color: CD.ink, lineHeight: 1, marginTop: 4 }}>
              Winner
            </div>
            <div style={{ fontSize: 11, color: CD.primary, letterSpacing: "0.08em" }}>WINNER</div>
          </div>
        </div>

        {ratingDelta != null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 22,
              padding: "6px 14px",
              background: CD.paper,
              border: `1px solid ${CD.rule}`,
              borderRadius: 999,
            }}
          >
            <span className="num serif" style={{ fontSize: 22, color: CD.red }}>
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <Link href={priceWarPaths.tutorial}>
            <PillBtn variant="outline" color={CD.ink}>
              Practice cash management
            </PillBtn>
          </Link>
          <Link href={priceWarPaths.lobby}>
            <PillBtn variant="solid" color={CD.ink} size="lg">
              Back to lobby →
            </PillBtn>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · After the bell">
          You spent like you&apos;d win. Half the game is what you do before things go sideways — buy
          cheap, hold cash, take the small fight. Try again.
        </CoachBubble>
      </div>
    </CafeDuelRoot>
  );
}
