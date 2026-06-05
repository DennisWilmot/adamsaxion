"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactQueryProvider } from "@/client/pricewar/providers/QueryProvider";
import { logMarginShell } from "@/client/pricewar/margin-shell-debug";
import { isMarginShellFramedPath, isMatchSessionPath } from "@/client/pricewar/match-shell-paths";
import { CafeDuelRoot } from "@/components/pricewar/design-system/CafeDuelRoot";
import { SHELL } from "@/components/pricewar/design-system/shell-tokens";
import { CD } from "@/components/pricewar/design-system/tokens";
import { PriceWarErrorProvider } from "@/components/pricewar/screens/PriceWarErrorModal";
import { CATALOG_PAGE_SHELL_CLASS, isPlayHubPath } from "@/lib/catalog-page-shell";
import { cn } from "@/lib/utils";

export function GameShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShellFramed = isMarginShellFramedPath(pathname);
  const isMatchShell = isMatchSessionPath(pathname);
  const isMarginShell = isShellFramed || isMatchShell;
  const isPlayHub = isPlayHubPath(pathname);
  const shellMode = isShellFramed ? "framed" : isMatchShell ? "match-session" : "legacy-full-page";

  useEffect(() => {
    logMarginShell("GameShell", "wrap", {
      pathname,
      isShellFramed,
      isMatchShell,
      shellMode,
      transparentBg: isShellFramed || isMatchShell,
    });
  }, [pathname, isShellFramed, isMatchShell, shellMode]);

  const shellContent = (
    <div
      className={cn(isPlayHub ? CATALOG_PAGE_SHELL_CLASS : "mx-auto w-full max-w-[1400px] px-6")}
      style={
        isPlayHub
          ? undefined
          : {
              paddingBottom: 32,
              paddingTop: isMarginShell ? SHELL.belowGlobalHeaderGap : 32,
            }
      }
    >
      {children}
    </div>
  );

  return (
    <ReactQueryProvider>
      <PriceWarErrorProvider>
        {isPlayHub ? (
          shellContent
        ) : (
          <CafeDuelRoot
            style={{
              minHeight: isMarginShell ? "calc(100dvh - var(--header-height))" : undefined,
              background: isMarginShell ? "transparent" : CD.paper,
            }}
          >
            {shellContent}
          </CafeDuelRoot>
        )}
      </PriceWarErrorProvider>
    </ReactQueryProvider>
  );
}
