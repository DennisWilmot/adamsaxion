"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { getPlayMode } from "@adamsaxion/pricewar-engine";
import { AvatarOpponent } from "@/components/pricewar/design-system/avatars";
import { MarginBtn } from "@/components/pricewar/design-system/margin-kit";

export function terminalLossEyebrow(
  view: PlayerView,
  variant: "timeout" | "disconnect"
): string {
  const round = view.market.currentRound;
  if (variant === "timeout") {
    return `Match ended · Round ${round} · turn timer expired`;
  }
  return `Match ended · Round ${round} · you went inactive`;
}

export function terminalLossSubline(
  view: PlayerView,
  variant: "timeout" | "disconnect"
): ReactNode {
  const opp = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  if (variant === "timeout") {
    return (
      <>
        Your turn clock hit zero before you locked. The match resolves in {opp}&apos;s favor.
      </>
    );
  }
  return (
    <>
      You missed consecutive turns, so the match auto-resolved. {opp} takes it by default.
    </>
  );
}

function turnClockCaption(playModeId: string): string {
  const mode = getPlayMode(playModeId);
  if (!mode?.clock) return "no turn clock";
  return `${mode.label.toLowerCase()} · ${mode.shortLabel}`;
}

export function OpponentWinsStrip({ opponentName }: { opponentName: string }) {
  return (
    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[#f3c0c0] bg-[#fdeaea] px-3.5 py-2.5">
      <AvatarOpponent size={30} />
      <span className="text-[13.5px] font-semibold text-[#0b1220]">
        {opponentName} wins this match.
      </span>
      <span className="ml-auto text-[12.5px] text-[#8a93a2]">
        Result recorded · counts as a loss
      </span>
    </div>
  );
}

export function TimeoutLossBody({
  view,
  playModeId,
}: {
  view: PlayerView;
  playModeId: string;
}) {
  const round = view.market.currentRound;
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-[#e4e8ef] bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a2]">
          What happened
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-[#46505f]">
          You had a turn pending in Round {round} and the timer ran out. No moves were
          submitted, so the round couldn&apos;t resolve and the match was forfeited on time.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e4e8ef] bg-white p-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a2]">
          At expiry
        </p>
        <p className="mono mt-1 text-[40px] font-semibold leading-none text-[#dc2626]">
          0:00
        </p>
        <p className="mt-1 text-[12.5px] text-[#8a93a2]">{turnClockCaption(playModeId)}</p>
      </div>
    </div>
  );
}

export function DisconnectLossBody({ view }: { view: PlayerView }) {
  return (
    <div className="mt-3 rounded-2xl border border-[#e4e8ef] bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a2]">
        What happened
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#46505f]">
        We held the round and notified you, but no move landed before the grace window closed.{" "}
        <b className="font-semibold text-[#0b1220]">Reconnecting next time keeps the match live</b>{" "}
        — abandonment losses carry the full Elo hit and no review.
      </p>
    </div>
  );
}

export function TerminalFooterActions({
  opponentName,
  lobbyHref,
  onRematch,
  rematchLoading,
}: {
  opponentName: string;
  lobbyHref: string;
  onRematch: () => void;
  rematchLoading?: boolean;
}) {
  const oppFirst = opponentName.split(" ")[0] ?? opponentName;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
      <Link href={lobbyHref} className="no-underline">
        <MarginBtn kind="ghost" size="md">
          ← Lobby
        </MarginBtn>
      </Link>
      <MarginBtn
        kind="primary"
        size="md"
        onClick={onRematch}
        {...(rematchLoading ? { disabled: true } : {})}
      >
        {rematchLoading ? "Starting…" : `Rematch ${oppFirst}`}
      </MarginBtn>
    </div>
  );
}
