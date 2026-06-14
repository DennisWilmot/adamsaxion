"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import type { UserSubscriptionView } from "@/lib/subscription/types";
import { PLAN_PRICES, type CheckoutPlan } from "@/lib/stripe/config";
import type { BillingSummary } from "@/app/api/stripe/billing-summary/route";

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
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingSummary | null>(null);

  const plan = subscription.plan as CheckoutPlan | null;
  const price = plan ? PLAN_PRICES[plan] : null;
  const nextCharge = formatPeriodEnd(subscription.currentPeriodEnd);

  useEffect(() => {
    if (!subscription.stripeCustomerId) return;
    fetch("/api/stripe/billing-summary")
      .then((r) => r.json())
      .then((data: BillingSummary) => setBilling(data))
      .catch(() => {});
  }, [subscription.stripeCustomerId]);

  async function handleUpgrade() {
    setError(null);
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "lifetime", next: "/profile" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function openBillingPortal() {
    setError(null);
    setInfo(null);
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

  async function handleCancelSubscription() {
    const expiry = nextCharge ?? "the end of your billing period";
    const confirmed = window.confirm(
      `Cancel your monthly plan? You'll keep full access until ${expiry}, then your subscription will end.`
    );
    if (!confirmed) return;

    setError(null);
    setInfo(null);
    setCancelLoading(true);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not cancel subscription");
        return;
      }
      setInfo(`Subscription canceled. You keep access until ${expiry}.`);
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleReactivateSubscription() {
    setError(null);
    setInfo(null);
    setCancelLoading(true);
    try {
      const res = await fetch("/api/stripe/reactivate-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reactivate subscription");
        return;
      }
      setInfo("Subscription reactivated. Your plan will renew as usual.");
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }

  const showUpgrade =
    subscription.hasAccess && subscription.plan === "monthly";
  const canManageBilling = Boolean(subscription.stripeCustomerId);
  const canCancelMonthly =
    subscription.hasAccess &&
    subscription.hasRecurringSubscription &&
    !subscription.cancelAtPeriodEnd;
  const canReactivateMonthly =
    subscription.hasAccess &&
    subscription.hasRecurringSubscription &&
    subscription.cancelAtPeriodEnd;
  const actionLoading = portalLoading || upgradeLoading || cancelLoading;

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
            {nextCharge &&
              subscription.plan === "monthly" &&
              !subscription.cancelAtPeriodEnd && (
                <p className="mt-xs font-body text-xs text-foreground-muted">
                  Next charge {nextCharge}
                </p>
              )}
            {nextCharge &&
              subscription.plan === "monthly" &&
              subscription.cancelAtPeriodEnd &&
              subscription.hasAccess && (
                <p className="mt-xs font-body text-xs text-foreground-muted">
                  Expires {nextCharge}
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
            Your subscription is set to expire at the end of the current billing
            period. You keep full access until then.
          </p>
        )}

        {error && (
          <p className="mt-md font-body text-sm text-error">{error}</p>
        )}
        {info && (
          <p className="mt-md font-body text-sm text-primary">{info}</p>
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
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleUpgrade}
                  className="inline-flex items-center gap-sm rounded-full bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover disabled:opacity-50"
                >
                  {upgradeLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Upgrade to Lifetime — {PLAN_PRICES.lifetime.amount}
                </button>
              )}
              {canManageBilling && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={openBillingPortal}
                  className="inline-flex items-center gap-sm rounded-full border border-border px-xl py-md font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
                >
                  {portalLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                  {subscription.plan === "lifetime" ? "Billing history" : "Manage billing"}
                </button>
              )}
              {canCancelMonthly && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancelSubscription}
                  className="rounded-full border border-border px-xl py-md font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
                >
                  {cancelLoading ? "Canceling…" : "Cancel plan"}
                </button>
              )}
              {canReactivateMonthly && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReactivateSubscription}
                  className="rounded-full border border-primary/40 bg-primary-subtle/30 px-xl py-md font-body text-sm font-semibold text-primary hover:bg-primary-subtle/50 disabled:opacity-50"
                >
                  {cancelLoading ? "Reactivating…" : "Reactivate plan"}
                </button>
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
          {billing?.paymentMethod ? (
            <>
              <div className="mb-lg flex items-center gap-md">
                <span className="font-body text-sm font-semibold capitalize text-foreground">
                  {billing.paymentMethod.brand}
                </span>
                <span className="font-body text-sm text-foreground-secondary">
                  •••• {billing.paymentMethod.last4}
                </span>
                <span className="font-body text-xs text-foreground-muted">
                  {billing.paymentMethod.expMonth}/{String(billing.paymentMethod.expYear).slice(-2)}
                </span>
              </div>
              <button
                type="button"
                disabled={portalLoading}
                onClick={openBillingPortal}
                className="rounded-full border border-border px-lg py-sm font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
              >
                Update
              </button>
            </>
          ) : subscription.stripeCustomerId && !billing ? (
            <div className="mb-lg h-6 w-40 animate-pulse rounded bg-surface-sunken" />
          ) : subscription.stripeCustomerId ? (
            <button
              type="button"
              disabled={portalLoading}
              onClick={openBillingPortal}
              className="rounded-full border border-border px-lg py-sm font-body text-sm font-semibold text-foreground hover:bg-surface-sunken disabled:opacity-50"
            >
              Manage payment
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
          {billing && billing.charges.length > 0 ? (
            <ul className="divide-y divide-border-subtle">
              {billing.charges.map((charge) => {
                const date = new Date(charge.created * 1000).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );
                const amount = (charge.amount / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: charge.currency.toUpperCase(),
                });
                return (
                  <li
                    key={charge.id}
                    className="flex items-center justify-between py-md first:pt-0"
                  >
                    <div>
                      <span className="font-body text-sm text-foreground-secondary">
                        {date}
                      </span>
                      <span className="ml-md font-body text-sm font-medium text-foreground">
                        {amount}
                      </span>
                    </div>
                    {charge.receiptUrl ? (
                      <a
                        href={charge.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-primary hover:text-primary-hover"
                      >
                        ↓
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : subscription.stripeCustomerId && !billing ? (
            <div className="space-y-md">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-surface-sunken" />
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-foreground-muted">
              {subscription.stripeCustomerId
                ? "No charges found."
                : "Receipts appear here once you subscribe."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
