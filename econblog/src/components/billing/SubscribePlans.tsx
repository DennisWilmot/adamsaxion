"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  PLAN_LABELS,
  PLAN_PRICES,
  type CheckoutPlan,
} from "@/lib/stripe/config";

const MONTHLY_FEATURES = [
  "Full access to every lesson",
  "Gated quizzes and mastery exams",
  "XP, levels, and leaderboard",
  "Personalized learning path",
  "Cancel anytime from your profile",
];

const LIFETIME_FEATURES = [
  "Everything in Monthly",
  "One payment — access forever",
  "No recurring charges",
  "Best value if you're committed",
];

interface SubscribePlansProps {
  isAuthenticated: boolean;
  hasAccess: boolean;
  setupMessage?: string | null;
}

export function SubscribePlans({
  isAuthenticated,
  hasAccess,
  setupMessage = null,
}: SubscribePlansProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") ?? "/lessons";
  const canceled = searchParams.get("canceled") === "1";

  async function startCheckout(plan: CheckoutPlan) {
    if (!isAuthenticated) {
      router.push(`/auth?next=${encodeURIComponent(`/subscribe?next=${next}`)}`);
      return;
    }

    setError(null);
    setLoadingPlan(plan);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, next }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  if (hasAccess) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 px-xl py-xl text-center">
        <p className="font-display font-semibold text-lg text-foreground mb-sm">
          You&apos;re all set
        </p>
        <p className="font-body text-sm text-foreground-secondary mb-lg">
          Your subscription is active. Head to lessons or manage billing from
          your profile.
        </p>
        <div className="flex flex-wrap justify-center gap-md">
          <a
            href="/lessons"
            className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
          >
            Go to lessons
          </a>
          <a
            href="/profile"
            className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold border border-border text-foreground hover:bg-surface-sunken"
          >
            View profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {setupMessage && (
        <p className="mb-xl rounded-lg border border-error/30 bg-error-subtle px-lg py-md font-body text-sm text-error text-center leading-relaxed">
          {setupMessage}
        </p>
      )}
      {canceled && (
        <p className="mb-xl rounded-lg border border-border-subtle bg-surface-sunken px-lg py-md font-body text-sm text-foreground-secondary text-center">
          Checkout was canceled. Pick a plan when you&apos;re ready.
        </p>
      )}
      {error && (
        <p className="mb-xl rounded-lg border border-error/30 bg-error-subtle px-lg py-md font-body text-sm text-error text-center">
          {error}
        </p>
      )}

      <div className="grid gap-xl md:grid-cols-2">
        <PlanCard
          plan="monthly"
          title={PLAN_LABELS.monthly}
          price={PLAN_PRICES.monthly.amount}
          interval={PLAN_PRICES.monthly.interval ?? ""}
          description="Full curriculum access, billed monthly."
          features={MONTHLY_FEATURES}
          highlighted
          loading={loadingPlan === "monthly"}
          disabled={!!setupMessage}
          onSelect={() => startCheckout("monthly")}
        />
        <PlanCard
          plan="lifetime"
          title={PLAN_LABELS.lifetime}
          price={PLAN_PRICES.lifetime.amount}
          interval={PLAN_PRICES.lifetime.interval ?? ""}
          description="Pay once. Keep access for life."
          features={LIFETIME_FEATURES}
          loading={loadingPlan === "lifetime"}
          disabled={!!setupMessage}
          onSelect={() => startCheckout("lifetime")}
        />
      </div>

      {!isAuthenticated && (
        <p className="mt-xl text-center font-body text-sm text-foreground-muted">
          Already have an account?{" "}
          <a href={`/auth?next=${encodeURIComponent(`/subscribe?next=${next}`)}`} className="text-primary hover:underline">
            Sign in
          </a>{" "}
          before checkout.
        </p>
      )}
    </div>
  );
}

function PlanCard({
  title,
  price,
  interval,
  description,
  features,
  highlighted,
  loading,
  disabled,
  onSelect,
}: {
  plan: CheckoutPlan;
  title: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  loading: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-2xl ${
        highlighted
          ? "border-primary/40 bg-primary-subtle/20"
          : "border-border bg-surface-raised"
      }`}
    >
      {highlighted && (
        <p className="mb-md font-body text-[10px] font-semibold uppercase tracking-widest text-primary">
          Most flexible
        </p>
      )}
      <h2 className="font-display font-bold text-xl text-foreground">{title}</h2>
      <p className="mt-sm font-body text-sm text-foreground-secondary">
        {description}
      </p>
      <p className="mt-lg font-display font-bold text-3xl text-foreground tabular-nums">
        {price}
        <span className="font-body text-base font-normal text-foreground-muted">
          {interval}
        </span>
      </p>

      <ul className="mt-xl flex-1 space-y-sm">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex gap-sm font-body text-sm text-foreground-secondary"
          >
            <Check className="size-4 shrink-0 text-success mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={loading || disabled}
        onClick={onSelect}
        className={`mt-xl w-full rounded-lg py-md font-body text-sm font-semibold transition-colors disabled:opacity-50 ${
          highlighted
            ? "bg-primary text-surface-raised hover:bg-primary-hover"
            : "border border-border text-foreground hover:bg-surface-sunken"
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-sm">
            <Loader2 className="size-4 animate-spin" />
            Redirecting…
          </span>
        ) : (
          `Get ${title}`
        )}
      </button>
    </div>
  );
}
