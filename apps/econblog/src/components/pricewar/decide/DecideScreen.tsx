"use client";

import { useEffect, useMemo, useState } from "react";
import type { Domain, MoveId, PlayerView, SubmittedMove } from "@adamsaxion/pricewar-types";
import { DOMAINS } from "@adamsaxion/pricewar-types";
import { COFFEE_SHOP_MOVES, getTutorialNarration } from "@adamsaxion/pricewar-engine";
import type { TutorialNarrationStep } from "@adamsaxion/pricewar-engine";
import { MOVE_BY_ID } from "@adamsaxion/pricewar-engine";
import { useLegalMoves } from "@/client/pricewar/hooks/useLegalMoves";
import { CafeDuelRoot } from "@/components/pricewar/design-system/CafeDuelRoot";
import { CoachBubble } from "@/components/pricewar/design-system/CoachBubble";
import { DomainTabs } from "@/components/pricewar/design-system/Domain";
import { MatchBar } from "@/components/pricewar/design-system/MatchBar";
import { PickSlot } from "@/components/pricewar/design-system/PickSlot";
import { PillBtn } from "@/components/pricewar/design-system/controls";
import { CD } from "@/components/pricewar/design-system/tokens";
import { InlineMoveCard } from "@/components/pricewar/moves/InlineMoveCard";
import {
  defaultMoveInput,
  estimateMoveCost,
  formatMoveInputSummary,
} from "@/components/pricewar/moves/move-input";
import { ForfeitDialog } from "@/components/pricewar/screens/ForfeitDialog";
import { AusterityBanner, isAusterityMode } from "@/components/pricewar/screens/AusterityBanner";
import { useCashTrend } from "./useCashTrend";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

function buildCoachLine(
  view: PlayerView,
  tutorialStep?: TutorialNarrationStep,
  lastPrivateReport?: string | null
): { label: string; text: string } {
  if (tutorialStep) {
    const text = tutorialStep.hint
      ? `${tutorialStep.title} — ${tutorialStep.hint}`
      : `${tutorialStep.title} ${tutorialStep.body}`;
    return { label: "Prof. Aldo · Tutorial", text };
  }

  if (lastPrivateReport && view.market.currentRound > 1) {
    const snippet =
      lastPrivateReport.length > 160
        ? `${lastPrivateReport.slice(0, 157)}…`
        : lastPrivateReport;
    return {
      label: "Prof. Aldo · Coach",
      text: `Last round: ${snippet} — what do you change this round?`,
    };
  }

  const opp = view.opponent.displayName;
  const price = view.opponent.currentPrice;

  if (view.opponentHasLocked) {
    return {
      label: "Prof. Aldo · Coach",
      text: `${opp} just locked at ${price}¢ — a clear signal. If you stay premium, hold your nerve. If you blink, blink hard.`,
    };
  }

  if (view.me.inventory < 30) {
    return {
      label: "Prof. Aldo · Coach",
      text: "Inventory is thin. A procurement move now beats a flashy price cut later.",
    };
  }

  if (view.me.cash < 500) {
    return {
      label: "Prof. Aldo · Coach",
      text: "Cash is getting tight. Every spend this round needs to earn its keep.",
    };
  }

  return {
    label: "Prof. Aldo · Coach",
    text: `${opp} is at ${price}¢ on the menu. Three moves, one round — make them count.`,
  };
}

export interface DecideScreenProps {
  matchId: string;
  view: PlayerView;
  onReview: (draft: SubmittedMove[]) => void;
}

export function DecideScreen({ matchId, view, onReview }: DecideScreenProps) {
  const [activeDomain, setActiveDomain] = useState<Domain>("sales");
  const [draft, setDraft] = useState<SubmittedMove[]>([]);
  const [cardInputs, setCardInputs] = useState<Record<string, unknown>>({});
  const [lastPrivateReport, setLastPrivateReport] = useState<string | null>(null);

  const { data: legalByMove } = useLegalMoves(matchId, draft);

  const cashTrend = useCashTrend(matchId, view.me.cash);

  const movesByDomain = useMemo(
    () =>
      DOMAINS.map((domain) => ({
        domain,
        moves: COFFEE_SHOP_MOVES.filter((m) => m.domain === domain),
      })).filter((g) => g.moves.length > 0),
    []
  );

  const visibleDomains = movesByDomain.map((g) => g.domain);
  const visibleMoves =
    movesByDomain.find((g) => g.domain === activeDomain)?.moves ?? [];

  const draftedIds = useMemo(() => new Set(draft.map((d) => d.moveId)), [draft]);

  const totalCost = useMemo(
    () =>
      draft.reduce(
        (sum, m) =>
          sum +
          estimateMoveCost(m.moveId, m.input, {
            staffCount: view.me.staffCount,
          }),
        0
      ),
    [draft, view.me.staffCount]
  );

  const tutorialStep =
    view.playModeId === "tutorial"
      ? getTutorialNarration(view.market.currentRound)
      : undefined;

  useEffect(() => {
    const stored = sessionStorage.getItem(`pricewar:lastPrivateReport:${matchId}`);
    setLastPrivateReport(stored);
  }, [matchId, view.market.currentRound]);

  const coach = buildCoachLine(view, tutorialStep, lastPrivateReport);

  function getCardInput(moveId: MoveId) {
    if (cardInputs[moveId] != null) return cardInputs[moveId];
    const def = MOVE_BY_ID.get(moveId);
    if (!def) return {};
    return defaultMoveInput(def, view.me.currentPrice);
  }

  function setCardInput(moveId: MoveId, input: unknown) {
    setCardInputs((prev) => ({ ...prev, [moveId]: input }));
    setDraft((prev) =>
      prev.map((m) => (m.moveId === moveId ? { ...m, input } : m))
    );
  }

  function toggleDraft(moveId: MoveId) {
    if (draftedIds.has(moveId)) {
      setDraft((prev) => prev.filter((m) => m.moveId !== moveId));
      return;
    }
    if (draft.length >= 3) return;
    const def = MOVE_BY_ID.get(moveId);
    if (!def) return;
    const input = getCardInput(moveId);
    setDraft((prev) => [
      ...prev,
      {
        moveId,
        input,
        draftedAt: new Date().toISOString(),
      },
    ]);
  }

  useEffect(() => {
    if (!visibleDomains.includes(activeDomain) && visibleDomains[0]) {
      setActiveDomain(visibleDomains[0]);
    }
  }, [activeDomain, visibleDomains]);

  const scenarioLabel = SCENARIO_LABELS[view.scenarioId] ?? "Price War";
  const austerity = isAusterityMode(view.me.cash);

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "4px 0 28px" }}>
      <MatchBar
        scenario={scenarioLabel}
        round={view.market.currentRound}
        total={view.market.totalRounds}
        timerMs={view.myClockMs}
        you={{
          name: "You",
          cash: view.me.cash,
          trend: cashTrend,
        }}
        opp={{
          name: view.opponent.displayName,
          elo: null,
          price: view.opponent.currentPrice,
          locked: view.opponentHasLocked,
          isBot: view.opponent.isBot,
        }}
        forfeitSlot={
          view.playModeId !== "tutorial" ? (
            <ForfeitDialog matchId={matchId} opponentName={view.opponent.displayName} />
          ) : undefined
        }
      />

      {austerity && <AusterityBanner cash={view.me.cash} />}

      <div style={{ marginTop: 18 }}>
        <CoachBubble label={coach.label}>{coach.text}</CoachBubble>
      </div>

      <div className="mt-[22px] grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div className="tab">Your hand · Round {view.market.currentRound}</div>
              <h2 className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 2 }}>
                Pick up to 3 moves
              </h2>
            </div>
            <DomainTabs active={activeDomain} onPick={setActiveDomain} domains={visibleDomains} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {visibleMoves.length ? (
              visibleMoves.map((move) => {
                const input = getCardInput(move.id);
                const cost = estimateMoveCost(move.id, input, { staffCount: view.me.staffCount });
                const unaffordable = austerity && cost > view.me.cash;
                const legal = legalByMove?.get(move.id);
                const blocked = legal != null && !legal.available;
                const blockReason = legal?.reason;
                return (
                  <div key={move.id} style={{ position: "relative" }}>
                    <div
                      style={
                        unaffordable ? { opacity: 0.4, pointerEvents: "none" } : undefined
                      }
                    >
                      <InlineMoveCard
                        move={move}
                        input={input}
                        onChange={(next) => setCardInput(move.id, next)}
                        drafted={draftedIds.has(move.id)}
                        onToggleDraft={() => toggleDraft(move.id)}
                        draftDisabled={
                          (draft.length >= 3 && !draftedIds.has(move.id)) ||
                          unaffordable ||
                          blocked
                        }
                        {...(blocked && blockReason ? { unavailableReason: blockReason } : {})}
                        opponentPrice={view.opponent.currentPrice}
                        currentPrice={view.me.currentPrice}
                        cash={view.me.cash}
                      />
                    </div>
                    {unaffordable && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "grid",
                          placeItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            background: CD.paperDeep,
                            color: CD.ink2,
                            border: `1px solid ${CD.rule}`,
                          }}
                        >
                          ${cost.toLocaleString()} · can&apos;t afford
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "40px 20px",
                  textAlign: "center",
                  color: CD.ink3,
                  border: `1px dashed ${CD.rule}`,
                  borderRadius: 14,
                }}
              >
                <div className="serif" style={{ fontSize: 22, color: CD.ink2 }}>
                  No moves in {activeDomain} yet.
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="lg:sticky lg:top-4"
          style={{
            background: CD.cardstock,
            border: `1px solid ${CD.rule}`,
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <h3 className="serif" style={{ fontSize: 22, color: CD.ink }}>
              My picks
            </h3>
            <span style={{ fontSize: 12, color: CD.ink3 }}>
              <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>
                {draft.length}
              </span>{" "}
              / 3
            </span>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {[0, 1, 2].map((i) => {
              const entry = draft[i];
              if (!entry) {
                return <PickSlot key={i} idx={i + 1} />;
              }
              const def = MOVE_BY_ID.get(entry.moveId);
              if (!def) return <PickSlot key={i} idx={i + 1} />;
              return (
                <PickSlot
                  key={entry.moveId}
                  idx={i + 1}
                  pick={{
                    domain: def.domain,
                    title: def.name,
                    value: formatMoveInputSummary(def, entry.input),
                  }}
                  onRemove={() =>
                    setDraft((prev) => prev.filter((_, j) => j !== i))
                  }
                />
              );
            })}
          </div>

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              <span style={{ color: CD.ink3 }}>After commit</span>
              <span className="num" style={{ color: CD.ink2 }}>
                ${(view.me.cash - totalCost).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <PillBtn
              variant="solid"
              color={CD.ink}
              size="lg"
              full
              disabled={draft.length === 0}
              onClick={() => onReview(draft)}
            >
              Review &amp; lock {draft.length} move{draft.length === 1 ? "" : "s"}{" "}
              <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: CD.ink3, marginTop: 8 }}>
            You can revise until both players lock.
          </div>
        </div>
      </div>
    </CafeDuelRoot>
  );
}
