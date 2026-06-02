"use client";

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { HistoryMatch } from "@/client/pricewar/history-match";
import { isActiveHistoryMatch } from "@/client/pricewar/history-match";
import { priceWarHistoryQueryKey } from "@/client/pricewar/match-view-cache";
import { CD } from "@/components/pricewar/design-system/tokens";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";
import Link from "next/link";
import { priceWarPaths } from "@/lib/games/routes";
import { isMatchSessionPath } from "@/client/pricewar/match-shell-paths";
import { MT } from "@/components/pricewar/design-system/margin-kit";
import { MarginShellWordmark, ShellEloChip } from "@/components/pricewar/shell/BrandBar";

export function phaseTabLabel(view: PlayerView): string {
  if (view.phase === "completed") return "Complete";
  if (view.phase === "report") {
    return `Report ${view.market.lastResolvedRound ?? view.market.currentRound}`;
  }
  if (view.meHasLocked || view.phase === "resolving") return "Waiting";
  if (view.phase === "briefing") return "Briefing";
  if (view.phase === "waiting_for_opponent") return "Lobby";
  return `Round ${view.market.currentRound}`;
}

export function activeHistoryMatches(matches: HistoryMatch[]) {
  return matches.filter(isActiveHistoryMatch);
}

function isLiveShellView(view: PlayerView | null): view is PlayerView {
  return !!view && view.phase !== "completed" && isActiveHistoryMatch({ phase: view.phase } as HistoryMatch);
}

export function usePriceWarHistory() {
  return useQuery({
    queryKey: priceWarHistoryQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/pricewar/history", { cache: "no-store" });
      if (!res.ok) return { matches: [] as HistoryMatch[] };
      return res.json() as Promise<{ matches: HistoryMatch[] }>;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function ShellViewport({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "calc(100dvh - var(--header-height))",
        background: SHELL.viewportGradient,
        margin: "0 -1.5rem",
      }}
    >
      {children}
    </div>
  );
}

export const SquareBtn = forwardRef(function SquareBtn(
  {
    children,
    variant = "solid",
    color = CD.ink,
    onClick,
    disabled,
    full,
    size = "md",
  }: {
    children: ReactNode;
    variant?: "solid" | "outline" | "ghost";
    color?: string;
    onClick?: () => void;
    disabled?: boolean;
    full?: boolean;
    size?: "sm" | "md" | "lg";
  },
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const sizes = {
    sm: { padding: "7px 10px", fontSize: 12 },
    md: { padding: "10px 14px", fontSize: 13.5 },
    lg: { padding: "12px 16px", fontSize: 15 },
  };
  const tone =
    variant === "solid"
      ? { background: color, color: CD.paper, border: `1px solid ${color}` }
      : variant === "outline"
        ? { background: CD.cardstock, color, border: `1px solid ${color}` }
        : { background: "transparent", color, border: `1px solid ${CD.rule}` };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: full ? "100%" : undefined,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 750,
        opacity: disabled ? 0.5 : 1,
        boxShadow: variant === "solid" ? "0 2px 0 oklch(0.2 0 0 / 0.12)" : "none",
        ...sizes[size],
        ...tone,
      }}
    >
      {children}
    </button>
  );
});

function ShellNavButton({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        borderRadius: 999,
        textDecoration: "none",
        border: `1px solid ${active ? MT.blueLine : MT.rule}`,
        background: active ? MT.blueSoft : MT.card,
        fontSize: 13,
        fontWeight: 600,
        color: active ? MT.blue : MT.ink2,
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

export function GameTabs({
  matchId,
  view,
  matches,
  forfeitControl,
  elo,
  eloTrend,
}: {
  matchId?: string;
  view: PlayerView | null;
  matches: HistoryMatch[];
  forfeitControl?: ReactNode;
  elo?: number | null;
  eloTrend?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const onShellHome =
    pathname === priceWarPaths.lobby || pathname.startsWith(`${priceWarPaths.lobby}/queue`);
  const onLadder = pathname === priceWarPaths.leaderboard;
  const onHistory = pathname === priceWarPaths.history;
  const inMatch = isMatchSessionPath(pathname);
  const homeTabActive = onShellHome && !inMatch;

  const active = activeHistoryMatches(matches);
  const tabMatches =
    matchId && isLiveShellView(view) && !active.some((m) => m.matchId === matchId)
      ? [
          {
            matchId,
            opponentName: view?.opponent.displayName ?? "Loading",
            phase: view?.phase ?? "loading",
            playModeId: view?.playModeId ?? DEFAULT_MARGIN_PLAY_MODE,
            outcomeKind: view?.outcome.kind ?? "in_progress",
            outcomeReason: null,
            ratingDelta: null,
            updatedAt: new Date().toISOString(),
            ...(view
              ? { currentRound: view.market.currentRound, totalRounds: view.market.totalRounds }
              : {}),
          } satisfies HistoryMatch,
          ...active,
        ]
      : active;

  function goHome() {
    if (!onShellHome) {
      router.push(priceWarPaths.lobby);
    }
  }

  const showElo = elo != null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        padding: "6px 8px 0",
        background: SHELL.tabBarGradient,
        borderBottom: `1px solid ${SHELL.tabBorder}`,
        position: "sticky",
        top: "var(--header-height)",
        zIndex: 40,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: "0 14px 10px 10px",
          marginRight: 6,
        }}
      >
        <MarginShellWordmark />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "end",
          gap: 4,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={goHome}
          style={{
            border: `1px solid ${SHELL.tabBorder}`,
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            background: homeTabActive ? CD.paper : SHELL.tabInactiveBg,
            color: homeTabActive ? CD.ink : CD.ink2,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: homeTabActive ? 800 : 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Home
        </button>
        {tabMatches.slice(0, 5).map((m) => {
          const selected = inMatch && m.matchId === matchId;
          const label =
            m.matchId === matchId
              ? `vs ${view?.opponent.displayName ?? "Loading"} · ${view ? phaseTabLabel(view) : "Loading"}`
              : `vs ${m.opponentName ?? "Opponent"} · ${m.phase === "report" ? "Report" : m.phase}`;
          return (
            <button
            key={m.matchId}
            type="button"
            onClick={() => {
              if (selected) return;
              router.push(priceWarPaths.match.root(m.matchId));
            }}
            style={{
              border: `1px solid ${SHELL.tabBorder}`,
              borderBottom: selected ? `1px solid ${CD.paper}` : "none",
              borderRadius: "8px 8px 0 0",
              background: selected ? CD.paper : SHELL.tabInactiveBg,
              color: selected ? CD.ink : CD.ink2,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: selected ? 800 : 650,
              cursor: "pointer",
              maxWidth: 220,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={label}
          >
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={goHome}
          style={{
            marginLeft: 4,
            border: `1px solid ${SHELL.tabBorder}`,
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            background: SHELL.tabAddBg,
            color: CD.ink,
            padding: "8px 13px",
            fontWeight: 800,
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Open shell home"
        >
          +
        </button>
      </div>

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 8px 8px",
          marginLeft: 8,
        }}
      >
        {showElo && <ShellEloChip elo={elo} {...(eloTrend != null ? { eloTrend } : {})} />}
        {inMatch && forfeitControl}
        <ShellNavButton
          href={priceWarPaths.leaderboard}
          label="Ladder"
          active={onLadder}
        />
        <ShellNavButton
          href={priceWarPaths.history}
          label="History"
          active={onHistory}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={onHistory ? MT.blue : MT.ink3}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
