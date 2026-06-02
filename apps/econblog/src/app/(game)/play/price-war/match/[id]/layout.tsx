"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { logMarginShell } from "@/client/pricewar/margin-shell-debug";
import { panelFromMatchPath, terminalVariantFromPath } from "@/client/pricewar/match-shell-paths";
import { MatchLiveProvider } from "@/components/pricewar/shell/MatchLiveProvider";
import { MatchSessionShell } from "@/components/pricewar/shell/MatchSessionShell";

export default function MatchLayout({ children: _children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const matchId = params.id;

  useEffect(() => {
    logMarginShell("MatchLayout", "route", {
      pathname,
      matchId,
      pathPanel: panelFromMatchPath(pathname),
      terminalVariant: terminalVariantFromPath(pathname),
      rendersMatchSessionShell: true,
    });
  }, [pathname, matchId]);

  return (
    <MatchLiveProvider>
      <MatchSessionShell matchId={matchId} />
    </MatchLiveProvider>
  );
}
