"use client";

import { useEffect, useState } from "react";
import { HOW_IT_WORKS } from "@/lib/landing/content";
import { CircleHighlight } from "@/components/landing/CircleHighlight";
import { LandingImage } from "@/components/landing/LandingImage";

const AUTO_ADVANCE_MS = 1500;

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
              <CircleHighlight color="#E6A800" className="mr-3 sm:mr-5">
                Five
              </CircleHighlight>
              steps,
              <br />
              every lesson.
            </h2>
            <p className="font-body text-base text-foreground-secondary max-w-[480px] mb-3xl leading-relaxed">
              Each lesson follows the same rigorous loop. No passive reading. You
              engage with the idea until it sticks, or you don&apos;t move forward.
            </p>

            <div className="mb-xl h-0.5 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-in-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex flex-col gap-xs">
              {HOW_IT_WORKS.map((step, index) => {
                const isActive = index === activeStep;
                const isComingSoon = "comingSoon" in step && step.comingSoon;

                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`flex w-full gap-lg rounded-xl border px-xl py-lg text-left transition-all duration-700 ease-in-out ${
                      isActive
                        ? "border-border bg-surface-sunken translate-x-1 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-70"
                    }`}
                  >
                    <span
                      className={`shrink-0 pt-0.5 font-display text-2xl font-medium tabular-nums transition-colors duration-700 ${
                        isActive ? "text-foreground" : "text-foreground-muted"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-xs flex flex-wrap items-center gap-sm">
                        <h3
                          className={`font-display text-xl font-semibold transition-colors duration-700 ${
                            isActive ? "text-foreground" : "text-foreground-muted"
                          }`}
                        >
                          {step.title}
                        </h3>
                        {isComingSoon ? (
                          <span className="rounded-md border border-gold/30 bg-gold-subtle px-sm py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-gold">
                            Coming soon
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`overflow-hidden font-body text-sm leading-relaxed text-foreground-secondary transition-all duration-700 ease-in-out ${
                          isActive ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {step.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
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
                    className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
                      index === activeStep ? "opacity-100" : "opacity-0"
                    }`}
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

                {"comingSoon" in active && active.comingSoon ? (
                  <p className="mt-lg inline-block rounded-lg border border-gold/30 bg-gold-subtle px-md py-sm font-body text-sm text-gold">
                    Coming soon: 1v1 strategy games
                  </p>
                ) : null}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
