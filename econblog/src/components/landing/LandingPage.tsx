import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { lessonZeroPath } from "@/lib/constants/lessons";
import {
  APP_SCREENSHOT_PLACEHOLDERS,
} from "@/lib/landing/content";
import type { LessonMeta } from "@/lib/types/lesson";
import { HeroBackgroundDiagrams } from "@/components/landing/LessonDiagram";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingXpToast } from "@/components/landing/LandingXpToast";
import { LessonCarousel } from "@/components/landing/LessonCarousel";
import { AudienceCards } from "@/components/landing/AudienceCards";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { OutcomesSection } from "@/components/landing/OutcomesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BrushUnderline } from "@/components/landing/BrushUnderline";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

interface LandingPageProps {
  carouselLessons: LessonMeta[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-sm">
      {children}
    </p>
  );
}

function SectionTitle({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <h2
      className={`font-display font-medium text-[32px] text-foreground text-balance mb-3xl ${
        centered ? "text-center" : ""
      }`}
    >
      {children}
    </h2>
  );
}

function PrimaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-sm overflow-hidden rounded-lg bg-primary px-xl py-md font-body text-base font-semibold text-surface-raised transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md"
    >
      <span
        aria-hidden
        className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      <span className="relative z-10 flex items-center gap-sm">
        {children}
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

export function LandingPage({ carouselLessons }: LandingPageProps) {
  return (
    <div>
      <section className="relative flex min-h-[calc((100svh-3.5rem-9rem)*0.75)] flex-col justify-center overflow-hidden px-xl py-2xl text-center">
        <HeroBackgroundDiagrams />

        <div
          className="relative z-10 mx-auto max-w-[720px] opacity-0 animate-landing-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="inline-flex items-center gap-sm rounded-full bg-gold-subtle px-md py-xs mb-2xl opacity-0 animate-landing-fade-up [animation-delay:0.1s]">
            <span className="size-[5px] rounded-full bg-gold animate-landing-pulse-dot" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-gold">
              Interactive Economics Education
            </span>
          </div>

          <h1 className="font-display font-semibold text-[2.625rem] sm:text-5xl lg:text-[3.5rem] text-foreground leading-[1.08] mb-xl opacity-0 animate-landing-fade-up [animation-delay:0.2s]">
            Learn Economics By{" "}
            <BrushUnderline color="#FFD024" thickness={16} offset={12}>
              <em className="text-primary not-italic">Doing</em>
            </BrushUnderline>
            , Not Watching
          </h1>

          <p className="font-body text-xl sm:text-[1.35rem] font-medium text-foreground-secondary leading-relaxed max-w-[560px] mx-auto mb-2xl opacity-0 animate-landing-fade-up [animation-delay:0.35s]">
            Structured lessons, quiz gates, XP progression, and a personalized path.
            Built for undergrad prep, career decisions, and serious self-study.
          </p>

          <div className="flex flex-col items-center justify-center gap-lg sm:flex-row opacity-0 animate-landing-fade-up [animation-delay:0.5s]">
            <PrimaryCta href={lessonZeroPath()}>Start Lesson Zero, Free</PrimaryCta>
            <a
              href="#how-it-works"
              className="font-body text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      <LessonCarousel lessons={carouselLessons} />

      <HowItWorksSection />

      {/* Who it's for */}
      <section className="border-t border-border-subtle bg-surface-sunken px-xl py-4xl">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel>
            <span className="block text-center">Who it&apos;s for</span>
          </SectionLabel>
          <SectionTitle centered>
            Built for people who take economics{" "}
            <BrushUnderline color="#FFD024" thickness={12} offset={8}>
              seriously
            </BrushUnderline>
          </SectionTitle>

          <AudienceCards />

          <div className="mt-3xl flex justify-center">
            <PrimaryCta href="/subscribe">Sign up now</PrimaryCta>
          </div>
        </div>
      </section>

      <OutcomesSection />

      {/* Personalization */}
      <section
        id="personalization"
        className="border-t border-border-subtle bg-surface-sunken px-xl py-4xl"
      >
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-3xl items-start">
          <div>
            <SectionLabel>Personalization</SectionLabel>
            <SectionTitle>A path built around what you care about</SectionTitle>
            <p className="font-body text-base text-foreground-secondary leading-relaxed -mt-2xl mb-xl">
              Short onboarding captures your goals and interests. We recommend a
              lesson sequence — you can follow it or pick anything from the catalog.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center rounded-lg border border-border px-xl py-md font-body text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              Unlock your path
            </Link>
          </div>

          <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {APP_SCREENSHOT_PLACEHOLDERS.map((screenshot) => (
              <figure
                key={screenshot.label}
                className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-sm"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--color-surface-sunken)_0%,var(--color-surface)_100%)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 rounded-lg border border-dashed border-border/70"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-sm px-lg text-center">
                    <div className="flex size-11 items-center justify-center rounded-lg border border-border-subtle bg-surface/80">
                      <ImageIcon className="size-5 text-foreground-muted" />
                    </div>
                    <p className="font-body text-xs text-foreground-muted">
                      App screenshot
                    </p>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <LandingFooter />
      <LandingXpToast />
    </div>
  );
}
