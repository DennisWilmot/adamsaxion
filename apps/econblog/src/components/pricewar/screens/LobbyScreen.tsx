"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PLAY_MODES } from "@adamsaxion/pricewar-engine";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { LobbyHeader } from "./shared/LobbyHeader";
import { RecentMatch } from "./shared/RecentMatch";

const LOBBY_PLAY_MODES = PLAY_MODES.filter((mode) => mode.id !== "blitz-e2e");

export interface HistoryMatch {
  matchId: string;
  phase: string;
  playModeId: string;
  outcomeKind: string;
  outcomeReason: string | null;
  ratingDelta: number | null;
  updatedAt: string;
}

export interface LobbyScreenProps {
  isPaid: boolean;
  elo: number | null;
  matches: HistoryMatch[];
  onQuickMatch: (playModeId: string) => void;
  onVsBot: (playModeId: string) => void;
  loading?: boolean;
}

function computeStats(matches: HistoryMatch[]) {
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let streakType: "win" | "loss" | null = null;

  for (const m of matches) {
    if (m.phase !== "completed") continue;
    const won = m.outcomeKind === "win";
    if (won) wins++;
    else if (m.outcomeKind === "loss") losses++;

    if (streakType === null) {
      streakType = won ? "win" : "loss";
      streak = 1;
    } else if ((won && streakType === "win") || (!won && streakType === "loss")) {
      streak++;
    } else {
      break;
    }
  }

  return {
    wins,
    losses,
    streak: streakType === "win" ? streak : 0,
  };
}

export function LobbyScreen({
  isPaid,
  elo,
  matches,
  onQuickMatch,
  onVsBot,
  loading,
}: LobbyScreenProps) {
  const router = useRouter();
  const stats = useMemo(() => computeStats(matches), [matches]);
  const recent = matches.slice(0, 3);

  const streakLine =
    stats.streak >= 2
      ? `You're on a ${stats.streak}-match win streak.`
      : stats.wins + stats.losses > 0
        ? `${stats.wins} wins, ${stats.losses} losses so far.`
        : "Your first match is waiting.";

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <LobbyHeader elo={elo} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 24,
          marginTop: 32,
          alignItems: "stretch",
        }}
        className="max-lg:grid-cols-1"
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 22,
            background: CD.paperDeep,
            border: `1px solid ${CD.rule}`,
            padding: "36px 32px",
          }}
        >
          <CoffeeBackdrop opacity={0.08} height={300} />
          <div style={{ position: "relative" }}>
            <div className="tab">Welcome back</div>
            <h1
              className="serif"
              style={{ fontSize: 48, color: CD.ink, lineHeight: 1.05, marginTop: 6, maxWidth: 480 }}
            >
              Ready for another{" "}
              <span style={{ color: CD.primary, fontStyle: "italic" }}>round</span>?
            </h1>
            <p
              style={{
                fontSize: 15,
                color: CD.ink2,
                marginTop: 12,
                maxWidth: 460,
                lineHeight: 1.5,
              }}
            >
              {streakLine} Pick a mode and jump in — or choose your scenario first.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
              <PillBtn
                variant="solid"
                color={CD.primary}
                size="lg"
                disabled={!!loading}
                onClick={() => onQuickMatch("blitz")}
              >
                Quick match <span style={{ opacity: 0.6 }}>→</span>
              </PillBtn>
              <PillBtn
                variant="outline"
                color={CD.ink}
                disabled={!!loading}
                onClick={() => router.push(priceWarPaths.scenario)}
              >
                Choose scenario
              </PillBtn>
              <PillBtn
                variant="ghost"
                color={CD.ink3}
                disabled={!!loading}
                onClick={() => onVsBot("blitz")}
              >
                Practice vs CPU
              </PillBtn>
            </div>

            <div style={{ display: "flex", gap: 28, marginTop: 32, flexWrap: "wrap" }}>
              {[
                { l: "Wins", v: String(stats.wins) },
                { l: "Losses", v: String(stats.losses) },
                { l: "Streak", v: String(stats.streak) },
                { l: "Rating", v: elo != null ? elo.toLocaleString() : "—" },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    style={{
                      fontSize: 11,
                      color: CD.ink3,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.l}
                  </div>
                  <div
                    className="num serif"
                    style={{ fontSize: 30, color: CD.ink, lineHeight: 1, marginTop: 2 }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
              <div className="tab">Play modes</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {LOBBY_PLAY_MODES.map((mode) => {
                  const locked = mode.id === "rapid" && !isPaid;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      disabled={loading || locked}
                      onClick={() =>
                        mode.id === "tutorial"
                          ? router.push(priceWarPaths.tutorial)
                          : onVsBot(mode.id)
                      }
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: `1px solid ${CD.rule}`,
                        background: CD.cardstock,
                        cursor: locked ? "not-allowed" : "pointer",
                        opacity: locked ? 0.55 : 1,
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: CD.ink }}>{mode.label}</div>
                      <div style={{ fontSize: 11, color: CD.ink3, marginTop: 4 }}>{mode.shortLabel}</div>
                      {locked && (
                        <div style={{ fontSize: 10, color: CD.primary, marginTop: 6 }}>
                          <Link href="/subscribe">Subscribe</Link> for Rapid
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: CD.cardstock,
              border: `1px solid ${CD.rule}`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div className="tab" style={{ marginBottom: 12 }}>
              Recent matches
            </div>
            {recent.length === 0 ? (
              <p style={{ fontSize: 13, color: CD.ink3 }}>No matches yet — start a Quick match above.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recent.map((m) => {
                  const won =
                    m.phase === "completed"
                      ? m.outcomeKind === "win"
                      : undefined;
                  return (
                    <RecentMatch
                      key={m.matchId}
                      {...(won !== undefined ? { won } : {})}
                      opp={m.playModeId}
                      score={
                        m.phase === "completed"
                          ? `${m.outcomeKind}${m.outcomeReason ? ` · ${m.outcomeReason}` : ""}`
                          : `In progress · ${m.phase}`
                      }
                      delta={m.ratingDelta}
                    />
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <Link href={priceWarPaths.history}>
                <PillBtn variant="ghost" color={CD.ink3} size="sm">
                  See all →
                </PillBtn>
              </Link>
            </div>
          </div>

          <CoachBubble label="Prof. Aldo · Daily tip">
            Pricing too low against a streaky opponent makes you predictable. Try one premium round
            to flip the read.
          </CoachBubble>
        </div>
      </div>
    </CafeDuelRoot>
  );
}
