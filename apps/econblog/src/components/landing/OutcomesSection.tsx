"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OUTCOME_STATS, OUTCOME_TESTIMONIALS } from "@/lib/landing/content";

type Testimonial = (typeof OUTCOME_TESTIMONIALS)[number];

const STAT_CYCLE_MS = 4000;

export function OutcomesSection() {
  const testimonialItems = [...OUTCOME_TESTIMONIALS, ...OUTCOME_TESTIMONIALS];

  return (
    <section
      id="outcomes"
      className="border-y border-border-subtle bg-surface px-xl py-4xl"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Headline + stats */}
        <div className="mb-3xl flex flex-wrap items-start gap-3xl lg:gap-[4.5rem]">
          <div className="min-w-[280px] flex-[1_1_400px]">
            <p className="mb-sm font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
              Outcomes
            </p>
            <h2 className="mb-lg font-display text-[clamp(1.875rem,4.5vw,2.75rem)] font-semibold leading-[1.12] text-foreground">
              Learn economics at
              <br />
              undergrad depth.
            </h2>
            <p className="max-w-[440px] font-body text-base leading-relaxed text-foreground-secondary">
              The equivalent of a serious economics degree, except you actually
              apply the theories through quiz gates, mastery exams, and games
              that test whether the ideas stuck.
            </p>
            <Link
              href="/subscribe"
              className="group relative mt-xl inline-flex items-center gap-sm overflow-hidden rounded-lg bg-primary px-xl py-md font-body text-base font-semibold text-surface-raised transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md"
            >
              <span
                aria-hidden
                className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <span className="relative z-10 flex items-center gap-sm">
                Sign up now
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </div>

          <StatsPanel />
        </div>

        {/* Testimonials */}
        <p className="mb-lg font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
          What you walk away with
        </p>

        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent"
          />

          <div
            className="flex w-max gap-md animate-landing-carousel hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${Math.max(50, OUTCOME_TESTIMONIALS.length * 8)}s`,
            }}
          >
            {testimonialItems.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                testimonial={testimonial}
              />
            ))}
          </div>
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
        What you do
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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const highlightIndex = testimonial.review.indexOf(testimonial.highlight);
  const before =
    highlightIndex === -1
      ? testimonial.review
      : testimonial.review.slice(0, highlightIndex);
  const highlighted = highlightIndex === -1 ? "" : testimonial.highlight;
  const after =
    highlightIndex === -1
      ? ""
      : testimonial.review.slice(highlightIndex + testimonial.highlight.length);

  return (
    <article className="flex w-[320px] shrink-0 cursor-default flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-md px-xl pt-xl">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full font-body text-[15px] font-bold tracking-wide text-white"
          style={{
            background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}bb)`,
          }}
        >
          {testimonial.initials}
        </div>
        <p className="font-display text-[15px] font-semibold leading-snug text-foreground">
          {testimonial.name}
        </p>
      </div>

      <div className="flex-1 px-xl pb-md pt-lg">
        <p className="m-0 font-body text-[13.5px] leading-[1.7] text-foreground-secondary">
          {before}
          {highlighted && (
            <span
              className="mx-0.5 rounded-sm px-1 font-semibold text-foreground"
              style={{
                backgroundColor: `${testimonial.color}12`,
                borderBottom: `2px solid ${testimonial.color}40`,
              }}
            >
              {highlighted}
            </span>
          )}
          {after}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-end border-t border-border-subtle px-xl py-lg">
        <div className="flex gap-0.5" aria-label={`${testimonial.stars} out of 5 stars`}>
          {Array.from({ length: testimonial.stars }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#F5A623" aria-hidden>
      <path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L7 10.27 3.48 11.85l.67-3.93L1.3 5.14l3.94-.57L7 1z" />
    </svg>
  );
}
