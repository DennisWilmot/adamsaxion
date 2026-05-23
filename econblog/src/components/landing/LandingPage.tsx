import Link from "next/link";
import { Check, X } from "lucide-react";
import { lessonZeroPath } from "@/lib/constants/lessons";
import {
  AUDIENCE,
  COMPARISON,
  CURRICULUM_PHASES,
  FEATURES,
  HOW_IT_WORKS,
  LANDING_STATS,
  PERSONALIZATION_OUTCOMES,
  PHILOSOPHY,
  PRICING,
  SAMPLE_PATH,
  TESTIMONIALS,
} from "@/lib/landing/content";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs font-semibold uppercase tracking-widest text-primary mb-sm">
      {children}
    </p>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display font-bold text-2xl text-foreground text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-xl py-md font-body text-sm font-semibold text-surface-raised bg-primary hover:bg-primary-hover transition-colors rounded-lg"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-xl py-md font-body text-sm font-semibold text-foreground border border-border hover:bg-surface-sunken transition-colors rounded-lg"
    >
      {children}
    </Link>
  );
}

function ProductPreview() {
  return (
    <div
      aria-hidden
      className="rounded-xl border border-border bg-surface-raised overflow-hidden"
    >
      <div className="border-b border-border-subtle px-lg py-md flex items-center gap-sm">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-sm font-body text-[11px] text-foreground-muted">
          Lesson workspace
        </span>
      </div>

      <div className="flex border-b border-border-subtle overflow-x-auto">
        {["Context", "Mechanism", "Quiz gate", "Mastery"].map((tab, i) => (
          <div
            key={tab}
            className={`shrink-0 px-md py-sm font-body text-xs ${
              i === 2
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-foreground-muted"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="p-lg space-y-md">
        <p className="font-body text-xs text-foreground-muted uppercase tracking-wide">
          Quiz gate · Medium
        </p>
        <p className="font-body text-sm text-foreground leading-relaxed">
          A coffee shop raises prices 10% and quantity sold falls 15%. What does
          this suggest about demand elasticity?
        </p>
        <div className="space-y-xs">
          {[
            "Elastic — quantity responds more than price",
            "Inelastic — quantity responds less than price",
            "Unit elastic",
          ].map((option, i) => (
            <div
              key={option}
              className={`rounded-md border px-md py-sm font-body text-xs ${
                i === 0
                  ? "border-primary/40 bg-primary-subtle/30 text-foreground"
                  : "border-border-subtle text-foreground-secondary"
              }`}
            >
              {option}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-sm">
          <span className="font-body text-xs text-gold font-semibold">
            +15 XP if correct
          </span>
          <span className="font-body text-xs text-foreground-muted">
            Gate 14 of 24
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <LandingNav />

      {/* Hero */}
      <section className="max-w-[72rem] mx-auto px-xl pt-4xl pb-4xl">
        <div className="grid lg:grid-cols-[1fr_minmax(18rem,22rem)] gap-3xl items-start">
          <div className="max-w-[42rem]">
            <SectionEyebrow>Interactive economics education</SectionEyebrow>

            <h1 className="font-display font-bold text-4xl text-foreground mb-xl text-balance leading-[1.08]">
              Learn economics by doing — not watching
            </h1>

            <p className="font-body text-lg text-foreground-secondary leading-relaxed mb-xl">
              Structured lessons, quiz gates, XP progression, and a personalized
              path. Built for undergrad prep, career decisions, and serious
              self-study.
            </p>

            <div className="flex flex-col items-start gap-md sm:flex-row sm:items-center sm:gap-lg mb-xl">
              <PrimaryButton href={lessonZeroPath()}>
                Start Lesson Zero — free
              </PrimaryButton>
              <a
                href="#how-it-works"
                className="font-body text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
              >
                See how it works ↓
              </a>
            </div>

            <p className="font-body text-xs text-foreground-muted">
              {LANDING_STATS.lessonCount}-lesson curriculum ·{" "}
              {LANDING_STATS.gatesPerLesson} gates per lesson · No account needed
              to start
            </p>
          </div>

          <div className="lg:pt-lg">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="audience" className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Who it&apos;s for</SectionEyebrow>
          <SectionTitle className="mb-3xl">
            Built for people who take economics seriously
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-2xl">
            {AUDIENCE.map((item) => (
              <div key={item.title}>
                <p className="font-display font-semibold text-lg text-foreground mb-sm">
                  {item.title}
                </p>
                <p className="font-body text-base text-foreground-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Our philosophy</SectionEyebrow>
          <SectionTitle className="mb-3xl">
            Dense, honest, worth the effort
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-2xl">
            {PHILOSOPHY.map((item) => (
              <div key={item.title}>
                <p className="font-display font-semibold text-lg text-foreground mb-sm">
                  {item.title}
                </p>
                <p className="font-body text-base text-foreground-secondary leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3xl font-body text-base text-foreground-secondary leading-relaxed max-w-[46rem]">
            If you&apos;ve watched Adam&apos;s Axioms on YouTube, this is where
            the ideas become yours — applied under pressure, with feedback that
            doesn&apos;t let you coast.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <SectionTitle className="mb-sm">
            Do the lesson. Pass the gates. Earn your level.
          </SectionTitle>
          <p className="font-body text-base text-foreground-secondary mb-3xl max-w-[40rem]">
            Each lesson takes roughly 35 minutes, with about{" "}
            {LANDING_STATS.gatesPerLesson} quiz gates and a mastery exam drawn
            from a pool of {LANDING_STATS.masteryPool} questions.
          </p>

          <div className="space-y-2xl max-w-[44rem] mb-3xl">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-xl items-baseline">
                <span className="font-display font-bold text-xl text-foreground-muted shrink-0 w-8 tabular-nums">
                  {item.step}
                </span>
                <div>
                  <p className="font-display font-semibold text-lg text-foreground mb-xs">
                    {item.title}
                  </p>
                  <p className="font-body text-base text-foreground-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <PrimaryButton href={lessonZeroPath()}>
            Try it with Lesson Zero
          </PrimaryButton>
        </div>
      </section>

      {/* Personalization */}
      <section id="personalization" className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <div className="grid lg:grid-cols-2 gap-3xl items-start">
            <div>
              <SectionEyebrow>Personalization</SectionEyebrow>
              <SectionTitle className="mb-lg">
                A path built around what you care about
              </SectionTitle>
              <p className="font-body text-base text-foreground-secondary leading-relaxed mb-xl">
                Short onboarding captures your goals and interests. We recommend
                a lesson sequence — you can follow it or pick anything from the
                catalog.
              </p>

              <ul className="space-y-sm mb-xl">
                {PERSONALIZATION_OUTCOMES.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex gap-sm font-body text-sm text-foreground-secondary"
                  >
                    <Check className="size-4 shrink-0 text-success mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>

              <SecondaryButton href="/subscribe">Unlock your path</SecondaryButton>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-xl">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-lg">
                Example path · Markets focus
              </p>
              <ol className="space-y-lg">
                {SAMPLE_PATH.map((lesson, index) => (
                  <li key={lesson.title} className="flex gap-lg">
                    <span className="font-display font-bold text-sm text-foreground-muted tabular-nums shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-display font-semibold text-base text-foreground">
                        {lesson.title}
                      </p>
                      <p className="font-body text-sm text-foreground-muted mt-xs">
                        {lesson.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Curriculum</SectionEyebrow>
          <SectionTitle className="mb-sm">
            {LANDING_STATS.lessonCount} lessons across{" "}
            {LANDING_STATS.phaseCount} phases
          </SectionTitle>
          <p className="font-body text-base text-foreground-secondary mb-3xl max-w-[42rem]">
            Micro foundations through game theory, causal inference, taxation,
            behavioral economics, and health policy. Lesson Zero is live now —
            the full library unlocks with a subscription.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {CURRICULUM_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className="border border-border-subtle rounded-lg px-lg py-md"
              >
                <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted mb-xs">
                  Phase {phase.phase}
                </p>
                <p className="font-display font-semibold text-base text-foreground mb-xs">
                  {phase.label}
                </p>
                <p className="font-body text-xs text-foreground-muted">
                  {phase.count} lesson{phase.count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Features</SectionEyebrow>
          <SectionTitle className="mb-3xl">
            Everything in the web app
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-x-3xl gap-y-2xl">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <p className="font-display font-semibold text-lg text-foreground mb-xs">
                  {feature.title}
                </p>
                <p className="font-body text-base text-foreground-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionTitle className="mb-3xl text-center">
            Why not just YouTube or a textbook?
          </SectionTitle>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] font-body text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-md text-left font-medium text-foreground-muted" />
                  <th className="py-md text-center font-medium text-foreground-secondary">
                    YouTube
                  </th>
                  <th className="py-md text-center font-medium text-foreground-secondary">
                    Textbook
                  </th>
                  <th className="py-md text-center font-medium text-primary">
                    Adam&apos;s Axioms
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-border-subtle">
                    <td className="py-md text-foreground-secondary">{row.label}</td>
                    <td className="py-md text-center">
                      <ComparisonCell value={row.youtube} />
                    </td>
                    <td className="py-md text-center">
                      <ComparisonCell value={row.textbook} />
                    </td>
                    <td className="py-md text-center">
                      <ComparisonCell value={row.axioms} highlight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Testimonials</SectionEyebrow>
          <SectionTitle className="mb-3xl">
            What early learners are saying
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-xl">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.quote}
                className="border border-border-subtle rounded-lg p-xl bg-surface"
              >
                <blockquote className="font-body text-base text-foreground-secondary leading-relaxed mb-lg">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="font-body text-sm font-semibold text-foreground">
                    {item.attribution}
                  </p>
                  <p className="font-body text-xs text-foreground-muted mt-xs">
                    {item.context}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <SectionTitle className="mb-sm">Choose how you want in</SectionTitle>
          <p className="font-body text-base text-foreground-secondary mb-3xl max-w-[40rem]">
            Lesson Zero is free forever. Subscribe for the full curriculum,
            mastery exams, and your personalized path.
          </p>

          <div className="grid lg:grid-cols-3 gap-xl">
            <div className="border border-border-subtle rounded-xl p-2xl bg-surface-sunken">
              <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted mb-md">
                Free
              </p>
              <p className="font-display font-bold text-xl text-foreground mb-sm">
                Lesson Zero
              </p>
              <p className="font-display font-bold text-3xl text-foreground mb-lg tabular-nums">
                $0
              </p>
              <ul className="space-y-sm mb-xl">
                {PRICING.freeIncludes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-sm font-body text-sm text-foreground-secondary"
                  >
                    <Check className="size-4 shrink-0 text-success mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PrimaryButton href={lessonZeroPath()}>Start free</PrimaryButton>
            </div>

            <div className="border border-primary/40 rounded-xl p-2xl bg-primary-subtle/20 lg:col-span-2">
              <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-primary mb-md">
                Full access
              </p>
              <div className="grid sm:grid-cols-2 gap-xl mb-xl">
                <div>
                  <p className="font-display font-bold text-xl text-foreground mb-xs">
                    Monthly
                  </p>
                  <p className="font-display font-bold text-3xl text-foreground tabular-nums">
                    {PRICING.monthly.amount}
                    <span className="font-body text-base font-normal text-foreground-muted">
                      {PRICING.monthly.interval}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-foreground mb-xs">
                    Lifetime
                  </p>
                  <p className="font-display font-bold text-3xl text-foreground tabular-nums">
                    {PRICING.lifetime.amount}
                    <span className="font-body text-base font-normal text-foreground-muted">
                      {PRICING.lifetime.interval}
                    </span>
                  </p>
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-xl gap-y-sm mb-xl">
                {PRICING.paidIncludes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-sm font-body text-sm text-foreground-secondary"
                  >
                    <Check className="size-4 shrink-0 text-success mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <SecondaryButton href="/subscribe">View plans & subscribe</SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[40rem] mx-auto px-xl py-4xl">
          <SectionTitle className="mb-3xl text-center">
            Common questions
          </SectionTitle>
          <LandingFaq />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <div className="max-w-[36rem] mx-auto text-center">
            <SectionTitle className="mb-sm">
              See if this works for you
            </SectionTitle>
            <p className="font-body text-base text-foreground-secondary mb-xl">
              Start with Lesson Zero — real content, real gates, no account. When
              you&apos;re ready, unlock the full curriculum.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <PrimaryButton href={lessonZeroPath()}>Start Lesson Zero</PrimaryButton>
              <SecondaryButton href="/subscribe">Subscribe</SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ComparisonCell({
  value,
  highlight = false,
}: {
  value: boolean;
  highlight?: boolean;
}) {
  if (value) {
    return (
      <Check
        className={`size-4 mx-auto ${highlight ? "text-primary" : "text-success"}`}
        aria-label="Yes"
      />
    );
  }
  return (
    <X className="size-4 mx-auto text-foreground-muted/50" aria-label="No" />
  );
}
