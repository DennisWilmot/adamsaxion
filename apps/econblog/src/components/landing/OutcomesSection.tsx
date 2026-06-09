"use client";

import { useEffect, useRef, useState } from "react";
import { OUTCOME_STATS } from "@/lib/landing/content";

const STAT_CYCLE_MS = 4000;

export function OutcomesSection() {
  return (
    <section
      id="outcomes"
      className="border-y border-border-subtle bg-surface px-xl py-4xl"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-start gap-3xl lg:gap-[4.5rem]">
          <div className="min-w-[280px] flex-[1_1_400px]">
            <p className="mb-sm font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
              Outcomes
            </p>
            <h2 className="mb-lg font-display text-[clamp(1.875rem,4.5vw,2.75rem)] font-semibold leading-[1.12] text-foreground">
              Learn at undergrad depth.
              <br />
              Prove it under pressure.
            </h2>
            <p className="max-w-[440px] font-body text-base leading-relaxed text-foreground-secondary">
              Quiz gates, mastery exams, and Margin matches test whether the ideas stuck — not
              whether you watched a video.
            </p>
          </div>

          <StatsPanel />
        </div>
      </div>
    </section>
  );
}

function StatsPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % OUTCOME_STATS.length);
    }, STAT_CYCLE_MS);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <div className="min-w-[260px] flex-[1_1_300px]">
      <p className="mb-lg font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
        By the end of the curriculum
      </p>
      <div className="border-t border-border-subtle">
        {OUTCOME_STATS.map((stat, index) => (
          <StatRow
            key={stat.label}
            stat={stat}
            index={index}
            active={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}

function StatRow({
  stat,
  index,
  active,
}: {
  stat: (typeof OUTCOME_STATS)[number];
  index: number;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative grid grid-cols-[7rem_1fr] sm:grid-cols-[8rem_1fr] items-center gap-x-xl overflow-hidden border-b border-border-subtle py-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active ? "bg-surface-sunken/60" : "bg-transparent"
      } ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{
        transitionDelay: visible ? `${index * 0.08}s` : "0s",
      }}
    >
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      )}

      <span
        className={`relative z-10 font-display text-[clamp(2rem,3.5vw,2.625rem)] font-bold tabular-nums leading-none text-primary text-right whitespace-nowrap transition-transform duration-500 ${
          active ? "scale-105" : "scale-100"
        }`}
      >
        {stat.value}
      </span>

      <div className="relative z-10 min-w-0 text-left">
        <p
          className={`font-body text-sm font-semibold leading-snug transition-colors duration-500 ${
            active ? "text-primary" : "text-primary/70"
          }`}
        >
          {stat.label}
        </p>
        <p className="font-body text-[13px] leading-snug text-foreground-muted">
          {stat.sub}
        </p>
      </div>
    </div>
  );
}
