"use client";

import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "@adamsaxion/pricewar-engine";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { DomainGlyph } from "../design-system/Domain";
import { MatchBar } from "../design-system/MatchBar";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { formatMoveInputSummary } from "../moves/move-input";
import { useCashTrend } from "../decide/useCashTrend";
import { ForfeitDialog } from "./ForfeitDialog";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

export interface LockedScreenProps {
  matchId: string;
  view: PlayerView;
  lockedMoves: SubmittedMove[];
  onForfeitOpen?: () => void;
}

export function LockedScreen({ matchId, view, lockedMoves }: LockedScreenProps) {
  const cashTrend = useCashTrend(matchId, view.me.cash);
  const scenarioLabel = SCENARIO_LABELS[view.scenarioId] ?? "Price War";

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "4px 0 28px" }}>
      <MatchBar
        scenario={scenarioLabel}
        round={view.market.currentRound}
        total={view.market.totalRounds}
        timerMs={view.myClockMs}
        you={{ name: "You", cash: view.me.cash, trend: cashTrend }}
        opp={{
          name: view.opponent.displayName,
          elo: null,
          price: view.opponent.currentPrice,
          locked: view.opponentHasLocked,
          isBot: view.opponent.isBot,
        }}
        forfeitSlot={
          view.playModeId !== "tutorial" ? <ForfeitDialog matchId={matchId} triggerVariant="ghost" /> : undefined
        }
      />

      <div
        style={{
          marginTop: 22,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 18,
          padding: "32px 28px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CoffeeBackdrop opacity={0.04} height={180} />
        <div style={{ position: "relative" }}>
          <div className="tab">Round {view.market.currentRound} · awaiting reveal</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
            You&apos;ve locked.
            {!view.opponentHasLocked && (
              <> {view.opponent.displayName.split(" ")[0]} is still thinking.</>
            )}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: CD.ink2,
              marginTop: 8,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
            }}
          >
            Reveal happens when both sides commit, or when the clock runs out.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <AvatarPlayer size={88} ring={CD.primary} />
              <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 8 }}>
                You
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: CD.ink,
                  color: CD.paper,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 999, background: CD.primary }} />
                LOCKED
              </span>
            </div>
            <div className="serif" style={{ fontSize: 36, color: CD.ink3, fontStyle: "italic" }}>
              vs
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <AvatarOpponent size={88} ring={CD.ink4} />
                {!view.opponentHasLocked && (
                  <div
                    className="cd-pulse"
                    style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: 18,
                      border: `2px solid ${CD.primary}`,
                      opacity: 0.6,
                    }}
                  />
                )}
              </div>
              <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 8 }}>
                {view.opponent.displayName}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: CD.paper,
                  color: CD.ink2,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  border: `1px solid ${CD.rule}`,
                }}
              >
                <span
                  className={view.opponentHasLocked ? undefined : "cd-pulse"}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: CD.primary,
                  }}
                />
                {view.opponentHasLocked ? "LOCKED" : "CHOOSING"}
              </span>
            </div>
          </div>

          {lockedMoves.length > 0 && (
            <div
              style={{
                marginTop: 28,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <div className="tab" style={{ marginBottom: 8 }}>
                Your sealed orders
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {lockedMoves.map((move, i) => {
                  const def = MOVE_BY_ID.get(move.moveId);
                  if (!def) return null;
                  return (
                    <div
                      key={`${move.moveId}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: CD.paper,
                        border: `1px solid ${CD.rule}`,
                        borderRadius: 10,
                      }}
                    >
                      <DomainGlyph domain={def.domain} size={24} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: CD.ink, fontWeight: 600 }}>{def.name}</div>
                        <div style={{ fontSize: 12, color: CD.ink3 }}>
                          {formatMoveInputSummary(def, move.input)}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: CD.ink3, letterSpacing: "0.08em" }}>SEALED</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <ForfeitDialog matchId={matchId} triggerVariant="outline" />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · While we wait">
          Most players over-react after a loss. If they stay cheap and you keep flashing sales, you
          both bleed. Plan the next two rounds, not just this one.
        </CoachBubble>
      </div>
    </CafeDuelRoot>
  );
}

export function saveLockedMoves(matchId: string, moves: SubmittedMove[]) {
  sessionStorage.setItem(`pricewar:locked:${matchId}`, JSON.stringify(moves));
}

export function loadLockedMoves(matchId: string): SubmittedMove[] {
  const raw = sessionStorage.getItem(`pricewar:locked:${matchId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SubmittedMove[];
  } catch {
    return [];
  }
}
