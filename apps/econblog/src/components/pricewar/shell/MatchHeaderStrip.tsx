import type { PlayerView } from "@adamsaxion/pricewar-types";
import { Badge } from "@/components/ui/badge";
import { ForfeitMatchDialog } from "@/components/pricewar/shell/ForfeitMatchDialog";

function formatMs(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function MatchHeaderStrip({
  view,
  isRated,
  ratingAtStart,
  matchId,
}: {
  view: PlayerView;
  isRated?: boolean;
  ratingAtStart?: number | null;
  matchId?: string;
}) {
  const lowTime = view.myClockMs < 60_000;
  const botTransparent = process.env.NEXT_PUBLIC_BOT_TRANSPARENT === "true";

  return (
    <div className="mb-xl flex flex-wrap items-center justify-between gap-md rounded-lg border border-border bg-surface-raised p-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-md">
        <Badge variant="outline">
          Round {view.market.currentRound} / {view.market.totalRounds}
        </Badge>
        {botTransparent && view.opponent.isBot && (
          <Badge variant="secondary">Bot</Badge>
        )}
        {isRated === false && (
          <Badge variant="secondary">Unrated match</Badge>
        )}
        {isRated && ratingAtStart != null && (
          <Badge variant="outline" className="text-gold">
            Rating {ratingAtStart}
          </Badge>
        )}
        <span className="text-sm text-foreground-secondary">
          Cash: <strong className="text-foreground">${view.me.cash.toLocaleString()}</strong>
        </span>
        <span className="text-sm text-foreground-secondary">
          Opponent price: <strong className="text-foreground">{view.opponent.currentPrice}¢</strong>
        </span>
      </div>
      <div className="flex items-center gap-md">
        <Badge className={lowTime ? "bg-error-subtle text-error" : undefined}>
          {formatMs(view.myClockMs)}
        </Badge>
        <Badge variant={view.opponentHasLocked ? "default" : "secondary"}>
          {view.opponentHasLocked ? "Opponent: Locked ✓" : "Opponent: deciding…"}
        </Badge>
        {matchId && view.phase !== "completed" && view.playModeId !== "tutorial" && (
          <ForfeitMatchDialog matchId={matchId} />
        )}
      </div>
    </div>
  );
}
