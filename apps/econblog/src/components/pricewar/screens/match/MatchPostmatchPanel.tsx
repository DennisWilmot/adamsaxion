"use client";

import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { CoachReportPayload } from "@adamsaxion/pricewar-engine";
import { MatchTerminalFrame } from "./MatchTerminalFrame";
import { OutcomeBanner } from "./OutcomeBanner";
import { CoachLessonBlock } from "@/components/pricewar/screens/shared/CoachLessonBlock";
import { lessonMetaForSlug } from "@/client/pricewar/lesson-slug-meta";
import { LessonNudge } from "@/components/pricewar/screens/shared/LessonNudge";
import { TrajChart } from "@/components/pricewar/screens/shared/TrajChart";
import { MarginBtn } from "@/components/pricewar/design-system/margin-kit";
import {
  DisconnectLossBody,
  OpponentWinsStrip,
  TerminalFooterActions,
  TimeoutLossBody,
  terminalLossEyebrow,
  terminalLossSubline,
} from "./terminal-loss-end";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";
import Link from "next/link";
import { priceWarPaths } from "@/lib/games/routes";

const SCENARIO_LABELS: Record<string, string> = {
  "coffee-shop": "Coffee Shop · Downtown",
};

const LOSS_END_LESSONS = {
  timeout: {
    topic: "Managing your turn clock",
    mins: 3,
    ctx: "Your clock ran out before you locked. Learn how to plan a turn so time never decides it for you.",
    cta: "Learn this →",
  },
  disconnect: {
    topic: "Don't lose on a no-show",
    mins: 3,
    ctx: "An abandonment carries a full Elo hit. Learn the habits that keep you from dropping a live match.",
    cta: "Learn this →",
  },
} as const;

export function MatchPostmatchPanel({
  view,
  youWon,
  ratingDelta,
  ratingAfter,
  cashYou,
  cashOpp,
  demandYou = [],
  demandOpp = [],
  opponentFinalCash,
  coachReport,
  onPlayAgain,
  playAgainLoading = false,
  embedded = false,
}: {
  view: PlayerView;
  youWon: boolean;
  ratingDelta: number | null;
  ratingAfter: number | null;
  cashYou: number[];
  cashOpp: number[];
  demandYou?: number[];
  demandOpp?: number[];
  opponentFinalCash: number | null;
  coachReport?: CoachReportPayload | null;
  onPlayAgain: () => void;
  playAgainLoading?: boolean;
  embedded?: boolean;
}) {
  const scenario = SCENARIO_LABELS[view.scenarioId] ?? view.scenarioId;
  const oppFirst = view.opponent.displayName.split(" ")[0] ?? view.opponent.displayName;
  const isTutorial = view.playModeId === "tutorial";
  const ratedEnabled = isMarginRatedEnabledClient();
  const timeoutLoss =
    !youWon &&
    view.outcome.kind === "win" &&
    view.outcome.reason === "forfeit_on_timeout";
  const disconnectLoss =
    !youWon &&
    view.outcome.kind === "win" &&
    view.outcome.reason === "forfeit_on_abandonment";
  const lossEndVariant = timeoutLoss ? "timeout" : disconnectLoss ? "disconnect" : null;

  const headline = isTutorial
    ? "Tutorial complete."
    : youWon
      ? `You won · vs ${oppFirst}`
      : timeoutLoss
        ? "You ran out of time."
        : disconnectLoss
          ? "You disconnected."
          : `${oppFirst} won this one.`;

  const marginDiff =
    opponentFinalCash != null && !isTutorial ? view.me.cash - opponentFinalCash : null;

  const subline = lossEndVariant
    ? terminalLossSubline(view, lossEndVariant)
    : marginDiff != null
          ? (
              <>
                Final cash <b>${view.me.cash.toLocaleString()}</b> vs {oppFirst}{" "}
                <b>${opponentFinalCash!.toLocaleString()}</b>
                {marginDiff !== 0 && (
                  <>
                    {" "}
                    · margin{" "}
                    <b>
                      {marginDiff >= 0 ? "+" : "−"}${Math.abs(marginDiff).toLocaleString()}
                    </b>
                  </>
                )}
              </>
            )
          : !isTutorial && ratedEnabled && ratingDelta == null
            ? "Unrated match. Your rating did not change."
            : null;

  const tone = isTutorial ? "neutral" : youWon ? "win" : "loss";
  const eyebrow = lossEndVariant
    ? terminalLossEyebrow(view, lossEndVariant)
    : `Match complete · ${view.market.totalRounds} rounds · ${scenario}`;

  const stat =
    ratedEnabled && ratingDelta != null && !isTutorial
      ? `${ratingDelta >= 0 ? "+" : ""}${ratingDelta} Elo`
      : `$${view.me.cash.toLocaleString()}`;

  const statLabel =
    ratedEnabled && ratingDelta != null && !isTutorial
      ? ratingAfter != null
        ? `now ${ratingAfter.toLocaleString()}`
        : "Rating change"
      : "Final cash";

  const lessonPreset = lossEndVariant ? LOSS_END_LESSONS[lossEndVariant] : null;
  const lessonSlug = coachReport?.recommendedLessonSlugs?.[0];
  const lessonTopic = lessonSlug
    ? lessonMetaForSlug(lessonSlug).title
    : lessonPreset?.topic ?? "Managing your turn clock";

  if (lossEndVariant) {
    return (
      <MatchTerminalFrame
        embedded={embedded}
        backdropOpacity={0.05}
        backdropHeight={200}
        align="start"
        footer={
          <>
            <LessonNudge
              topic={lessonTopic}
              mins={lessonPreset!.mins}
              ctx={
                coachReport?.whatToImprove?.[0] ??
                coachReport?.turningPoint?.explanation ??
                lessonPreset!.ctx
              }
              cta={lessonPreset!.cta}
              {...(lessonSlug ? { lessonHref: `/lessons/${lessonSlug}` } : {})}
            />
            <TerminalFooterActions
              opponentName={view.opponent.displayName}
              lobbyHref={priceWarPaths.lobby}
              onRematch={onPlayAgain}
              rematchLoading={playAgainLoading}
            />
          </>
        }
      >
        <OutcomeBanner
          tone="loss"
          eyebrow={eyebrow}
          title={headline}
          sub={subline}
          stat={stat}
          statLabel={statLabel}
        />
        <OpponentWinsStrip opponentName={view.opponent.displayName} />
        {lossEndVariant === "timeout" ? (
          <TimeoutLossBody view={view} playModeId={view.playModeId} />
        ) : (
          <DisconnectLossBody view={view} />
        )}
      </MatchTerminalFrame>
    );
  }

  return (
    <MatchTerminalFrame
      embedded={embedded}
      backdropOpacity={0.05}
      backdropHeight={200}
      align="start"
      footer={
        !isTutorial ? (
          <CoachLessonBlock
            verdict={
              coachReport?.oneLinerVerdict ??
              "Every match teaches something — lock in the habit that cost you least."
            }
            report={coachReport ?? null}
            matchActions={{
              onPlayAgain,
              playAgainLoading,
              lobbyHref: priceWarPaths.lobby,
            }}
          />
        ) : undefined
      }
    >
      <OutcomeBanner
        tone={tone}
        eyebrow={eyebrow}
        title={headline}
        sub={subline ?? " "}
        stat={stat}
        statLabel={statLabel}
      />

      {cashYou.length > 1 && !isTutorial && (
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <TrajChart
            title={`Cash · ${cashYou.length - 1} rounds`}
            you={cashYou}
            opp={cashOpp}
            fmt={(v) => `$${v.toLocaleString()}`}
            {...(coachReport?.whatToImprove?.[0]
              ? { sub: coachReport.whatToImprove[0] }
              : {})}
          />
          {demandYou.length > 1 && (
            <TrajChart
              title={`Customers served · ${demandYou.length} rounds`}
              you={demandYou}
              opp={demandOpp}
              fmt={(v) => String(v)}
            />
          )}
        </div>
      )}

      {isTutorial && (
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <MarginBtn kind="primary" size="lg" onClick={onPlayAgain} disabled={playAgainLoading}>
            {playAgainLoading ? "Starting…" : "Play again →"}
          </MarginBtn>
          <Link href={priceWarPaths.lobby} className="no-underline">
            <MarginBtn kind="ghost" size="md">
              Back to lobby
            </MarginBtn>
          </Link>
        </div>
      )}
    </MatchTerminalFrame>
  );
}
