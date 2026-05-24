"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import type { UserSubscriptionView } from "@/lib/subscription/types";
import { PLAN_PRICES, type CheckoutPlan } from "@/lib/stripe/config";

interface ProfileSubscriptionTabProps {
  subscription: UserSubscriptionView;
}

function formatPeriodEnd(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProfileSubscriptionTab({
  subscription,
}: ProfileSubscriptionTabProps) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = subscription.plan as CheckoutPlan | null;
  const price = plan ? PLAN_PRICES[plan] : null;
  const nextCharge = formatPeriodEnd(subscription.currentPeriodEnd);

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

  const showUpgrade =
    subscription.hasAccess && subscription.plan === "monthly";

  return (
    <div className="space-y-xl">
      <section className="rounded-xl border border-border bg-surface-raised p-xl">
        <div className="flex flex-wrap items-start justify-between gap-xl">
          <div>
            <p className="mb-sm font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
              You are on
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {subscription.planLabel ?? "No plan"}
            </h2>
            {subscription.renewalLabel && (
              <p className="mt-sm font-body text-sm text-foreground-secondary">
                {subscription.renewalLabel}
              </p>
            )}
            {nextCharge && subscription.plan === "monthly" && (
              <p className="mt-xs font-body text-xs text-foreground-muted">
                Next charge {nextCharge}
              </p>
            )}
          </div>
          {price && (
            <div className="text-right">
              <p className="font-display text-3xl font-semibold text-primary tabular-nums">
                {price.amount}
              </p>
              {price.interval && (
                <p className="font-body text-sm text-foreground-muted">
                  {price.interval}
                </p>
              )}
            </div>
          )}
        </div>

        {subscription.cancelAtPeriodEnd && subscription.hasAccess && (
          <p className="mt-lg rounded-lg bg-surface-sunken px-lg py-md font-body text-sm text-foreground-secondary">
            Your subscription is set to cancel at the end of the current billing
            period. You keep full access until then.
          </p>
        )}

        {error && (
          <p className="mt-md font-body text-sm text-error">{error}</p>
        )}

        <div className="mt-xl flex flex-wrap gap-md">
          {!subscription.hasAccess ? (
            <Link
              href="/subscribe"
              className="inline-flex rounded-full bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover"
            >
              Subscribe to unlock lessons
            </Link>
          ) : (
            <>
              {showUpgrade && (
                <Link
                  href="/subscribe?plan=lifetime"
                  className="inline-flex rounded-full bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover"
                >
                  Upgrade to Lifetime (save vs monthly)
                </Link>
              )}
              {subscription.stripeCustomerId && (
                <>
                  <button
                    type="button"
                    disabled={portalLoading}
                    onClick={openBillingPortal}
                    className="inline-flex items-center gap-sm rounded-full border border-border px-xl py-md font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ExternalLink className="size-4" />
                    )}
                    Manage
                  </button>
                  <button
                    type="button"
                    disabled={portalLoading}
                    onClick={openBillingPortal}
                    className="rounded-full border border-border px-xl py-md font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <div className="grid gap-xl md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-raised p-xl">
          <p className="mb-lg font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
            Payment
          </p>
          <div className="mb-lg flex gap-xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 flex-1 rounded-md bg-surface-sunken"
              />
            ))}
          </div>
          {subscription.stripeCustomerId ? (
            <button
              type="button"
              disabled={portalLoading}
              onClick={openBillingPortal}
              className="rounded-full border border-border px-lg py-sm font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
            >
              Update
            </button>
          ) : (
            <p className="font-body text-sm text-foreground-muted">
              Add a subscription to manage payment methods.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface-raised p-xl">
          <p className="mb-lg font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
            Receipts
          </p>
          {subscription.stripeCustomerId ? (
            <>
              <ul className="divide-y divide-border-subtle">
                {[0, 1, 2].map((offset) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - offset);
                  const label = d
                    .toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase();
                  return (
                    <li
                      key={offset}
                      className="flex items-center justify-between py-md first:pt-0"
                    >
                      <span className="font-body text-sm text-foreground-secondary">
                        {label}
                      </span>
                      <button
                        type="button"
                        onClick={openBillingPortal}
                        className="font-body text-sm text-primary hover:text-primary-hover"
                      >
                        ↓
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-md font-body text-xs text-foreground-muted">
                Download invoices in the billing portal.
              </p>
            </>
          ) : (
            <p className="font-body text-sm text-foreground-muted">
              Receipts appear here once you subscribe.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
