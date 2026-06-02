"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  COFFEE_SHOP_MOVES,
  COFFEE_SHOP_SIM,
  MOVE_BY_ID,
} from "@adamsaxion/pricewar-engine";
import type {
  Domain,
  MoveId,
  PlayerView,
  RoundReport,
  SubmittedMove,
} from "@adamsaxion/pricewar-types";
import { useLegalMoves } from "@/client/pricewar/hooks/useLegalMoves";
import { useLockForecast } from "@/client/pricewar/hooks/useLockForecast";
import { useMatchView } from "@/client/pricewar/hooks/useMatchView";
import {
  clearDraft,
  clearMatchSessionStorage,
  loadDraft,
  loadLockedMoves,
  saveDraft,
  saveLastPrivateReport,
  saveLockedMoves,
} from "@/client/pricewar/match-session-storage";
import { startPlayFlow } from "@/client/pricewar/join-queue";
import { MATCH_LOADING } from "@/client/pricewar/match-flow";
import {
  isTerminalMatchPath,
  panelFromMatchPath,
  terminalVariantFromPath,
} from "@/client/pricewar/match-shell-paths";
import { logPhaseRedirect } from "@/client/pricewar/explain-phase-redirect";
import { logMarginShell } from "@/client/pricewar/margin-shell-debug";
import { getMatchPhasePath, isActiveReportPath } from "@/client/pricewar/match-routing";
import { refreshMatchView } from "@/client/pricewar/match-view-cache";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";
import { DomainGlyph, DomainTag } from "@/components/pricewar/design-system/Domain";
import { DomainRow } from "@/components/pricewar/design-system/DomainRow";
import { DOMAIN_GLYPH_KIND, DomainGlyphIcon } from "@/components/pricewar/design-system/domain-glyphs";
import { CD } from "@/components/pricewar/design-system/tokens";
import {
  Cash,
  Eyebrow,
  MarginBtn,
  MarginPanel,
  MT,
} from "@/components/pricewar/design-system/margin-kit";
import {
  defaultMoveInput,
  estimateMoveCost,
  formatMoveInputSummary,
  moveEffectHint,
  moveInputHint,
} from "@/components/pricewar/moves/move-input";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { ForfeitDialog } from "@/components/pricewar/screens/ForfeitDialog";
import { MatchReviewPanel } from "@/components/pricewar/screens/match/MatchReviewPanel";
import { BriefingControls } from "@/components/pricewar/screens/match/MatchBriefingPanel";
import { MatchDecideCoach } from "@/components/pricewar/screens/match/MatchDecideCoach";
import { AusterityBanner, isAusterityMode } from "@/components/pricewar/screens/AusterityBanner";
import { AusterityLockLegend } from "@/components/pricewar/screens/AusterityLockLegend";
import { LessonNudge } from "@/components/pricewar/screens/shared/LessonNudge";
import { formatMoveTileMeta } from "@/client/pricewar/move-tile-meta";
import { ActionCard } from "@/components/pricewar/shell/ActionCard";
import { MatchPostmatchPanel } from "@/components/pricewar/screens/match/MatchPostmatchPanel";
import { MatchBankruptcyPanel } from "@/components/pricewar/screens/match/MatchBankruptcyPanel";
import { MatchAbandonmentPanel } from "@/components/pricewar/screens/match/MatchAbandonmentPanel";
import type { CoachReportPayload } from "@adamsaxion/pricewar-engine";
import { BattleBoard } from "@/components/pricewar/shell/BattleBoard";
import { priceWarPaths } from "@/lib/games/routes";
import {
  GameTabs,
  ShellViewport,
  usePriceWarHistory,
} from "@/components/pricewar/shell/PriceWarShellChrome";
import { MarginShellDebugStrip } from "@/components/pricewar/shell/MarginShellDebugStrip";
import { MatchLoadingGate } from "@/components/pricewar/shell/MatchLoadingGate";

type RoomPanel =
  | "match-lobby"
  | "briefing"
  | "decide"
  | "review"
  | "waiting"
  | "report"
  | "terminal-postmatch"
  | "terminal-bankruptcy"
  | "terminal-abandoned";

function isFullBleedPanel(panel: RoomPanel): boolean {
  return (
    panel === "review" ||
    panel === "terminal-postmatch" ||
    panel === "terminal-bankruptcy" ||
    panel === "terminal-abandoned"
  );
}

function abandonmentReason(view: PlayerView): string {
  if (view.outcome.kind !== "win") {
    return "The match ended because a player left or disconnected.";
  }

  const iWon = view.outcome.winner === view.me.slot;
  if (view.outcome.reason === "forfeit_on_abandonment") {
    return iWon
      ? `${view.opponent.displayName} disconnected. The match was awarded to you.`
      : "You disconnected. The match was forfeited.";
  }

  return "The match ended because a player left or disconnected.";
}

type RoundReportResponse = { report: RoundReport };

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

const DOMAIN_LABELS: Record<Domain, string> = {
  sales: "Sales",
  procurement: "Procurement",
  operations: "Operations",
  hr: "HR",
  marketing: "Marketing",
  finance: "Finance",
};

function scenarioLabel(view: PlayerView) {
  return SCENARIO_LABELS[view.scenarioId] ?? view.scenarioId;
}

function resolvePanel(view: PlayerView, pathname: string): RoomPanel {
  const terminalVariant = terminalVariantFromPath(pathname);
  if (terminalVariant === "bankruptcy") return "terminal-bankruptcy";
  if (terminalVariant === "abandoned") return "terminal-abandoned";
  if (terminalVariant === "postmatch") return "terminal-postmatch";

  const pathPanel = panelFromMatchPath(pathname);
  if (pathPanel === "review" && view.phase === "decide" && !view.meHasLocked) {
    return "review";
  }
  if (pathPanel === "briefing" && view.phase === "briefing" && view.playModeId !== "tutorial") {
    return "briefing";
  }
  if (isActiveReportPath(pathname, view)) {
    return "report";
  }
  if (view.phase === "waiting_for_opponent") return "match-lobby";
  if (view.phase === "briefing" && view.playModeId !== "tutorial") return "briefing";
  if (view.phase === "completed") {
    return "terminal-postmatch";
  }
  if (view.phase === "report") return "report";
  if (view.meHasLocked || view.phase === "resolving") return "waiting";
  return "decide";
}

function canForfeitMatch(view: PlayerView | null): view is PlayerView {
  return !!view && view.phase !== "completed";
}

function ShellForfeitButton({
  matchId,
  opponentName,
}: {
  matchId: string;
  opponentName: string;
}) {
  return (
    <ForfeitDialog
      matchId={matchId}
      opponentName={opponentName}
      redirectOnSuccess={false}
      trigger={
        <MarginBtn kind="danger" size="sm" onClick={() => {}}>
          Forfeit
        </MarginBtn>
      }
    />
  );
}

function TurnReportCard({
  view,
  report,
  latest = false,
}: {
  view: PlayerView;
  report: RoundReport;
  latest?: boolean;
}) {
  const mySlot = view.me.slot;
  const oppSlot = mySlot === "A" ? "B" : "A";
  const myDelta = report.deltas[mySlot].cashDelta;
  const oppDelta = report.deltas[oppSlot].cashDelta;
  const myDemand = report.deltas[mySlot].demandSatisfied;
  const privateSummary = report.privateSummary[mySlot];
  const ratingMatch = privateSummary.match(/Guest rating:\s*([0-9.]+)\s*stars/i);
  const rating = ratingMatch?.[1] ?? null;
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  const compare =
    myDelta >= oppDelta
      ? `you ≥ ${oppFirst} +$${oppDelta}`
      : `you < ${oppFirst} +$${Math.abs(oppDelta)}`;
  const note =
    report.publicSummary.length > 180
      ? `${report.publicSummary.slice(0, 177)}…`
      : report.publicSummary;
  const newsEvent = report.publicEvents.find((e) =>
    /news|alert|inspector|event/i.test(e.description)
  );

  return (
    <article
      style={{
        border: `1px solid ${latest ? MT.blueLine : MT.rule}`,
        borderRadius: 13,
        background: latest ? MT.card : MT.paper2,
        padding: latest ? 14 : 12,
        boxShadow: latest ? `0 0 0 3px ${MT.blueSoft}` : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h3
            className="serif"
            style={{
              margin: 0,
              fontSize: latest ? 21 : 17,
              color: MT.ink,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Turn {report.round}
          </h3>
          {latest && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: MT.blue,
                background: MT.blueSoft,
                padding: "2px 6px",
                borderRadius: 5,
              }}
            >
              LATEST
            </span>
          )}
        </div>
        <Cash v={myDelta} sign size={latest ? 20 : 16} color={myDelta >= 0 ? MT.green : MT.red} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: MT.ink2,
            fontWeight: 600,
          }}
        >
          <span aria-hidden>☕</span>
          <span className="mono">{myDemand}</span> served
        </span>
        {rating && (
          <span style={{ fontSize: 12.5, color: MT.ink2, fontWeight: 600 }}>
            ⭐ <span className="mono">{rating}</span> stars
          </span>
        )}
        <span className="mono" style={{ fontSize: 12, color: MT.ink3, marginLeft: "auto" }}>
          {compare}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: MT.ink2, lineHeight: 1.5, margin: "10px 0 0" }}>
        {note}
      </p>
      {latest && newsEvent && (
        <div
          style={{
            display: "flex",
            gap: 8,
            background: MT.paper2,
            border: `1px solid ${MT.rule}`,
            borderRadius: 10,
            padding: "9px 11px",
            marginTop: 10,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: "#eab308",
              marginTop: 4,
              flex: "0 0 auto",
            }}
          />
          <div style={{ fontSize: 12, color: MT.ink2, lineHeight: 1.4 }}>
            <b style={{ color: MT.ink }}>News:</b> {newsEvent.description}
          </div>
        </div>
      )}
    </article>
  );
}

function TurnLogPanel({
  view,
  reports,
  panel,
}: {
  view: PlayerView;
  reports: RoundReport[];
  panel: RoomPanel;
}) {
  const reportsNewestFirst = [...reports].sort((a, b) => b.round - a.round);
  const latestRound = reportsNewestFirst[0]?.round ?? null;

  return (
    <div
      style={{
        height: "calc(100dvh - 86px)",
        minHeight: 620,
        overflowY: "auto",
        background: MT.paper2,
        borderLeft: `1px solid ${MT.rule}`,
        padding: "16px 18px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="tab">Turn log</div>
        {reportsNewestFirst.length > 0 && (
          <span className="mono" style={{ fontSize: 11, color: CD.ink3 }}>
            newest first
          </span>
        )}
      </div>
      {reportsNewestFirst.length > 0 && (
        <div style={{ height: 2, background: CD.ink, margin: "8px 0 14px", width: "100%" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: reportsNewestFirst.length > 0 ? 0 : 12 }}>
        {reportsNewestFirst.length === 0 ? (
          panel !== "briefing" ? (
            <div
              style={{
                background: CD.cardstock,
                border: `1px solid ${CD.rule}`,
                borderRadius: 12,
                padding: 16,
                color: CD.ink2,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: CD.ink }}>Match setup.</strong> {view.opponent.displayName}{" "}
              entered the coffee shop duel. Turn reports will appear here after each reveal.
            </div>
          ) : null
        ) : (
          reportsNewestFirst.map((report) => (
            <TurnReportCard
              key={report.round}
              view={view}
              report={report}
              latest={report.round === latestRound}
            />
          ))
        )}
        {panel === "waiting" && (
          <div
            style={{
              background: CD.primarySoft,
              border: `1px solid ${CD.primary}`,
              borderRadius: 12,
              padding: 14,
              color: CD.ink2,
              fontSize: 13,
            }}
          >
            {view.opponentHasLocked
              ? "Both shops are locked. Resolving the round now."
              : `You locked your moves. Waiting for ${view.opponent.displayName} to lock in.`}
          </div>
        )}
        {panel === "briefing" && (
          <div
            style={{
              background: CD.cardstock,
              border: `1px solid ${CD.rule}`,
              borderRadius: 12,
              padding: 16,
              color: CD.ink2,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: CD.ink }}>Before Round 1.</strong> Check the arena and your
            cash. When you&apos;re ready, begin from the left panel — your clock is already
            ticking.
          </div>
        )}
      </div>
    </div>
  );
}

function MatchLobbyControls({ view }: { view: PlayerView }) {
  return (
    <ActionCard eyebrow="Waiting for opponent" title="Match lobby">
      <p style={{ color: CD.ink2, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
        Match starts when both players connect. {view.opponent.displayName} is expected in this room.
      </p>
    </ActionCard>
  );
}

function LockMoveRow({
  domain,
  name,
  meta,
  onRemove,
}: {
  domain: Domain;
  name: string;
  meta: string;
  onRemove: () => void;
}) {
  const accent = CD.d[domain];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: MT.card,
        border: `1px solid ${MT.rule}`,
        borderLeft: `4px solid ${accent.c}`,
        borderRadius: 11,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: accent.soft,
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        <DomainGlyphIcon kind={DOMAIN_GLYPH_KIND[domain]} color={accent.c} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: MT.ink }}>{name}</div>
        <div className="mono" style={{ fontSize: 11.5, color: MT.ink3, marginTop: 1 }}>
          {meta}
        </div>
      </div>
      <button
        type="button"
        className="mt-press"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: `1px solid ${MT.rule}`,
          background: MT.paper2,
          color: MT.ink3,
          cursor: "pointer",
          fontSize: 15,
          lineHeight: 1,
          flex: "0 0 auto",
        }}
      >
        ×
      </button>
    </div>
  );
}

function CompactMoveCard({
  moveId,
  title,
  meta,
  drafted,
  disabled,
  expanded,
  onExpand,
  suppressDisabledFade,
}: {
  moveId: MoveId;
  title: string;
  meta?: string;
  drafted: boolean;
  disabled: boolean;
  expanded: boolean;
  onExpand: () => void;
  suppressDisabledFade?: boolean;
}) {
  const move = MOVE_BY_ID.get(moveId);
  const domain = move?.domain ?? "sales";
  const accent = CD.d[domain];
  return (
    <button
      type="button"
      onClick={onExpand}
      className="cd-move mt-move-tile mt-tile mt-press"
      disabled={disabled && !drafted}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 46,
        borderRadius: 11,
        border: `1px solid ${expanded || drafted ? accent.c : CD.rule}`,
        background: drafted || expanded ? accent.soft : CD.cardstock,
        opacity: disabled && !drafted && !suppressDisabledFade ? 0.55 : 1,
        cursor: disabled && !drafted ? "not-allowed" : "pointer",
        color: CD.ink,
        padding: "12px 10px 12px 16px",
        textAlign: "left",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        boxShadow: expanded || drafted ? `0 0 0 3px ${accent.soft}` : "0 1px 0 oklch(0.25 0 0 / 0.08)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accent.c,
          borderRadius: "11px 0 0 11px",
        }}
      />
      <span className="mt-move-tile-label">{title}</span>
      {meta && (
        <span
          className="mono mt-move-tile-meta"
          style={{
            fontSize: 11,
            color: CD.ink3,
            marginLeft: "auto",
            textAlign: "right",
            lineHeight: 1.25,
          }}
        >
          {meta}
        </span>
      )}
    </button>
  );
}

function MoveInputControls({
  moveId,
  input,
  onChange,
  view,
}: {
  moveId: MoveId;
  input: unknown;
  onChange: (input: unknown) => void;
  view: PlayerView;
}) {
  const move = MOVE_BY_ID.get(moveId);
  if (!move) return null;
  const payload = input as Record<string, number | boolean | string | undefined>;
  const setField = (key: string, value: number | boolean | string) =>
    onChange({ ...(input as Record<string, unknown>), [key]: value });
  const effect = moveEffectHint(move, input, {
    opponentPrice: view.opponent.currentPrice,
    currentPrice: view.me.currentPrice,
  });
  const hint = moveInputHint(move, input, {
    opponentPrice: view.opponent.currentPrice,
    cash: view.me.cash,
    staffCount: view.me.staffCount,
  });
  const cost = estimateMoveCost(move.id, input, { staffCount: view.me.staffCount });
  const newPriceValue =
    typeof payload.newPrice === "number" ? payload.newPrice : move.input.kind === "slider" ? (move.input.default ?? move.input.min) : 0;
  const amountValue =
    typeof payload.amount === "number" ? payload.amount : move.input.kind === "amount" ? move.input.min : 0;
  const unitsValue =
    typeof payload.units === "number" ? payload.units : move.input.kind === "stepper" ? (move.input.default ?? move.input.min) : 0;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {move.input.kind === "slider" && (
        <label style={{ display: "grid", gap: 6 }}>
          <span className="tab">Set value</span>
          <input
            type="range"
            min={move.input.min}
            max={move.input.max}
            step={move.input.step}
            value={newPriceValue}
            onChange={(event) => setField("newPrice", Number(event.target.value))}
          />
          <strong className="num serif" style={{ fontSize: 24, color: CD.ink }}>
            {newPriceValue}
            {move.input.unit ?? "¢"}
          </strong>
        </label>
      )}
      {move.input.kind === "amount" && (
        <label style={{ display: "grid", gap: 6 }}>
          <span className="tab">Spend</span>
          <input
            type="range"
            min={move.input.min}
            max={Math.min(move.input.max, view.me.cash)}
            step={25}
            value={amountValue}
            onChange={(event) => setField("amount", Number(event.target.value))}
          />
          <strong className="num serif" style={{ fontSize: 24, color: CD.ink }}>
            {move.input.currency ?? "$"}
            {amountValue.toLocaleString()}
          </strong>
        </label>
      )}
      {move.input.kind === "stepper" && (
        <label style={{ display: "grid", gap: 6 }}>
          <span className="tab">Units</span>
          <input
            type="number"
            min={move.input.min}
            max={move.input.max}
            step={move.input.step}
            value={unitsValue}
            onChange={(event) => setField("units", Number(event.target.value))}
            style={{ padding: 9, borderRadius: 8, border: `1px solid ${CD.rule}` }}
          />
        </label>
      )}
      {move.input.kind === "toggle" && (
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="tab">This round</span>
          <input
            type="checkbox"
            checked={payload.enabled !== false}
            onChange={(event) => setField("enabled", event.target.checked)}
          />
        </label>
      )}
      {move.input.kind === "singleChoice" && (
        <label style={{ display: "grid", gap: 6 }}>
          <span className="tab">Choice</span>
          <select
            value={String(payload.choiceId ?? move.input.options[0]?.id ?? "")}
            onChange={(event) => setField("choiceId", event.target.value)}
            style={{ padding: 9, borderRadius: 8, border: `1px solid ${CD.rule}` }}
          >
            {move.input.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {move.input.kind === "mode" && (
        <label style={{ display: "grid", gap: 6 }}>
          <span className="tab">Mode</span>
          <select
            value={String(payload.modeId ?? move.input.modes[0]?.id ?? "")}
            onChange={(event) => setField("modeId", event.target.value)}
            style={{ padding: 9, borderRadius: 8, border: `1px solid ${CD.rule}` }}
          >
            {move.input.modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div style={{ display: "grid", gap: 4, paddingTop: 6, borderTop: `1px dashed ${CD.rule}` }}>
        {effect && (
          <p style={{ margin: 0, color: CD.ink, fontSize: 13, lineHeight: 1.45 }}>
            <strong>Effect:</strong> {effect}
          </p>
        )}
        {hint && hint !== move.description && (
          <p style={{ margin: 0, color: CD.ink3, fontSize: 12.5, lineHeight: 1.45 }}>{hint}</p>
        )}
        <p className="num" style={{ margin: 0, color: CD.ink2, fontSize: 12 }}>
          Cost: ${cost.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function DecideControls({
  matchId,
  view,
  draft,
  setDraft,
  cardInputs,
  setCardInputs,
  austerityMode = false,
}: {
  matchId: string;
  view: PlayerView;
  draft: SubmittedMove[];
  setDraft: Dispatch<SetStateAction<SubmittedMove[]>>;
  cardInputs: Record<string, unknown>;
  setCardInputs: Dispatch<SetStateAction<Record<string, unknown>>>;
  austerityMode?: boolean;
}) {
  const [activeDomain, setActiveDomain] = useState<Domain>("sales");
  const [expandedMoveId, setExpandedMoveId] = useState<MoveId | null>(null);
  const { data: legalByMove } = useLegalMoves(matchId, draft);
  const draftedIds = useMemo(() => new Set(draft.map((d) => d.moveId)), [draft]);
  const movesByDomain = useMemo(
    () =>
      (["sales", "procurement", "operations", "hr", "marketing", "finance"] as Domain[])
        .map((domain) => ({
          domain,
          moves: COFFEE_SHOP_MOVES.filter((m) => m.domain === domain),
        }))
        .filter((group) => group.moves.length > 0),
    []
  );
  const visibleDomains = movesByDomain.map((g) => g.domain);
  const domainMoves = movesByDomain.find((g) => g.domain === activeDomain)?.moves ?? [];
  const visibleMoves = austerityMode ? COFFEE_SHOP_MOVES : domainMoves;
  const expandedMove = visibleMoves.find((move) => move.id === expandedMoveId) ?? null;
  const expandedInput = expandedMove ? getCardInput(expandedMove.id) : null;
  const expandedCost = expandedMove && expandedInput
    ? estimateMoveCost(expandedMove.id, expandedInput, { staffCount: view.me.staffCount })
    : 0;
  const expandedLegal = expandedMove ? legalByMove?.get(expandedMove.id) : null;
  const expandedDraftDisabled = expandedMove
    ? (draft.length >= 3 && !draftedIds.has(expandedMove.id)) ||
      expandedCost > view.me.cash ||
      (expandedLegal != null && !expandedLegal.available)
    : false;
  useEffect(() => {
    if (!visibleDomains.includes(activeDomain) && visibleDomains[0]) {
      setActiveDomain(visibleDomains[0]);
    }
  }, [activeDomain, visibleDomains]);

  function getCardInput(moveId: MoveId) {
    if (cardInputs[moveId] != null) return cardInputs[moveId];
    const def = MOVE_BY_ID.get(moveId);
    if (!def) return {};
    return defaultMoveInput(def, view.me.currentPrice);
  }

  function setCardInput(moveId: MoveId, input: unknown) {
    setCardInputs((prev) => ({ ...prev, [moveId]: input }));
    setDraft((prev) => prev.map((m) => (m.moveId === moveId ? { ...m, input } : m)));
  }

  function toggleDraft(moveId: MoveId) {
    if (draftedIds.has(moveId)) {
      setDraft((prev) => prev.filter((m) => m.moveId !== moveId));
      return;
    }
    if (draft.length >= 3) return;
    const def = MOVE_BY_ID.get(moveId);
    if (!def) return;
    setDraft((prev) => [
      ...prev,
      {
        moveId,
        input: getCardInput(moveId),
        draftedAt: new Date().toISOString(),
      },
    ]);
  }


  return (
    <MarginPanel pad={16}>
      {austerityMode ? (
        <Eyebrow>Affordable this round</Eyebrow>
      ) : (
        <>
          <Eyebrow>Domains · Round {view.market.currentRound}</Eyebrow>
          <h2
            className="serif"
            style={{ fontSize: 26, color: MT.ink, margin: "4px 0 14px", fontWeight: 600, lineHeight: 1.08 }}
          >
            What will you do?
          </h2>
          <DomainRow active={activeDomain} onPick={setActiveDomain} domains={visibleDomains} />
        </>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 8,
          marginTop: austerityMode ? 10 : 14,
        }}
      >
        {visibleMoves.map((move) => {
          const input = getCardInput(move.id);
          const cost = estimateMoveCost(move.id, input, { staffCount: view.me.staffCount });
          const unaffordable = cost > view.me.cash;
          const legal = legalByMove?.get(move.id);
          const blocked = legal != null && !legal.available;
          const disabled =
            (draft.length >= 3 && !draftedIds.has(move.id)) || unaffordable || blocked;
          const meta = formatMoveTileMeta(move, cost, legal, view.me.cash);
          const card = (
            <CompactMoveCard
              moveId={move.id}
              title={move.name}
              meta={meta}
              drafted={draftedIds.has(move.id)}
              disabled={disabled}
              expanded={expandedMoveId === move.id}
              onExpand={() => setExpandedMoveId((prev) => (prev === move.id ? null : move.id))}
              suppressDisabledFade={austerityMode}
            />
          );
          if (austerityMode && disabled && !draftedIds.has(move.id)) {
            return (
              <div key={move.id} style={{ opacity: 0.42, position: "relative" }}>
                {card}
              </div>
            );
          }
          return <div key={move.id}>{card}</div>;
        })}
      </div>
      {expandedMove && (
        <DecideMoveDetail
          move={expandedMove}
          input={expandedInput}
          view={view}
          drafted={draftedIds.has(expandedMove.id)}
          draftDisabled={expandedDraftDisabled}
          {...(expandedLegal != null && !expandedLegal.available && expandedLegal.reason
            ? { blockedReason: expandedLegal.reason }
            : {})}
          onToggleDraft={() => toggleDraft(expandedMove.id)}
          onChangeInput={(next) => setCardInput(expandedMove.id, next)}
        />
      )}
    </MarginPanel>
  );
}

function DraftLockTray({
  draft,
  setDraft,
  view,
  onReview,
}: {
  draft: SubmittedMove[];
  setDraft: Dispatch<SetStateAction<SubmittedMove[]>>;
  view: PlayerView;
  onReview: () => void;
}) {
  const totalCost = draft.reduce(
    (sum, move) =>
      sum +
      estimateMoveCost(move.moveId, move.input, {
        staffCount: view.me.staffCount,
      }),
    0
  );
  const cashAfter = view.me.cash - totalCost;

  return (
    <MarginPanel pad={16} style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <Eyebrow>Moves to lock</Eyebrow>
        <span className="mono" style={{ fontSize: 12, color: MT.ink3, whiteSpace: "nowrap" }}>
          {draft.length} / 3 slots
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2].map((i) => {
          const entry = draft[i];
          if (!entry) {
            return (
              <div
                key={`empty-${i}`}
                style={{
                  border: `1px dashed ${MT.ink4}`,
                  borderRadius: 11,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: MT.ink3,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Slot {i + 1} · empty
              </div>
            );
          }
          const def = MOVE_BY_ID.get(entry.moveId);
          if (!def) return null;
          return (
            <LockMoveRow
              key={`${entry.moveId}-${i}`}
              domain={def.domain}
              name={def.name}
              meta={formatMoveInputSummary(def, entry.input)}
              onRemove={() => setDraft((prev) => prev.filter((_, idx) => idx !== i))}
            />
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "14px 0",
          paddingTop: 12,
          borderTop: `1px dashed ${MT.rule}`,
        }}
      >
        <Eyebrow>Cost this round</Eyebrow>
        <span className="mono" style={{ fontSize: 14, color: MT.ink2 }}>
          <Cash v={-totalCost} size={14} color={MT.ink} />{" "}
          <span style={{ color: MT.ink3 }}>· after</span>{" "}
          <Cash v={cashAfter} size={14} color={MT.ink} />
        </span>
      </div>
      <MarginBtn kind="primary" size="lg" full disabled={draft.length === 0} onClick={onReview}>
        Review and lock →
      </MarginBtn>
    </MarginPanel>
  );
}

function DecideMoveDetail({
  move,
  input,
  view,
  drafted,
  draftDisabled,
  blockedReason,
  onToggleDraft,
  onChangeInput,
}: {
  move: (typeof COFFEE_SHOP_MOVES)[number];
  input: unknown;
  view: PlayerView;
  drafted: boolean;
  draftDisabled: boolean;
  blockedReason?: string;
  onToggleDraft: () => void;
  onChangeInput: (input: unknown) => void;
}) {
  const accent = CD.d[move.domain];
  const effect =
    moveEffectHint(move, input, {
      opponentPrice: view.opponent.currentPrice,
      currentPrice: view.me.currentPrice,
    }) ?? "—";
  const cost = estimateMoveCost(move.id, input, { staffCount: view.me.staffCount });

  return (
    <div
      style={{
        border: `1px solid ${accent.c}`,
        boxShadow: `0 0 0 3px ${accent.soft}`,
        borderRadius: 13,
        padding: 15,
        background: MT.card,
        marginTop: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: accent.soft,
                display: "grid",
                placeItems: "center",
              }}
            >
              <DomainGlyphIcon kind={DOMAIN_GLYPH_KIND[move.domain]} color={accent.c} size={15} />
            </div>
            <DomainTag domain={move.domain} />
          </div>
          <h3 className="serif" style={{ fontSize: 21, color: MT.ink, lineHeight: 1.05, margin: 0 }}>
            {move.name}
          </h3>
        </div>
        <MarginBtn
          kind="ghost"
          size="sm"
          onClick={onToggleDraft}
          disabled={draftDisabled && !drafted}
        >
          {drafted ? "Remove draft" : "Add to draft"}
        </MarginBtn>
      </div>
      <p style={{ fontSize: 13, color: MT.ink2, lineHeight: 1.5, margin: "10px 0 12px" }}>
        {move.description}
      </p>
      {blockedReason && (
        <p style={{ margin: "0 0 10px", color: MT.red, fontSize: 12.5, fontWeight: 700 }}>
          {blockedReason}
        </p>
      )}
      <MoveInputControls moveId={move.id} input={input} onChange={onChangeInput} view={view} />
      <div
        style={{
          display: "flex",
          gap: 18,
          paddingTop: 11,
          marginTop: 14,
          borderTop: `1px dashed ${MT.rule}`,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>Effect</Eyebrow>
          <div className="mono" style={{ fontSize: 13, color: MT.ink, marginTop: 3 }}>
            {effect}
          </div>
        </div>
        <div>
          <Eyebrow>Cost</Eyebrow>
          <div style={{ marginTop: 3 }}>
            <Cash v={cost} size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MoveSummaryRow({ entry }: { entry: SubmittedMove }) {
  const def = MOVE_BY_ID.get(entry.moveId);
  if (!def) {
    return (
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          fontSize: 13,
        }}
      >
        <strong style={{ color: CD.ink }}>{entry.moveId}</strong>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 8,
        background: `linear-gradient(90deg, ${CD.d[def.domain].soft}, ${CD.paperDeep} 34%)`,
        border: `1px solid ${CD.d[def.domain].c}`,
        fontSize: 13,
      }}
    >
      <DomainGlyph domain={def.domain} size={34} />
      <div style={{ minWidth: 0 }}>
        <strong style={{ color: CD.ink }}>{def.name}</strong>
        <span style={{ color: CD.ink3 }}> · {formatMoveInputSummary(def, entry.input)}</span>
      </div>
    </div>
  );
}

function WaitingControls({
  view,
  lockedMoves,
}: {
  view: PlayerView;
  lockedMoves: SubmittedMove[];
}) {
  return (
    <ActionCard
      eyebrow={`Round ${view.market.currentRound} · awaiting reveal`}
      title={view.opponentHasLocked ? "Both shops are locked." : "You're locked in."}
    >
      <p style={{ color: CD.ink2, fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>
        {view.opponentHasLocked
          ? "Resolving the round now."
          : `${view.opponent.displayName} is still deciding.`}
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {lockedMoves.map((entry, i) => (
          <MoveSummaryRow key={`${entry.moveId}-${i}`} entry={entry} />
        ))}
      </div>
    </ActionCard>
  );
}

function ReportControls({
  view,
  latestReport,
  continuing,
  onContinue,
}: {
  view: PlayerView;
  latestReport: RoundReport | null;
  continuing: boolean;
  onContinue: () => void;
}) {
  const myDelta = latestReport?.deltas[view.me.slot].cashDelta;
  return (
    <ActionCard
      eyebrow={`Report · Round ${view.market.lastResolvedRound ?? view.market.currentRound}`}
      title="Round resolved."
    >
      <p style={{ color: CD.ink2, fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>
        The report has been added to the turn log. Review it, then continue.
      </p>
      {myDelta != null && (
        <div className="num serif" style={{ fontSize: 34, color: myDelta >= 0 ? CD.green : CD.red, marginBottom: 12 }}>
          {myDelta >= 0 ? "+" : "−"}${Math.abs(myDelta).toLocaleString()}
        </div>
      )}
      <MarginBtn kind="primary" size="lg" onClick={onContinue} disabled={continuing}>
        {continuing
          ? "Preparing..."
          : view.phase === "completed"
            ? "Post-match summary"
            : view.phase === "decide"
              ? `Continue to Round ${view.market.currentRound} →`
              : `Continue to Round ${(view.market.lastResolvedRound ?? view.market.currentRound) + 1} →`}
      </MarginBtn>
    </ActionCard>
  );
}

export function MatchSessionShell({ matchId }: { matchId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: view, isLoading } = useMatchView(matchId);
  const { showApiError } = usePriceWarError();
  const [draft, setDraft] = useState<SubmittedMove[]>([]);
  const [cardInputs, setCardInputs] = useState<Record<string, unknown>>({});
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [playAgainLoading, setPlayAgainLoading] = useState(false);

  const historyQuery = usePriceWarHistory();

  const resolvedRoundCount = view
    ? Math.max(
        0,
        Math.min(
          view.market.totalRounds,
          view.market.lastResolvedRound ?? (view.phase === "completed" ? view.market.currentRound : 0)
        )
      )
    : 0;

  const reportQueries = useQueries({
    queries: Array.from({ length: resolvedRoundCount }, (_, i) => {
      const round = i + 1;
      return {
        queryKey: ["pricewar", "match", matchId, "report", round],
        queryFn: async () => {
          const res = await fetch(`/api/pricewar/match/${matchId}/report/${round}`);
          if (!res.ok) throw new Error("Failed to load report");
          return res.json() as Promise<RoundReportResponse>;
        },
        enabled: !!view,
      };
    }),
  });

  const reports = reportQueries
    .map((query) => query.data?.report)
    .filter((report): report is RoundReport => Boolean(report));
  const latestReport =
    reports.length > 0
      ? reports.reduce((a, b) => (b.round > a.round ? b : a))
      : null;

  const summaryQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "summary"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/summary`);
      if (!res.ok) return null;
      return res.json() as Promise<{
        ratingDelta?: number | null;
        ratingAfter?: number | null;
        cashSeries?: { you?: number[]; opp?: number[] };
        demandSeries?: { you?: number[]; opp?: number[] };
        opponentFinalCash?: number | null;
      }>;
    },
    enabled: view?.phase === "completed",
  });

  const coachQuery = useQuery({
    queryKey: ["pricewar", "match", matchId, "coach"],
    queryFn: async () => {
      const res = await fetch(`/api/pricewar/match/${matchId}/coach`);
      if (!res.ok) return null;
      return res.json() as Promise<{ report?: CoachReportPayload } | null>;
    },
    enabled: view?.phase === "completed" && view?.playModeId !== "tutorial",
  });

  const coachReport = coachQuery.data?.report ?? null;

  const pathPanel = panelFromMatchPath(pathname);
  const panel = view ? resolvePanel(view, pathname) : null;

  useEffect(() => {
    if (!view) {
      logMarginShell("MatchSessionShell", "loading", { pathname, matchId, pathPanel });
      return;
    }
    const resolved = resolvePanel(view, pathname);
    logMarginShell("MatchSessionShell", "panel resolved", {
      pathname,
      matchId,
      pathPanel,
      panel: resolved,
      phase: view.phase,
      meHasLocked: view.meHasLocked,
      currentRound: view.market.currentRound,
      draftCount: draft.length,
    });
    logPhaseRedirect("MatchSessionShell", pathname, matchId, view);
  }, [
    pathname,
    matchId,
    pathPanel,
    view,
    draft.length,
  ]);

  function goReview() {
    const target = priceWarPaths.match.review(matchId);
    logMarginShell("MatchSessionShell", "navigate review", { from: pathname, to: target });
    router.replace(target);
  }

  function goDecide() {
    const target = priceWarPaths.match.root(matchId);
    logMarginShell("MatchSessionShell", "navigate decide", { from: pathname, to: target });
    router.replace(target);
  }

  useEffect(() => {
    if (!view) return;
    setDraftHydrated(false);
    const stored = loadDraft(matchId, view.market.currentRound);
    setDraft(stored);
    setCardInputs(Object.fromEntries(stored.map((move) => [move.moveId, move.input])));
    setDraftHydrated(true);
  }, [matchId, view?.market.currentRound]);

  useEffect(() => {
    if (!view || !draftHydrated || view.phase !== "decide") return;
    saveDraft(matchId, view.market.currentRound, draft);
  }, [draft, draftHydrated, matchId, view]);

  if (isLoading || !view) {
    const loadingMessage = isTerminalMatchPath(pathname)
      ? MATCH_LOADING.terminal
      : pathname.includes("/briefing")
        ? MATCH_LOADING.briefing
        : MATCH_LOADING.view;

    return (
      <ShellViewport>
        <GameTabs
          matchId={matchId}
          view={null}
          matches={historyQuery.data?.matches ?? []}
        />
        <div style={{ padding: 10 }}>
          <div
            style={{
              background: CD.paper,
              border: `1px solid ${SHELL.content.border}`,
              minHeight: 420,
            }}
          >
            <MatchLoadingGate message={loadingMessage} minHeight={420} />
          </div>
        </div>
        <MarginShellDebugStrip matchId={matchId} panel="loading" phase="—" />
      </ShellViewport>
    );
  }

  const currentView = view;
  const activePanel = panel ?? resolvePanel(currentView, pathname);
  const lockedMoves = loadLockedMoves(matchId, currentView.market.currentRound);
  const youWon =
    currentView.outcome.kind === "win" && currentView.outcome.winner === currentView.me.slot;
  const summary = summaryQuery.data;
  const cashYou =
    summary?.cashSeries?.you ?? [COFFEE_SHOP_SIM.startingCash, currentView.me.cash];
  const cashOpp =
    summary?.cashSeries?.opp ??
    [COFFEE_SHOP_SIM.startingCash, summary?.opponentFinalCash ?? COFFEE_SHOP_SIM.startingCash];
  const demandYou = summary?.demandSeries?.you ?? [];
  const demandOpp = summary?.demandSeries?.opp ?? [];
  const opponentFinalCash = summary?.opponentFinalCash ?? null;

  async function beginMatch() {
    setStarting(true);
    try {
      const res = await fetch(`/api/pricewar/match/${matchId}/start`, { method: "POST" });
      if (!res.ok) {
        showApiError(await res.json().catch(() => ({})), "Could not start match");
        return;
      }
      const freshView = await refreshMatchView(queryClient, matchId);
      if (freshView) {
        const target = getMatchPhasePath(matchId, freshView);
        logMarginShell("MatchSessionShell", "briefing begin → decide", {
          from: pathname,
          to: target,
          phase: freshView.phase,
        });
        router.replace(target);
      }
    } finally {
      setStarting(false);
    }
  }

  async function submitDraft() {
    if (!view) return;
    setSubmitting(true);
    try {
      saveLockedMoves(matchId, view.market.currentRound, draft);
      const res = await fetch(`/api/pricewar/match/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moves: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(data, "Submit failed");
        return;
      }
      clearDraft(matchId);
      await refreshMatchView(queryClient, matchId);
      const waitingTarget = priceWarPaths.match.waiting(matchId);
      logMarginShell("MatchSessionShell", "submit ok → waiting", {
        from: pathname,
        to: waitingTarget,
      });
      router.replace(waitingTarget);
    } finally {
      setSubmitting(false);
    }
  }

  async function continueFromReport() {
    setContinuing(true);
    try {
      if (latestReport) {
        const privateLine = latestReport.privateSummary[currentView.me.slot];
        if (privateLine) saveLastPrivateReport(matchId, privateLine);
      }
      if (currentView.phase !== "completed") {
        const res = await fetch(`/api/pricewar/match/${matchId}/continue`, { method: "POST" });
        if (!res.ok) {
          showApiError(await res.json().catch(() => ({})), "Could not continue match");
          return;
        }
      }
      const freshView = await refreshMatchView(queryClient, matchId);
      if (freshView) {
        router.replace(getMatchPhasePath(matchId, freshView));
      }
    } finally {
      setContinuing(false);
    }
  }

  async function playAgain() {
    setPlayAgainLoading(true);
    try {
      clearMatchSessionStorage(matchId);
      await startPlayFlow({
        playModeId: currentView.playModeId === "tutorial" ? "blitz" : currentView.playModeId,
        scenarioId: currentView.scenarioId,
        router,
        queryClient,
        onError: (body, message) => showApiError(body, message),
      });
    } finally {
      setPlayAgainLoading(false);
    }
  }

  return (
    <ShellViewport>
      <GameTabs
        matchId={matchId}
        view={view}
        matches={historyQuery.data?.matches ?? []}
        forfeitControl={
          canForfeitMatch(view) ? (
            <ShellForfeitButton matchId={matchId} opponentName={view.opponent.displayName} />
          ) : null
        }
      />
      <div style={{ padding: 10 }}>
        <div
          style={{
            background: CD.paper,
            border: `1px solid ${SHELL.content.border}`,
            minHeight: isFullBleedPanel(activePanel) ? undefined : "calc(100dvh - 100px)",
            overflow: isFullBleedPanel(activePanel) ? "hidden" : undefined,
          }}
        >
          {activePanel === "review" ? (
            <MatchReviewPanel
              embedded
              matchId={matchId}
              view={currentView}
              draft={draft}
              submitting={submitting}
              onEdit={() => goDecide()}
              onSubmit={submitDraft}
            />
          ) : activePanel === "terminal-postmatch" ? (
            currentView.phase === "completed" ? (
              <MatchPostmatchPanel
                embedded
                view={currentView}
                youWon={youWon}
                ratingDelta={summary?.ratingDelta ?? null}
                ratingAfter={summary?.ratingAfter ?? null}
                cashYou={cashYou}
                cashOpp={cashOpp}
                demandYou={demandYou}
                demandOpp={demandOpp}
                opponentFinalCash={opponentFinalCash}
                onPlayAgain={() => void playAgain()}
                playAgainLoading={playAgainLoading}
                coachReport={coachReport}
              />
            ) : (
              <MatchLoadingGate message={MATCH_LOADING.terminal} minHeight={420} />
            )
          ) : activePanel === "terminal-bankruptcy" ? (
            currentView.phase === "completed" ? (
              <MatchBankruptcyPanel
                embedded
                view={currentView}
                ratingDelta={summary?.ratingDelta ?? null}
                ratingAfter={summary?.ratingAfter ?? null}
                coachReport={coachReport}
              />
            ) : (
              <MatchLoadingGate message={MATCH_LOADING.terminal} minHeight={420} />
            )
          ) : activePanel === "terminal-abandoned" ? (
            currentView.phase === "completed" ? (
              <MatchAbandonmentPanel
                embedded
                view={currentView}
                reason={abandonmentReason(currentView)}
                partialElo={summary?.ratingDelta ?? null}
                coachReport={coachReport}
              />
            ) : (
              <MatchLoadingGate message={MATCH_LOADING.terminal} minHeight={420} />
            )
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "380px 432px 348px",
                gap: 20,
                padding: "16px 22px 26px",
              }}
              className="max-xl:grid-cols-1"
            >
              <section style={{ display: "grid", alignContent: "start", gap: 14 }}>
                {activePanel === "match-lobby" && <MatchLobbyControls view={view} />}
                {activePanel === "briefing" && (
                  <BriefingControls
                    view={view}
                    starting={starting}
                    onBegin={() => void beginMatch()}
                  />
                )}
                {activePanel === "decide" && !isAusterityMode(view.me.cash) && (
                  <>
                    <MatchDecideCoach view={view} matchId={matchId} />
                    <DecideControls
                      matchId={matchId}
                      view={view}
                      draft={draft}
                      setDraft={setDraft}
                      cardInputs={cardInputs}
                      setCardInputs={setCardInputs}
                    />
                  </>
                )}
                {activePanel === "decide" && isAusterityMode(view.me.cash) && (
                  <>
                    <AusterityBanner cash={view.me.cash} />
                    <LessonNudge
                      topic="Surviving a cash crunch"
                      mins={4}
                      ctx="You've dropped into austerity. Learn the moves that pull a shop back from the brink."
                      cta="Learn this →"
                    />
                    <AusterityLockLegend />
                  </>
                )}
                {activePanel === "waiting" && <WaitingControls view={view} lockedMoves={lockedMoves} />}
                {activePanel === "report" && (
                  <ReportControls
                    view={view}
                    latestReport={latestReport}
                    continuing={continuing}
                    onContinue={() => void continueFromReport()}
                  />
                )}
              </section>
              <section style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                {!(activePanel === "decide" && isAusterityMode(view.me.cash)) && (
                  <BattleBoard view={view} reveal={activePanel === "report"} />
                )}
                {activePanel === "decide" && isAusterityMode(view.me.cash) && (
                  <DecideControls
                    matchId={matchId}
                    view={view}
                    draft={draft}
                    setDraft={setDraft}
                    cardInputs={cardInputs}
                    setCardInputs={setCardInputs}
                    austerityMode
                  />
                )}
                {activePanel === "decide" && (
                  <DraftLockTray
                    draft={draft}
                    setDraft={setDraft}
                    view={view}
                    onReview={() => goReview()}
                  />
                )}
              </section>
              <TurnLogPanel view={view} reports={reports} panel={activePanel} />
            </div>
          )}
        </div>
      </div>
      <MarginShellDebugStrip
        matchId={matchId}
        panel={activePanel}
        phase={currentView.phase}
        shellMode="match-session-shell"
      />
    </ShellViewport>
  );
}
