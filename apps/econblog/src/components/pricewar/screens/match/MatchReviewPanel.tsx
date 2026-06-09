"use client";

import { useMemo } from "react";
import type { LockForecastLine } from "@adamsaxion/pricewar-engine";
import type { PlayerView, SubmittedMove } from "@adamsaxion/pricewar-types";
import { useLockForecast } from "@/client/pricewar/hooks/useLockForecast";
import { useLiveClockMs } from "@/client/pricewar/hooks/useLiveClockMs";
import { Cash, Eyebrow, MarginBtn, MT } from "@/components/pricewar/design-system/margin-kit";
import { MatchBar } from "@/components/pricewar/design-system/MatchBar";
import { estimateMoveCost } from "@/components/pricewar/moves/move-input";
import { useCashTrend } from "@/components/pricewar/decide/useCashTrend";
import { MARGIN_GAME_NAME } from "@/lib/games/routes";
import { ReviewMoveCard } from "./ReviewMoveCard";
import { ReviewForecastRows } from "./ReviewForecastRow";
import { ReviewViewportFrame } from "./ReviewShell";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

function forecastWarnings(lines: LockForecastLine[]): LockForecastLine[] {
  return lines.filter((line) => line.kind === "caution" || line.kind === "risk");
}

export function MatchReviewPanel({
  matchId,
  view,
  draft,
  onEdit,
  onSubmit,
  submitting = false,
  embedded = false,
}: {
  matchId: string;
  view: PlayerView;
  draft: SubmittedMove[];
  onEdit: () => void;
  onSubmit: () => Promise<void>;
  submitting?: boolean;
  embedded?: boolean;
}) {
  const cashTrend = useCashTrend(matchId, view.me.cash);
  const scenarioLabel = SCENARIO_LABELS[view.scenarioId] ?? MARGIN_GAME_NAME;
  const oppFirst =
    view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;

  const totalCost = draft.reduce(
    (sum, move) => sum + estimateMoveCost(move.moveId, move.input),
    0
  );
  const cashAfter = view.me.cash - totalCost;
  const forecastQuery = useLockForecast(matchId, draft);
  const hasBlockingRisk = forecastQuery.data?.some((line) => line.kind === "risk") ?? false;
  const warnings = useMemo(
    () => forecastWarnings(forecastQuery.data ?? []),
    [forecastQuery.data]
  );

  const liveClockMs = useLiveClockMs(
    view.myClockMs,
    view.myClockTickingSince,
    view.phase === "decide" && view.playModeId !== "tutorial"
  );

  return (
    <ReviewViewportFrame embedded={embedded}>
      {!embedded && (
        <MatchBar
          compact
          scenario={scenarioLabel}
          round={view.market.currentRound}
          total={view.market.totalRounds}
          timerMs={liveClockMs}
          timerLabel="until reveal"
          you={{ name: "You", cash: view.me.cash, trend: cashTrend, avatarUrl: view.me.avatarUrl }}
          opp={{
            name: view.opponent.displayName,
            elo: null,
            price: view.opponent.currentPrice,
            locked: view.opponentHasLocked,
            isBot: view.opponent.isBot,
            avatarUrl: view.opponent.avatarUrl,
          }}
        />
      )}

      <div className="cd-review-v2-wrap">
        <div className="cd-review-v2-panel">
          <div className="cd-review-v2-head">
            <div>
              <Eyebrow>
                Review · Round {view.market.currentRound} · before you lock
              </Eyebrow>
              <h1
                className="serif"
                style={{
                  fontSize: 30,
                  color: MT.ink,
                  fontWeight: 700,
                  marginTop: 4,
                  lineHeight: 1.05,
                }}
              >
                Final check.
              </h1>
            </div>
            <MarginBtn kind="ghost" size="sm" onClick={onEdit} disabled={submitting}>
              ✕
            </MarginBtn>
          </div>

          {warnings.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: MT.warnSoft,
                border: `1px solid ${MT.warnLine}`,
                marginTop: 16,
              }}
            >
              <span style={{ flex: "0 0 auto", marginTop: 1 }} aria-hidden>
                ⚠
              </span>
              <div style={{ fontSize: 13, color: MT.warnInk, lineHeight: 1.5 }}>
                {warnings.length === 1 ? (
                  <>
                    <b style={{ color: "#5c4a10" }}>
                      {warnings[0]!.kind === "risk" ? "Fix before locking · " : "Note · "}
                    </b>
                    {warnings[0]!.text}
                  </>
                ) : (
                  <>
                    <b style={{ color: "#5c4a10" }}>{warnings.length} notes · </b>
                    {warnings.map((w) => w.text).join(" ")}
                  </>
                )}
              </div>
            </div>
          )}

          <Eyebrow style={{ marginTop: 16 }}>
            Your {draft.length} action{draft.length === 1 ? "" : "s"}
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {draft.length === 0 ? (
              <p style={{ color: MT.ink3, fontSize: 13, margin: 0 }}>
                No moves drafted. Go back and pick at least one move.
              </p>
            ) : (
              draft.map((move, index) => (
                <ReviewMoveCard key={`${move.moveId}-${index}`} move={move} />
              ))
            )}
          </div>

          {(forecastQuery.isLoading || (forecastQuery.data?.length ?? 0) > 0) && (
            <div style={{ marginTop: 16 }}>
              <Eyebrow>What&apos;s happening</Eyebrow>
              {forecastQuery.isLoading ? (
                <p style={{ fontSize: 13, color: MT.ink3, margin: "8px 0 0" }}>
                  Checking what your moves will do…
                </p>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <ReviewForecastRows lines={forecastQuery.data ?? []} />
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px dashed ${MT.rule}`,
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <Eyebrow>Cost this round</Eyebrow>
              <div style={{ marginTop: 3, display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <Cash v={-totalCost} size={15} color={MT.ink} />
                <span style={{ color: MT.ink3, fontSize: 13 }}>· cash after</span>
                <Cash v={cashAfter} size={15} color={MT.ink} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <MarginBtn kind="ghost" size="md" onClick={onEdit} disabled={submitting}>
                ← Back to edit
              </MarginBtn>
              <MarginBtn
                kind="primary"
                size="md"
                disabled={draft.length === 0 || submitting || hasBlockingRisk}
                onClick={() => void onSubmit()}
              >
                {submitting ? "Locking…" : "✓ Lock in"}
              </MarginBtn>
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: MT.ink3,
              marginTop: 12,
              lineHeight: 1.45,
            }}
          >
            You can unlock &amp; revise from the next screen until {oppFirst} locks or the
            timer expires.
          </p>
        </div>
      </div>
    </ReviewViewportFrame>
  );
}
