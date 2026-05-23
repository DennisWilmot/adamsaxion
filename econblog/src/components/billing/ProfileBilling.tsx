"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import type { UserSubscriptionView } from "@/lib/subscription/types";

interface ProfileBillingProps {
  subscription: UserSubscriptionView;
}

export function ProfileBilling({ subscription }: ProfileBillingProps) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openBillingPortal() {
    setError(null);
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not open billing portal");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <section>
      <div className="flex items-center gap-sm mb-lg">
        <CreditCard className="size-5 text-primary" />
        <h2 className="font-display font-semibold text-lg text-foreground">
          Subscription
        </h2>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-sunken/40 px-xl py-lg">
        <dl className="space-y-md">
          <div className="flex flex-wrap items-baseline justify-between gap-sm">
            <dt className="font-body text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Plan
            </dt>
            <dd className="font-body text-sm font-medium text-foreground">
              {subscription.planLabel ?? "None"}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-sm">
            <dt className="font-body text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Status
            </dt>
            <dd className="font-body text-sm text-foreground-secondary">
              {subscription.statusLabel}
            </dd>
          </div>
          {subscription.renewalLabel && (
            <div className="flex flex-wrap items-baseline justify-between gap-sm">
              <dt className="font-body text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Billing
              </dt>
              <dd className="font-body text-sm text-foreground-secondary">
                {subscription.renewalLabel}
              </dd>
            </div>
          )}
        </dl>

        {subscription.cancelAtPeriodEnd && subscription.hasAccess && (
          <p className="mt-lg font-body text-sm text-foreground-secondary border-t border-border-subtle pt-lg">
            Your subscription is set to cancel at the end of the current billing
            period. You keep full access until then.
          </p>
        )}

        {error && (
          <p className="mt-md font-body text-sm text-error">{error}</p>
        )}

        <div className="mt-xl flex flex-wrap gap-md">
          {subscription.hasAccess && subscription.stripeCustomerId ? (
            <button
              type="button"
              disabled={portalLoading}
              onClick={openBillingPortal}
              className="inline-flex items-center gap-sm rounded-lg border border-border px-lg py-md font-body text-sm font-semibold text-foreground hover:bg-surface-raised disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ExternalLink className="size-4" />
              )}
              Manage billing
            </button>
          ) : (
            <Link
              href="/subscribe"
              className="inline-flex rounded-lg px-lg py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
            >
              Subscribe to unlock lessons
            </Link>
          )}
        </div>

        {subscription.hasAccess && subscription.stripeCustomerId && (
          <p className="mt-md font-body text-xs text-foreground-muted leading-relaxed">
            Use Manage billing to update your card, download invoices, or cancel
            your monthly plan. Lifetime members can view payment history there
            too.
          </p>
        )}
      </div>
    </section>
  );
}
