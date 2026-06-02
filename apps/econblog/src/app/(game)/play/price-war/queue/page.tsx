"use client";

import { Suspense } from "react";
import { CD } from "@/components/pricewar/design-system/tokens";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";
import QueuePageInner from "./QueuePageInner";

function QueueLoadingFallback() {
  return (
    <MarginShellFrame>
      <div
        role="status"
        aria-live="polite"
        style={{
          display: "grid",
          gap: 16,
          placeItems: "center",
          textAlign: "center",
          padding: "48px 8px",
          minHeight: 320,
        }}
      >
        <div className="cd-spinner" aria-hidden="true" />
        <div>
          <div className="tab">Queue</div>
          <h1 className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 8, lineHeight: 1.1 }}>
            Loading queue…
          </h1>
        </div>
      </div>
    </MarginShellFrame>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={<QueueLoadingFallback />}>
      <QueuePageInner />
    </Suspense>
  );
}
