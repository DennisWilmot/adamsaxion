"use client";

import type { ReactNode } from "react";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import { useUserProfile } from "@/client/hooks/useUserProfile";
import {
  GameTabs,
  ShellViewport,
  usePriceWarHistory,
} from "@/components/pricewar/shell/PriceWarShellChrome";
import { ShellContentCard } from "@/components/pricewar/shell/ShellContentCard";

export { isMarginShellFramedPath, isMarginShellHomePath } from "@/client/pricewar/match-shell-paths";

export function MarginShellFrame({
  children,
  matchId,
  view,
  forfeitControl,
  contentPadding,
  flat,
  elo,
  eloTrend,
}: {
  children: ReactNode;
  matchId?: string;
  view?: PlayerView | null;
  forfeitControl?: ReactNode;
  contentPadding?: number;
  /** Single shell lane — no nested content card (ladder, etc.). */
  flat?: boolean;
  elo?: number | null;
  eloTrend?: string | null;
}) {
  const historyQuery = usePriceWarHistory();
  const profileQuery = useUserProfile();

  return (
    <ShellViewport>
      <GameTabs
        {...(matchId ? { matchId } : {})}
        view={view ?? null}
        matches={historyQuery.data?.matches ?? []}
        {...(forfeitControl ? { forfeitControl } : {})}
        {...(elo != null ? { elo } : {})}
        {...(eloTrend != null ? { eloTrend } : {})}
        avatarUrl={profileQuery.data?.avatarUrl ?? null}
      />
      {flat ? (
        <div style={{ padding: "22px 24px 30px", maxWidth: 980, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      ) : (
        <ShellContentCard minHeight={420} {...(contentPadding != null ? { padding: contentPadding } : {})}>
          {children}
        </ShellContentCard>
      )}
    </ShellViewport>
  );
}
