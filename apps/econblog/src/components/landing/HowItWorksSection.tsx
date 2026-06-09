"use client";

import { useEffect, useState } from "react";
import { HOW_IT_WORKS, HOW_IT_WORKS_HEADLINE, HOW_IT_WORKS_SUBHEAD } from "@/lib/landing/content";
import { CircleHighlight } from "@/components/landing/CircleHighlight";
import { LandingImage } from "@/components/landing/LandingImage";

const AUTO_ADVANCE_MS = 3500;
const STEP_TRANSITION_MS = 250;

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = HOW_IT_WORKS[activeStep] ?? HOW_IT_WORKS[0]!;
  const progressPct = ((activeStep + 1) / HOW_IT_WORKS.length) * 100;

  useEffect(() => {
    if (isPaused) return;

    const tick = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % HOW_IT_WORKS.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(tick);
  }, [isPaused, activeStep]);

  return (
    <section id="how-it-works" className="px-xl py-4xl">
      <div className="max-w-[1100px] mx-auto">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-sm">
          How it works
        </p>

        <div
          className="flex flex-wrap items-start gap-3xl lg:gap-[3.75rem]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex-[1_1_400px] min-w-[280px]">
            <h2 className="font-display font-semibold text-[clamp(2rem,5vw,3rem)] text-foreground leading-[1.1] mb-md">
              {HOW_IT_WORKS_HEADLINE.before}
              <CircleHighlight color="#E6A800" className="mx-1">
                {HOW_IT_WORKS_HEADLINE.highlight}
              </CircleHighlight>
              {HOW_IT_WORKS_HEADLINE.after}
            </h2>
            <p className="font-body text-base text-foreground-secondary max-w-[480px] mb-3xl leading-relaxed">
              {HOW_IT_WORKS_SUBHEAD}
            </p>

            <div className="mb-xl h-0.5 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-primary transition-[width] ease-out"
                style={{
                  width: `${progressPct}%`,
                  transitionDuration: `${STEP_TRANSITION_MS}ms`,
                }}
              />
            </div>

            <div className="flex flex-col gap-xs">
              {HOW_IT_WORKS.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`flex w-full gap-lg rounded-xl border px-xl py-lg text-left transition-all ease-out ${
                    index === activeStep
                      ? "border-border bg-surface-sunken translate-x-1 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-70"
                  }`}
                  style={{ transitionDuration: `${STEP_TRANSITION_MS}ms` }}
                >
                  <span
                    className={`shrink-0 pt-0.5 font-display text-2xl font-medium tabular-nums transition-colors ease-out ${
                      index === activeStep ? "text-foreground" : "text-foreground-muted"
                    }`}
                    style={{ transitionDuration: `${STEP_TRANSITION_MS}ms` }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`mb-xs font-display text-xl font-semibold transition-colors ease-out ${
                        index === activeStep ? "text-foreground" : "text-foreground-muted"
                      }`}
                      style={{ transitionDuration: `${STEP_TRANSITION_MS}ms` }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`overflow-hidden font-body text-sm leading-relaxed text-foreground-secondary transition-all ease-out ${
                        index === activeStep ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                      style={{ transitionDuration: `${STEP_TRANSITION_MS}ms` }}
                    >
                      {step.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-[1_1_340px] min-w-[280px] lg:sticky lg:top-24 lg:self-start">
            <article className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-sm">
              <div className="relative aspect-[5/4] overflow-hidden border-b border-border-subtle bg-surface-sunken">
                {HOW_IT_WORKS.map((step, index) => (
                  <LandingImage
                    key={step.icon}
                    src={step.icon}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority={index === 0}
                    className={`object-cover object-center transition-opacity ease-out ${
                      index === activeStep ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transitionDuration: `${STEP_TRANSITION_MS}ms` }}
                  />
                ))}
              </div>

              <div className="p-xl">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-xs">
                  {active.step}
                </p>
                <h3 className="font-display text-[1.75rem] font-semibold text-foreground mb-md leading-tight">
                  {active.title}
                </h3>
                <p className="font-body text-[15px] text-foreground-secondary leading-relaxed">
                  {active.detail}
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
