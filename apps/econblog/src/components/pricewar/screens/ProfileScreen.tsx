"use client";

import { useRouter } from "next/navigation";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import {
  type HistoryMatch,
  didLoseHistoryMatch,
  didWinHistoryMatch,
  formatHistoryMatchSubtitle,
  getHistoryMatchHref,
  isActiveHistoryMatch,
  playModeLabel,
} from "@/client/pricewar/history-match";
import { isHistoryMatchRated } from "@/client/pricewar/rated-match";
import { priceWarPaths } from "@/lib/games/routes";
import { RecentMatch } from "./shared/RecentMatch";
import { Stat } from "./shared/Stat";

export interface ProfileScreenProps {
  elo: number | null;
  isPaid?: boolean;
  matches: HistoryMatch[];
}

function computeStats(matches: HistoryMatch[]) {
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let streakType: "win" | "loss" | null = null;

  for (const m of matches) {
    if (m.phase !== "completed") continue;
    const won = didWinHistoryMatch(m);
    if (won) wins++;
    else if (didLoseHistoryMatch(m)) losses++;
    if (streakType === null) {
      streakType = won ? "win" : "loss";
      streak = 1;
    } else if ((won && streakType === "win") || (!won && streakType === "loss")) {
      streak++;
    } else break;
  }

  return { wins, losses, streak: streakType === "win" ? streak : 0 };
}

export function ProfileScreen({ elo, isPaid = false, matches }: ProfileScreenProps) {
  const router = useRouter();
  const stats = computeStats(matches);
  const completedCount = matches.filter((m) => m.phase === "completed").length;

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm" onClick={() => router.push(priceWarPaths.lobby)}>
        ← Lobby
      </PillBtn>

      <div
        style={{
          marginTop: 16,
          position: "relative",
          overflow: "hidden",
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          borderRadius: 22,
          padding: "32px 28px",
        }}
      >
        <CoffeeBackdrop opacity={0.05} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <AvatarPlayer size={112} ring={CD.primary} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="tab">Profile · Match history</div>
            <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1 }}>
              You
            </h1>
            <div style={{ fontSize: 13, color: CD.ink2, marginTop: 10 }}>
              <span style={{ color: CD.ink3 }}>main </span>
              <b style={{ color: CD.ink }}>Coffee Shop</b>
            </div>
          </div>
          {elo != null && isPaid ? (
            <div style={{ textAlign: "right" }}>
              <div className="tab">Elo · Blitz</div>
              <div className="num serif" style={{ fontSize: 64, color: CD.ink, lineHeight: 1, marginTop: 2 }}>
                {elo.toLocaleString()}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "right" }}>
              <div className="tab">Blitz</div>
              <div style={{ fontSize: 14, color: CD.ink2, marginTop: 8, maxWidth: 160, lineHeight: 1.45 }}>
                Practice matches. Elo applies to ranked human games only.
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 18,
          marginTop: 22,
        }}
        className="max-lg:grid-cols-1"
      >
        <div
          style={{
            background: CD.cardstock,
            border: `1px solid ${CD.rule}`,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div className="tab" style={{ marginBottom: 12 }}>
            Match history
          </div>
          {matches.length === 0 ? (
            <p style={{ fontSize: 13, color: CD.ink3 }}>No matches yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {matches.map((m) => {
                const won = m.phase === "completed" ? didWinHistoryMatch(m) : undefined;
                return (
                  <RecentMatch
                    key={m.matchId}
                    href={getHistoryMatchHref(m)}
                    active={isActiveHistoryMatch(m)}
                    {...(won !== undefined ? { won } : {})}
                    opp={playModeLabel(m.playModeId)}
                    score={formatHistoryMatchSubtitle(m)}
                    delta={m.ratingDelta}
                    {...(m.phase === "completed" ? { rated: isHistoryMatchRated(m) } : {})}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: CD.cardstock,
              border: `1px solid ${CD.rule}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div className="tab" style={{ marginBottom: 12 }}>
              Highlights
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Stat label="Wins" value={String(stats.wins)} />
              <Stat label="Losses" value={String(stats.losses)} />
              <Stat label="Streak" value={String(stats.streak)} />
              <Stat label="Matches" value={String(completedCount)} />
            </div>
          </div>
          <CoachBubble label="Prof. Aldo · Read on you">
            You hold pricing nerve well. One bad round is not the whole match. Stay in.
          </CoachBubble>
        </div>
      </div>
    </CafeDuelRoot>
  );
}
