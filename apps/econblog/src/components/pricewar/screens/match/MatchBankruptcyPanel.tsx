"use client";

import Link from "next/link";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { CoachReportPayload } from "@adamsaxion/pricewar-engine";
import { UserPortrait } from "@/components/pricewar/design-system/UserPortrait";
import { MatchTerminalFrame } from "./MatchTerminalFrame";
import { OutcomeBanner } from "./OutcomeBanner";
import { CoachLessonBlock } from "@/components/pricewar/screens/shared/CoachLessonBlock";
import { MarginBtn } from "@/components/pricewar/design-system/margin-kit";
import { CD } from "@/components/pricewar/design-system/tokens";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";
import { priceWarPaths } from "@/lib/games/routes";

export function MatchBankruptcyPanel({
  view,
  ratingDelta,
  ratingAfter,
  coachReport,
  embedded = false,
}: {
  view: PlayerView;
  ratingDelta: number | null;
  ratingAfter: number | null;
  coachReport?: CoachReportPayload | null;
  embedded?: boolean;
}) {
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  const ratedEnabled = isMarginRatedEnabledClient();

  const stat =
    ratedEnabled && ratingDelta != null
      ? `${ratingDelta >= 0 ? "+" : ""}${ratingDelta} Elo`
      : `$${view.me.cash.toLocaleString()}`;

  const statLabel =
    ratedEnabled && ratingDelta != null
      ? ratingAfter != null
        ? `now ${ratingAfter.toLocaleString()}`
        : "Rating change"
      : "Final cash";

  return (
    <MatchTerminalFrame
      embedded={embedded}
      backdropOpacity={0.04}
      backdropHeight={220}
      footer={
        <div style={{ marginTop: embedded ? 12 : 18 }}>
          <CoachLessonBlock
            verdict={
              coachReport?.oneLinerVerdict ??
              "You spent as if every round would be a win. Save cash early, buy smart, and fight small battles."
            }
            report={coachReport ?? null}
            fallbackTopic="Cash flow vs. profit — don't run dry"
            fallbackContext="You went broke while still in the fight. This lesson shows how to keep cash above the line."
          />
        </div>
      }
    >
      <OutcomeBanner
        tone="loss"
        eyebrow={`Round ${view.market.currentRound} · Match concluded`}
        title="You ran out of cash."
        sub={`You spent through your reserve and cannot pay staff. ${oppFirst} wins.`}
        stat={stat}
        statLabel={statLabel}
      />

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
          <UserPortrait avatarUrl={view.me.avatarUrl} size={80} ring={CD.ink4} />
          <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>
            You
          </div>
          <div className="num serif" style={{ fontSize: 36, color: CD.red, lineHeight: 1, marginTop: 4 }}>
            ${view.me.cash.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: "0.08em" }}>BANKRUPT</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <UserPortrait
            avatarUrl={view.opponent.avatarUrl}
            isBot={view.opponent.isBot}
            kind="opponent"
            size={80}
            ring={CD.primary}
          />
          <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>
            {view.opponent.displayName}
          </div>
          <div className="num serif" style={{ fontSize: 36, color: CD.ink, lineHeight: 1, marginTop: 4 }}>
            Winner
          </div>
          <div style={{ fontSize: 11, color: CD.primary, letterSpacing: "0.08em" }}>WINNER</div>
        </div>
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
        <Link href={priceWarPaths.tutorial} style={{ textDecoration: "none" }}>
          <MarginBtn kind="ghost" size="md">
            Practice cash management
          </MarginBtn>
        </Link>
        <Link href={priceWarPaths.lobby} style={{ textDecoration: "none" }}>
          <MarginBtn kind="primary" size="lg">
            Back to lobby →
          </MarginBtn>
        </Link>
      </div>
    </MatchTerminalFrame>
  );
}
