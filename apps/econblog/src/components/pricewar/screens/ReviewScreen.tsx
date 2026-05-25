"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerView, SubmittedMove } from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "@adamsaxion/pricewar-engine";
import { useLockForecast } from "@/client/pricewar/hooks/useLockForecast";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { DomainGlyph } from "../design-system/Domain";
import { MatchBar } from "../design-system/MatchBar";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { formatMoveInputSummary, estimateMoveCost } from "../moves/move-input";
import { useCashTrend } from "../decide/useCashTrend";
import { priceWarPaths } from "@/lib/games/routes";
import { saveLockedMoves } from "./LockedScreen";
import { LockForecastPanel } from "./LockForecastPanel";
import { ModalShell } from "./shared/ModalShell";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

export interface ReviewScreenProps {
  matchId: string;
  view: PlayerView;
  draft: SubmittedMove[];
  onSubmit: () => Promise<void>;
  submitting?: boolean;
}

export function ReviewScreen({ matchId, view, draft, onSubmit, submitting }: ReviewScreenProps) {
  const router = useRouter();
  const cashTrend = useCashTrend(matchId, view.me.cash);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const scenarioLabel = SCENARIO_LABELS[view.scenarioId] ?? "Price War";

  const totalCost = draft.reduce(
    (sum, m) => sum + estimateMoveCost(m.moveId, m.input),
    0
  );
  const forecastQuery = useLockForecast(matchId, draft);
  const hasRisk = forecastQuery.data?.some((l) => l.kind === "risk") ?? false;

  async function lockIn() {
    saveLockedMoves(matchId, draft);
    await onSubmit();
    setConfirmOpen(false);
  }

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
      />

      <div
        style={{
          marginTop: 22,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 18,
          padding: "28px 26px",
          maxWidth: 640,
        }}
      >
        <div className="tab">Review · Round {view.market.currentRound}</div>
        <h1 className="serif" style={{ fontSize: 36, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
          Lock these moves?
        </h1>
        <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, lineHeight: 1.5 }}>
          Once sealed, your opponent won&apos;t see hidden picks until reveal. You can&apos;t change
          them after locking.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
          {draft.length === 0 ? (
            <p style={{ color: CD.ink3 }}>No moves drafted.</p>
          ) : (
            draft.map((move, i) => {
              const def = MOVE_BY_ID.get(move.moveId);
              if (!def) return null;
              return (
                <div
                  key={`${move.moveId}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: CD.paper,
                    border: `1px solid ${CD.rule}`,
                    borderRadius: 10,
                  }}
                >
                  <DomainGlyph domain={def.domain} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: CD.ink, fontWeight: 600 }}>{def.name}</div>
                    <div style={{ fontSize: 12, color: CD.ink3, marginTop: 2 }}>
                      {formatMoveInputSummary(def, move.input)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {forecastQuery.isLoading && draft.length > 0 ? (
          <p style={{ fontSize: 13, color: CD.ink3, marginTop: 16 }}>Building forecast…</p>
        ) : forecastQuery.data ? (
          <LockForecastPanel lines={forecastQuery.data} />
        ) : null}

        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            background: CD.paperDeep,
            borderRadius: 10,
            border: `1px solid ${CD.rule}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: CD.ink3 }}>Spend this round</span>
            <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>
              −${totalCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <PillBtn
            variant="outline"
            color={CD.ink}
            onClick={() => router.push(priceWarPaths.match.decide(matchId))}
          >
            Back to edit
          </PillBtn>
          <PillBtn
            variant="solid"
            color={CD.ink}
            disabled={draft.length === 0 || !!submitting || hasRisk}
            onClick={() => setConfirmOpen(true)}
          >
            Lock {draft.length} move{draft.length === 1 ? "" : "s"}{" "}
            <span style={{ opacity: 0.6 }}>→</span>
          </PillBtn>
        </div>
      </div>

      {confirmOpen && (
        <ModalShell width={480} onScrimClick={() => !submitting && setConfirmOpen(false)}>
          <div style={{ padding: "24px 26px" }}>
            <div className="tab">Final check</div>
            <h2 className="serif" style={{ fontSize: 26, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
              Seal your orders?
            </h2>
            <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, lineHeight: 1.5 }}>
              No take-backs after this. Hidden moves stay hidden until both sides lock or the clock
              expires.
            </p>
            {hasRisk && (
              <p style={{ fontSize: 13, color: CD.red, marginTop: 8, lineHeight: 1.45 }}>
                Resolve the risks in the forecast before locking, or go back and edit your hand.
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <PillBtn variant="ghost" color={CD.ink3} onClick={() => setConfirmOpen(false)} disabled={!!submitting}>
                Cancel
              </PillBtn>
              <PillBtn variant="solid" color={CD.primary} onClick={() => void lockIn()} disabled={!!submitting || hasRisk}>
                {submitting ? "Locking…" : "Confirm lock"}
              </PillBtn>
            </div>
          </div>
        </ModalShell>
      )}
    </CafeDuelRoot>
  );
}
