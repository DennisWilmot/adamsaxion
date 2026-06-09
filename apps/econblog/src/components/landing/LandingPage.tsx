import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lessonZeroPath } from "@/lib/constants/lessons";
import { LANDING_CTA_START_LESSON_ZERO } from "@/lib/landing/content";
import { STATIC_CAROUSEL_LESSONS } from "@/lib/landing/carousel-manifest";
import { HeroBackgroundDiagrams } from "@/components/landing/LessonDiagram";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingXpToast } from "@/components/landing/LandingXpToast";
import { LessonCarousel } from "@/components/landing/LessonCarousel";
import { TryItNowSection } from "@/components/landing/TryItNowSection";
import { AudienceCards } from "@/components/landing/AudienceCards";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { OutcomesSection } from "@/components/landing/OutcomesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BrushUnderline } from "@/components/landing/BrushUnderline";

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

function SecondaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg border border-border px-xl py-md font-body text-base font-semibold text-foreground transition-colors hover:bg-surface"
    >
      {children}
    </Link>
  );
}

export function LandingPage() {
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
            Structured lessons, quiz gates, and XP progression. Try Lesson Zero free
            — no account needed.
          </p>

          <div className="flex flex-col items-center justify-center gap-md sm:flex-row opacity-0 animate-landing-fade-up [animation-delay:0.5s]">
            <PrimaryCta href={lessonZeroPath()}>{LANDING_CTA_START_LESSON_ZERO}</PrimaryCta>
            <SecondaryCta href="#curriculum">Browse the curriculum ↓</SecondaryCta>
          </div>
        </div>
      </section>

      <LessonCarousel lessons={STATIC_CAROUSEL_LESSONS} />

      <TryItNowSection />

      <HowItWorksSection />

      <TestimonialsSection />

      <OutcomesSection />

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

          <p className="mt-3xl text-center font-body text-sm text-foreground-secondary">
            Not sure where to start?{" "}
            <Link href="#try-now" className="font-semibold text-primary hover:text-primary-hover">
              Try it free — no account needed
            </Link>
          </p>
        </div>
      </section>

      <PricingSection />

      <LandingFooter />
      <LandingXpToast />
    </div>
  );
}
