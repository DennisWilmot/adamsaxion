"use client";

import { Suspense } from "react";
import QueuePageInner from "./QueuePageInner";

export default function QueuePage() {
  return (
    <Suspense fallback={<p className="text-foreground-muted">Loading queue…</p>}>
      <QueuePageInner />
    </Suspense>
  );
}
