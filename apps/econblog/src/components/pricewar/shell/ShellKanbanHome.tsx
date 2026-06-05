"use client";

import Link from "next/link";
import type { HistoryMatch } from "@/client/pricewar/history-match";
import {
  getHistoryMatchHref,
  kanbanActionLabel,
  kanbanCardKind,
  kanbanMatchesByColumn,
  kanbanTimerLabel,
} from "@/client/pricewar/kanban-utils";
import { OpponentAvatarFace, resolveOpponentAvatarKind } from "@/components/pricewar/design-system/opponent-avatar";
import {
  MarginBtn,
  MarginPanel,
  MT,
  StatusDot,
  StatusPill,
} from "@/components/pricewar/design-system/margin-kit";
import { ModePicker } from "@/components/pricewar/shell/ModePicker";

export function ShellKanbanHome({
  matches,
  onPlay,
  loading,
  selectedMode,
  onSelectMode,
  isPaid,
}: {
  matches: HistoryMatch[];
  onPlay: () => void;
  loading: boolean;
  selectedMode: string;
  onSelectMode: (modeId: string) => void;
  isPaid: boolean;
}) {
  const cols = kanbanMatchesByColumn(matches);
  const resultWaiting = cols["up-next"].filter((m) => m.phase === "report").length;
  const activeTotal =
    cols["up-next"].length + cols.submitted.length + cols.waiting.length;

  return (
    <div style={{ padding: "22px 24px 30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <ModePicker selectedMode={selectedMode} onSelectMode={onSelectMode} isPaid={isPaid} />
          <MarginBtn
            kind="primary"
            size="md"
            onClick={onPlay}
            disabled={loading}
            {...(loading ? {} : { className: "cd-pulse" })}
          >
            {loading ? "Finding game…" : "Play →"}
          </MarginBtn>
        </div>
        <div style={{ textAlign: "right" }}>
          <h1
            className="serif"
            style={{ fontSize: 30, color: MT.ink, fontWeight: 700, margin: 0, lineHeight: 1.05 }}
          >
            {activeTotal === 0
              ? "Start your first match"
              : `${activeTotal} active${resultWaiting ? ` · ${resultWaiting} result waiting` : ""}`}
          </h1>
        </div>
      </div>

      {activeTotal === 0 ? (
        <MarginPanel pad={40} style={{ textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: 26, color: MT.ink, margin: 0 }}>
            No active matches yet
          </h2>
          <p
            style={{
              fontSize: 14,
              color: MT.ink2,
              marginTop: 8,
              maxWidth: 420,
              marginInline: "auto",
            }}
          >
            Hit Play to find an opponent. Finished matches collapse into History in the top bar.
          </p>
        </MarginPanel>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}
          className="max-lg:grid-cols-1"
        >
          <KanbanColumn title="Up next" tone={MT.blue} items={cols["up-next"]} />
          <KanbanColumn title="Submitted" tone={MT.green} items={cols.submitted} />
          <KanbanColumn title="Waiting" tone={MT.ink4} items={cols.waiting} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginTop: 16,
          padding: "13px 16px",
          background: MT.card,
          border: `1px solid ${MT.rule}`,
          borderRadius: 13,
        }}
      >
        <span style={{ fontSize: 13, color: MT.ink2 }}>
          Finished matches collapse into <b style={{ color: MT.blue }}>History</b> (top bar).
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: HistoryMatch[];
}) {
  return (
    <div
      style={{
        background: MT.paper2,
        border: `1px solid ${MT.rule}`,
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13.5,
            fontWeight: 700,
            color: MT.ink,
          }}
        >
          <StatusDot color={tone} />
          {title}
        </span>
        <span className="mono" style={{ fontSize: 12, color: MT.ink3 }}>
          {items.length}
        </span>
      </div>
      {items.map((g) => (
        <KanbanCard key={g.matchId} match={g} />
      ))}
      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: 18, fontSize: 12.5, color: MT.ink3 }}>
          nothing here
        </div>
      )}
    </div>
  );
}

function KanbanCard({ match }: { match: HistoryMatch }) {
  const kind = kanbanCardKind(match);
  const action = kanbanActionLabel(kind);
  const result = kind === "result";
  const yourTurn = kind === "your-turn";

  return (
    <Link href={getHistoryMatchHref(match)} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="mt-tile mt-press"
        style={{
          background: MT.card,
          border: `1px solid ${result ? MT.warnLine : yourTurn ? MT.blueLine : MT.rule}`,
          borderRadius: 13,
          padding: 13,
          cursor: "pointer",
          boxShadow: result ? `0 0 0 3px ${MT.warnSoft}` : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, color: MT.ink3 }}>
            Coffee Shop · R{match.currentRound ?? 1}/{match.totalRounds ?? 8}
          </span>
          {result ? (
            <StatusPill tone="warn">result ready</StatusPill>
          ) : yourTurn ? (
            <StatusPill tone="blue">your turn</StatusPill>
          ) : kind === "submitted" ? (
            <StatusPill tone="green">submitted</StatusPill>
          ) : (
            <span className="mono" style={{ fontSize: 11.5, color: MT.ink3 }}>
              {kanbanTimerLabel(match)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0" }}>
          <OpponentAvatarFace
            kind={resolveOpponentAvatarKind({
              ...(match.opponentName ? { opponentName: match.opponentName } : {}),
              ...(match.opponentIsBot != null ? { opponentIsBot: match.opponentIsBot } : {}),
            })}
            size={34}
            ring={MT.rule}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: MT.ink }}>
              {match.opponentName ?? "Opponent"}
            </div>
            <div className="mono" style={{ fontSize: 11, color: MT.ink3, marginTop: 1 }}>
              {match.phase.replaceAll("_", " ")}
            </div>
          </div>
        </div>
        {action && (
          <div style={{ paddingTop: 10, borderTop: `1px dashed ${MT.rule}` }}>
            <MarginBtn kind="primary" size="sm">
              {action}
            </MarginBtn>
          </div>
        )}
      </div>
    </Link>
  );
}
