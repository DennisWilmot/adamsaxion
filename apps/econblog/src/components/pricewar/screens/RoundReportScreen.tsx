"use client";

import Link from "next/link";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { MatchBar } from "../design-system/MatchBar";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { useCashTrend } from "../decide/useCashTrend";
import { priceWarPaths } from "@/lib/games/routes";
import { EventPill } from "./shared/EventPill";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

function SlimDelta({
  value,
  label,
  lean,
}: {
  value: number;
  label: string;
  lean?: boolean;
}) {
  const positive = value >= 0;
  return (
    <div
      style={{
        flex: 1,
        padding: "14px 18px",
        background: lean ? CD.cardstockHi : CD.paper,
        border: `1px solid ${CD.rule}`,
        borderRadius: 12,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: CD.ink3,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        className="num serif"
        style={{
          fontSize: 36,
          lineHeight: 1,
          marginTop: 4,
          color: positive ? CD.green : CD.red,
        }}
      >
        {positive ? "+" : "−"}${Math.abs(value).toLocaleString()}
      </div>
    </div>
  );
}

export interface RoundReportScreenProps {
  matchId: string;
  view: PlayerView;
  round: number;
  myDelta: number;
  oppDelta: number;
  mySold?: number;
  oppSold?: number;
  publicSummary: string;
  privateSummary?: string;
  publicEvents?: Array<{
    description: string;
    impact: "neutral" | "positive" | "negative";
  }>;
  verdictLine?: string;
  tutorialLine?: string | undefined;
  nextHref: string;
  nextRound?: number;
  onContinue?: () => void | Promise<void>;
  isComplete: boolean;
}

export function RoundReportScreen({
  matchId,
  view,
  round,
  myDelta,
  oppDelta,
  mySold,
  oppSold,
  publicSummary,
  privateSummary,
  publicEvents,
  verdictLine,
  tutorialLine,
  nextHref,
  nextRound,
  onContinue,
  isComplete,
}: RoundReportScreenProps) {
  const cashTrend = useCashTrend(matchId, view.me.cash);
  const scenarioLabel = SCENARIO_LABELS[view.scenarioId] ?? "Price War";
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "4px 0 28px" }}>
      <MatchBar
        scenario={scenarioLabel}
        round={view.market.currentRound}
        total={view.market.totalRounds}
        timerLabel="next round"
        you={{ name: "You", cash: view.me.cash, trend: cashTrend }}
        opp={{
          name: view.opponent.displayName,
          elo: null,
          price: view.opponent.currentPrice,
          locked: false,
          isBot: view.opponent.isBot,
        }}
      />

      {tutorialLine && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            background: CD.primarySoft,
            border: `1px solid ${CD.primary}`,
            borderRadius: 12,
            fontSize: 13,
            color: CD.ink2,
          }}
        >
          <strong style={{ color: CD.ink }}>Tutorial:</strong> {tutorialLine}
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 16,
          padding: 22,
        }}
      >
        <div className="tab" style={{ marginBottom: 12 }}>
          Public · Round {round}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {(publicEvents?.length ? publicEvents : [{ description: publicSummary, impact: "neutral" as const }]).map(
            (event, i) => (
              <EventPill
                key={`${event.description}-${i}`}
                label={event.description.split(".")[0] ?? event.description}
                impact={event.impact}
                description={event.description}
              />
            )
          )}
          {verdictLine && (
            <span style={{ fontSize: 14, color: CD.ink2, marginLeft: "auto" }}>
              <span className="serif" style={{ fontSize: 20, fontStyle: "italic", color: CD.primary }}>
                {oppFirst}
              </span>{" "}
              {verdictLine}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: CD.ink2, marginTop: 12, lineHeight: 1.5 }}>{publicSummary}</p>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <SlimDelta value={myDelta} label="Your cash this round" />
          <SlimDelta value={oppDelta} label={`${oppFirst}'s cash this round`} lean />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${CD.rule}`,
            fontSize: 12,
            color: CD.ink2,
            flexWrap: "wrap",
          }}
        >
          <span>
            <AvatarPlayer size={20} />
          </span>
          <span>
            <span style={{ color: CD.ink3 }}>price </span>
            <span className="num">{view.me.currentPrice}¢</span>
          </span>
          {mySold != null && (
            <span>
              <span style={{ color: CD.ink3 }}>sold </span>
              <span className="num">{mySold}</span>
            </span>
          )}
          <span style={{ marginLeft: "auto" }} />
          {oppSold != null && (
            <span>
              <span style={{ color: CD.ink3 }}>sold </span>
              <span className="num">{oppSold}</span>
            </span>
          )}
          <span>
            <span style={{ color: CD.ink3 }}>price </span>
            <span className="num">{view.opponent.currentPrice}¢</span>
          </span>
          <span>
            <AvatarOpponent size={20} />
          </span>
        </div>
      </div>

      {privateSummary && (
        <div
          style={{
            marginTop: 14,
            background: CD.paperDeep,
            border: `1px solid ${CD.rule}`,
            borderRadius: 16,
            padding: 22,
          }}
        >
          <div className="tab" style={{ marginBottom: 10 }}>
            Your private outcomes
          </div>
          <p style={{ fontSize: 14, color: CD.ink2, lineHeight: 1.55, margin: 0 }}>{privateSummary}</p>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        {onContinue ? (
          <button type="button" onClick={() => void onContinue()} style={{ all: "unset", cursor: "pointer" }}>
            <PillBtn variant="solid" color={CD.ink} size="lg">
              {isComplete ? "Post-match summary" : `Continue to Round ${nextRound ?? view.market.currentRound + 1}`}{" "}
              <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
          </button>
        ) : (
          <Link href={nextHref}>
            <PillBtn variant="solid" color={CD.ink} size="lg">
              {isComplete ? "Post-match summary" : `Continue to Round ${nextRound ?? view.market.currentRound + 1}`}{" "}
              <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
          </Link>
        )}
        <Link href={priceWarPaths.lobby}>
          <PillBtn variant="ghost" color={CD.ink3}>
            Back to lobby
          </PillBtn>
        </Link>
      </div>
    </CafeDuelRoot>
  );
}
