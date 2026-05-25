"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CafeDuelRoot } from "@/components/pricewar/design-system/CafeDuelRoot";
import { AvatarPlayer } from "@/components/pricewar/design-system/avatars";
import { CD } from "@/components/pricewar/design-system/tokens";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { priceWarPaths } from "@/lib/games/routes";

export default function TutorialStartPage() {
  const router = useRouter();
  const { showApiError } = usePriceWarError();

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const res = await fetch("/api/pricewar/match/vs-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "coffee-shop",
          playModeId: "tutorial",
        }),
      });
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        showApiError(data, "Could not start tutorial");
        router.replace(priceWarPaths.lobby);
        return;
      }
      router.replace(priceWarPaths.match.decide(data.matchId));
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [router, showApiError]);

  return (
    <CafeDuelRoot
      style={{
        background: CD.paper,
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: 36,
      }}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <AvatarPlayer size={88} ring={CD.primary} />
        <div
          className="cd-pulse"
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 16,
            border: `2px solid ${CD.primary}`,
            opacity: 0.5,
          }}
        />
      </div>
      <div className="tab" style={{ marginTop: 24 }}>
        Tutorial
      </div>
      <h1 className="serif" style={{ fontSize: 32, color: CD.ink, marginTop: 8 }}>
        Setting up your first match…
      </h1>
      <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8 }}>
        Guided practice. No clock, no rating impact.
      </p>
    </CafeDuelRoot>
  );
}
