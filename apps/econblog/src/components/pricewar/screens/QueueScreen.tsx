"use client";

import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarPlayer } from "../design-system/avatars";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export interface QueueScreenProps {
  playModeId: string;
  elo: number | null;
  elapsedSec: number;
  fallbackSec: number;
  secondsUntilBotFallback: number;
  matchingBot?: boolean;
  onCancel: () => void;
  onPlayBot?: () => void;
}

export function QueueScreen({
  playModeId,
  elo,
  elapsedSec,
  fallbackSec,
  secondsUntilBotFallback,
  matchingBot = false,
  onCancel,
  onPlayBot,
}: QueueScreenProps) {
  const rangeLow = elo != null ? Math.max(800, elo - 150) : 1180;
  const rangeHigh = elo != null ? elo + 150 : 1470;
  const widenPct = Math.min(60, 20 + Math.floor(elapsedSec / 30) * 10);

  return (
    <CafeDuelRoot
      style={{
        background: CD.paper,
        minHeight: "100%",
        padding: "28px 0 36px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PillBtn variant="ghost" color={CD.ink3} size="sm" onClick={onCancel}>
        ← Cancel
      </PillBtn>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          position: "relative",
          minHeight: 420,
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <AvatarPlayer size={120} ring={CD.primary} />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cd-pulse"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                border: `2px solid ${CD.primary}`,
                opacity: 0.4 / i,
                animationDelay: `${i * 0.6}s`,
                transform: `scale(${1 + i * 0.15})`,
              }}
            />
          ))}
        </div>

        <div className="tab" style={{ marginTop: 28 }}>
          {matchingBot ? "Matching with AI opponent" : "Searching for an opponent"}
        </div>
        <h1
          className="serif"
          style={{ fontSize: 38, color: CD.ink, marginTop: 8, lineHeight: 1.1, maxWidth: 600 }}
        >
          {matchingBot
            ? "No humans available — starting a bot match…"
            : "Finding someone in your league…"}
        </h1>
        <p style={{ fontSize: 13, color: CD.ink3, marginTop: 8, textTransform: "capitalize" }}>
          {playModeId} · Coffee Shop
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="tab">Your Elo</div>
            <div className="num serif" style={{ fontSize: 34, color: CD.ink, lineHeight: 1, marginTop: 4 }}>
              {elo != null ? elo.toLocaleString() : "—"}
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: CD.rule }} />
          <div style={{ textAlign: "center" }}>
            <div className="tab">Searching range</div>
            <div className="num" style={{ fontSize: 16, color: CD.ink, lineHeight: 1, marginTop: 6 }}>
              {rangeLow.toLocaleString()} — {rangeHigh.toLocaleString()}
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: CD.rule }} />
          <div style={{ textAlign: "center" }}>
            <div className="tab">In queue</div>
            <div className="num mono" style={{ fontSize: 24, color: CD.ink, lineHeight: 1, marginTop: 6 }}>
              {formatTime(elapsedSec)}
            </div>
          </div>
        </div>

        <div style={{ width: 360, maxWidth: "100%", marginTop: 26 }}>
          <div
            style={{
              height: 6,
              background: CD.paperDeep,
              borderRadius: 999,
              position: "relative",
              border: `1px solid ${CD.rule}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${(100 - widenPct) / 2}%`,
                right: `${(100 - widenPct) / 2}%`,
                top: -3,
                bottom: -3,
                background: CD.primarySoft,
                border: `1px solid ${CD.primary}`,
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -3,
                bottom: -3,
                width: 2,
                background: CD.primary,
                transform: "translateX(-50%)",
              }}
            />
          </div>
          <div style={{ fontSize: 11.5, color: CD.ink3, marginTop: 6 }}>
            {matchingBot
              ? "Hang tight — your match is starting."
              : secondsUntilBotFallback > 0
                ? `AI opponent in ${secondsUntilBotFallback}s if no human is found.`
                : "Range widens every 30s."}
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <PillBtn variant="outline" color={CD.ink} size="md" onClick={onCancel}>
            Cancel search
          </PillBtn>
          {!matchingBot && secondsUntilBotFallback > 0 && onPlayBot && (
            <PillBtn variant="solid" color={CD.primary} size="md" onClick={onPlayBot}>
              Play a bot now
            </PillBtn>
          )}
        </div>
      </div>

      <CoachBubble label="Prof. Aldo · While we wait">
        Take a breath. Look at the scenario again. Decide your default playstyle before the bell
        rings — premium, value, or chaos.
      </CoachBubble>
    </CafeDuelRoot>
  );
}

export function markBriefingPending(matchId: string) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`pricewar:briefing:${matchId}`);
  }
}
