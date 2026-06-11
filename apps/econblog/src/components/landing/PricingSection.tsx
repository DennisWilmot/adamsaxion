"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CircleDot,
  Crown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { lessonZeroPath } from "@/lib/constants/lessons";
import { PRICING } from "@/lib/landing/content";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

type Billing = "monthly" | "lifetime";

type Plan = {
  id: "free" | "monthly" | "lifetime";
  label: string;
  name: string;
  icon: LucideIcon;
  price: string;
  interval: string;
  features: readonly string[];
  badge?: string;
  cta: {
    label: string;
    href: string;
    variant: "primary" | "outline" | "dark";
  };
};

const PLANS: Plan[] = [
  {
    id: "free",
    label: "Free",
    name: "Try it free",
    icon: CircleDot,
    price: "$0",
    interval: "",
    features: PRICING.freeIncludes,
    cta: {
      label: "Start free",
      href: lessonZeroPath(),
      variant: "dark",
    },
  },
  {
    id: "monthly",
    label: "Monthly",
    name: "Full access",
    icon: Sparkles,
    price: PRICING.monthly.amount,
    interval: PRICING.monthly.interval ?? "",
    features: PRICING.paidIncludes,
    badge: "Most popular",
    cta: {
      label: `Subscribe monthly — ${PRICING.monthly.amount}`,
      href: "/subscribe",
      variant: "primary",
    },
  },
  {
    id: "lifetime",
    label: "Lifetime",
    name: "Pay once",
    icon: Crown,
    price: PRICING.lifetime.amount,
    interval: PRICING.lifetime.interval ?? "",
    features: PRICING.lifetimeIncludes,
    badge: "Best value",
    cta: {
      label: `Get lifetime access — ${PRICING.lifetime.amount}`,
      href: "/subscribe",
      variant: "primary",
    },
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const featuredId: Plan["id"] = billing === "monthly" ? "monthly" : "lifetime";

  return (
    <section
      id="pricing"
      className="border-t border-border-subtle bg-surface-raised px-xl py-4xl"
    >
      <div className="mx-auto max-w-[1040px]">
        <ScrollReveal>
          <p className="mb-sm text-center font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
            Pricing
          </p>
          <h2 className="mb-md text-center font-display text-[32px] font-medium text-balance text-foreground">
            Choose how you want in
          </h2>
          <p className="mx-auto mb-md max-w-[40rem] text-center font-body text-base text-foreground-secondary">
            Start free with Wordle, Lesson Zero, and Margin (beta) practice. Upgrade once for the
            full curriculum, ranked play, and AI debriefs.
          </p>
          <p className="mx-auto mb-2xl max-w-[40rem] text-center font-body text-sm text-foreground-muted">
            Members get a personalized lesson path, XP progression, and leaderboard standing.
          </p>
        </ScrollReveal>

        <div className="mb-3xl flex justify-center">
          <div
            className="relative grid grid-cols-2 rounded-full border border-border bg-surface-sunken p-1"
            role="tablist"
            aria-label="Billing preference"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-surface-raised shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform:
                  billing === "monthly"
                    ? "translateX(0.25rem)"
                    : "translateX(calc(100% + 0.25rem))",
              }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              onClick={() => setBilling("monthly")}
              className={`relative z-10 rounded-full px-xl py-sm font-body text-sm font-semibold transition-colors duration-300 ${
                billing === "monthly"
                  ? "text-foreground"
                  : "text-foreground-muted hover:text-foreground-secondary"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "lifetime"}
              onClick={() => setBilling("lifetime")}
              className={`relative z-10 flex items-center justify-center gap-sm rounded-full px-xl py-sm font-body text-sm font-semibold transition-colors duration-300 ${
                billing === "lifetime"
                  ? "text-foreground"
                  : "text-foreground-muted hover:text-foreground-secondary"
              }`}
            >
              Lifetime
              <span className="rounded-md bg-gold-subtle px-sm py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-gold">
                Save
              </span>
            </button>
          </div>
        </div>

        <div className="grid items-end gap-xl lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              featured={plan.id === featuredId}
              billing={billing}
            />
          ))}
        </div>

        <p className="mt-3xl text-center font-body text-sm text-foreground-secondary">
          Not ready to subscribe?{" "}
          <Link
            href={lessonZeroPath()}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Start free — no account needed.
          </Link>
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  featured,
  billing,
}: {
  plan: Plan;
  featured: boolean;
  billing: Billing;
}) {
  const Icon = plan.icon;
  const isFree = plan.id === "free";
  const showBanner = featured && !isFree;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-surface-raised transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        featured && !isFree
          ? "z-10 -translate-y-1 border-primary/40 shadow-lg lg:scale-[1.03]"
          : "border-border-subtle shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      } ${isFree ? "opacity-100" : ""}`}
    >
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBanner ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="relative flex items-center justify-center gap-sm bg-gradient-to-r from-primary via-primary to-[oklch(0.52_0.14_265)] px-lg py-sm">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <Sparkles className="relative size-3.5 text-white/90" />
          <span className="relative font-body text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {plan.badge}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2xl">
        <div className="mb-lg flex items-center gap-sm">
          <span
            className={`flex size-8 items-center justify-center rounded-full transition-colors duration-500 ${
              featured && !isFree
                ? "bg-primary-subtle text-primary"
                : "bg-surface-sunken text-foreground-muted"
            }`}
          >
            <Icon className="size-4" />
          </span>
          <p
            className={`font-body text-[10px] font-semibold uppercase tracking-widest transition-colors duration-500 ${
              featured && !isFree ? "text-primary" : "text-foreground-muted"
            }`}
          >
            {plan.label}
          </p>
        </div>

        <p className="mb-sm font-display text-xl font-medium text-foreground">
          {plan.name}
        </p>

        <p className="mb-lg font-display text-3xl font-bold tabular-nums text-foreground transition-all duration-500">
          {plan.price}
          {plan.interval ? (
            <span className="font-body text-base font-normal text-foreground-muted">
              {plan.interval}
            </span>
          ) : null}
        </p>

        {!isFree && billing === "lifetime" && plan.id === "monthly" ? (
          <p className="-mt-md mb-lg font-body text-xs text-foreground-muted">
            Or switch to lifetime and pay once
          </p>
        ) : null}

        <ul className="mb-xl flex-1 space-y-sm">
          {plan.features.map((item, featureIndex) => (
            <li
              key={item}
              className="flex gap-sm font-body text-sm text-foreground-secondary"
              style={{
                opacity: featured ? 1 : 0.85,
                transform: featured ? "translateX(0)" : "translateX(0)",
                transition: `opacity 0.4s ease ${featureIndex * 0.04}s`,
              }}
            >
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <PlanCta cta={plan.cta} featured={featured && !isFree} />
      </div>
    </article>
  );
}

function PlanCta({
  cta,
  featured,
}: {
  cta: Plan["cta"];
  featured: boolean;
}) {
  if (cta.variant === "dark") {
    return (
      <Link
        href={cta.href}
        className="group inline-flex items-center justify-center gap-sm rounded-lg bg-foreground px-xl py-md font-body text-sm font-semibold text-surface-raised transition-all duration-300 hover:-translate-y-px hover:bg-foreground/90 hover:shadow-md"
      >
        {cta.label}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }

  if (featured) {
    return (
      <Link
        href={cta.href}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-primary to-[oklch(0.52_0.14_265)] px-xl py-md font-body text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:shadow-md"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <span className="relative z-10">{cta.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={cta.href}
      className="inline-flex items-center justify-center rounded-lg border border-border px-xl py-md font-body text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-px hover:bg-surface-sunken"
    >
      {cta.label}
    </Link>
  );
}
