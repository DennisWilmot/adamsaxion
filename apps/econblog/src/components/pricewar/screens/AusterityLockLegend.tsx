"use client";

import { Eyebrow, MarginPanel, StatusPill } from "@/components/pricewar/design-system/margin-kit";

export function AusterityLockLegend() {
  return (
    <MarginPanel pad={16}>
      <Eyebrow>Lock variants — visually distinct</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <StatusPill tone="warn">🔒 austerity</StatusPill>
        <StatusPill tone="ink">🔒 cooldown</StatusPill>
        <StatusPill tone="ink">🔒 prerequisite</StatusPill>
      </div>
    </MarginPanel>
  );
}
