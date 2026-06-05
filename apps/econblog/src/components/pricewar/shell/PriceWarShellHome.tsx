"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startPlayFlow } from "@/client/pricewar/join-queue";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { MarginRulesSidePanel } from "@/components/pricewar/shell/MarginRulesSidePanel";
import { ShellKanbanHome } from "@/components/pricewar/shell/ShellKanbanHome";
import {
  GameTabs,
  ShellViewport,
  usePriceWarHistory,
} from "@/components/pricewar/shell/PriceWarShellChrome";
import { isMarginRatedEnabledClient } from "@/lib/games/margin-flags";
import { DEFAULT_MARGIN_PLAY_MODE } from "@/lib/games/margin-play-mode";

export function PriceWarShellHome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showApiError } = usePriceWarError();
  const historyQuery = usePriceWarHistory();
  const [starting, setStarting] = useState(false);
  const [selectedMode, setSelectedMode] = useState(DEFAULT_MARGIN_PLAY_MODE);
  const [rulesOpen, setRulesOpen] = useState(false);

  const subscriptionQuery = useQuery({
    queryKey: ["user", "subscription"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) return { subscription: { hasAccess: false } };
      return res.json();
    },
  });
  const isPaid = subscriptionQuery.data?.subscription?.hasAccess === true;

  const ratingQuery = useQuery({
    queryKey: ["pricewar", "rating", "coffee-shop", DEFAULT_MARGIN_PLAY_MODE],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricewar/rating/coffee-shop?playModeId=${DEFAULT_MARGIN_PLAY_MODE}`,
      );
      if (!res.ok) return { rating: null };
      return res.json() as Promise<{ rating: number }>;
    },
    enabled: isPaid && isMarginRatedEnabledClient(),
  });

  async function startPlay() {
    setStarting(true);
    try {
      await startPlayFlow({
        playModeId: selectedMode,
        router,
        queryClient,
        onError: (body, message) => showApiError(body, message),
      });
    } finally {
      setStarting(false);
    }
  }

  return (
    <ShellViewport>
      <GameTabs
        matches={historyQuery.data?.matches ?? []}
        view={null}
        elo={ratingQuery.data?.rating ?? null}
        rulesOpen={rulesOpen}
        onToggleRules={() => setRulesOpen((open) => !open)}
      />
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ShellKanbanHome
            matches={historyQuery.data?.matches ?? []}
            onPlay={() => void startPlay()}
            loading={starting}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            isPaid={isPaid}
          />
        </div>
        {rulesOpen ? (
          <MarginRulesSidePanel id="margin-rules-panel" onClose={() => setRulesOpen(false)} />
        ) : null}
      </div>
    </ShellViewport>
  );
}
