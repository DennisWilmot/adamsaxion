"use client";

import type { PlayerView } from "@adamsaxion/pricewar-types";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

export interface BriefingScreenProps {
  view: PlayerView;
  myElo: number | null;
  onBegin: () => void;
}

export function BriefingScreen({ view, myElo, onBegin }: BriefingScreenProps) {
  const scenario = SCENARIO_LABELS[view.scenarioId] ?? view.scenarioId;
  const opp = view.opponent.displayName;
  const firstName = opp.split(" ")[0] ?? opp;
  const isRated = view.playModeId !== "tutorial" && !view.opponent.isBot;

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
        <CoffeeBackdrop opacity={0.08} height={220} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <div className="tab">
            Opponent located · {scenario}
          </div>
          <h1
            className="serif"
            style={{ fontSize: 52, color: CD.ink, marginTop: 6, lineHeight: 1.05, fontStyle: "italic" }}
          >
            You&apos;ve drawn {firstName}.
          </h1>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8 }}>
            {view.market.totalRounds} rounds.
            {isRated ? " Ranked match. Elo at stake." : " Unrated practice."}
            {view.opponent.isBot && " · vs CPU"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 36,
              marginTop: 36,
              alignItems: "center",
            }}
            className="max-md:grid-cols-1"
          >
            <div className="cd-slide-in-l" style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
                <AvatarPlayer size={120} ring={CD.primary} />
                <div className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 12 }}>
                  You
                </div>
                {myElo != null && (
                  <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>
                    Elo <span className="num" style={{ color: CD.ink }}>{myElo.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="serif cd-pop-in cd-d-300"
              style={{ fontSize: 48, color: CD.primary, fontStyle: "italic" }}
            >
              vs
            </div>

            <div className="cd-slide-in-r" style={{ textAlign: "left" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
                <AvatarOpponent size={120} ring={CD.ink4} />
                <div className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 12 }}>
                  {opp}
                </div>
                {view.opponent.isBot && (
                  <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>CPU opponent</div>
                )}
              </div>
            </div>
          </div>

          {view.opponent.isBot && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                marginTop: 32,
                padding: "14px 24px",
                background: CD.paper,
                border: `1px solid ${CD.rule}`,
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: CD.ink3,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                Playstyle hint
              </span>
              <span style={{ fontSize: 14, color: CD.ink2 }}>
                This bot leans <b style={{ color: CD.ink }}>budget · discount-heavy</b>.
              </span>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <PillBtn variant="solid" color={CD.primary} size="lg" onClick={onBegin}>
              Begin Round 1 <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · The bell">
          They&apos;ll come out swinging — discounters always do. Don&apos;t match their first move
          out of fear. Read the demand, then commit.
        </CoachBubble>
      </div>
    </CafeDuelRoot>
  );
}

export function markBriefingSeen(matchId: string) {
  sessionStorage.setItem(`pricewar:briefing:${matchId}`, "1");
}

export function hasSeenBriefing(matchId: string) {
  return sessionStorage.getItem(`pricewar:briefing:${matchId}`) === "1";
}
