"use client";

import type { ReactNode } from "react";

const TONE_STYLES = {
  win: {
    wrap: "border-[#b6d0fb] bg-[#e8f0ff]",
    stat: "text-[#15803d]",
  },
  loss: {
    wrap: "border-[#f3c0c0] bg-[#fdeaea]",
    stat: "text-[#dc2626]",
  },
  neutral: {
    wrap: "border-[#e4e8ef] bg-[#f7f9fc]",
    stat: "text-[#15803d]",
  },
} as const;

export function OutcomeBanner({
  tone,
  eyebrow,
  title,
  sub,
  stat,
  statLabel,
}: {
  tone: "win" | "loss" | "neutral";
  eyebrow: string;
  title: string;
  sub: ReactNode;
  stat: string;
  statLabel: string;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-[22px] ${styles.wrap}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a2]">
          {eyebrow}
        </p>
        <h1 className="serif mt-1 text-[32px] font-bold leading-[1.05] text-[#0b1220]">
          {title}
        </h1>
        <div className="mt-1.5 text-[13.5px] leading-snug text-[#46505f]">{sub}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`mono text-[30px] font-semibold leading-none ${styles.stat}`}>
          {stat}
        </div>
        <div className="mt-0.5 text-xs text-[#8a93a2]">{statLabel}</div>
      </div>
    </div>
  );
}
