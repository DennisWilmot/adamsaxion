import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionView } from "@/lib/subscription/service";
import { getStripe } from "@/lib/stripe/client";
import { isCheckoutConfigured, PLAN_LABELS, type CheckoutPlan } from "@/lib/stripe/config";

function formatAmount(amount: number, currency: string) {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user
    ? await getUserSubscriptionView(user.id, user.email)
    : null;

  const active = subscription?.hasAccess ?? false;

  let orderSummary: {
    planLabel: string;
    amountLabel: string | null;
    verified: boolean;
  } | null = null;

  if (sessionId && user && isCheckoutConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const sessionUserId =
        session.client_reference_id ?? session.metadata?.userId;
      if (sessionUserId === user.id && session.payment_status === "paid") {
        const plan = session.metadata?.plan as CheckoutPlan | undefined;
        const planLabel =
          plan && plan in PLAN_LABELS ? PLAN_LABELS[plan] : "Membership";

        let amountLabel: string | null = null;
        if (session.amount_total != null && session.currency) {
          amountLabel = formatAmount(session.amount_total, session.currency);
        }

        orderSummary = {
          planLabel,
          amountLabel,
          verified: true,
        };
      }
    } catch (error) {
      console.error("[subscribe/success] session verification failed:", error);
    }
  }

  return (
    <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-success mb-sm">
        {active ? "Payment successful" : "Processing payment"}
      </p>
      <h1 className="font-display font-bold text-2xl text-foreground mb-sm">
        {active ? "Welcome to the full curriculum" : "Almost there"}
      </h1>
      <p className="font-body text-sm text-foreground-secondary mb-2xl leading-relaxed">
        {active
          ? "Your subscription is active. Start your next lesson or review billing anytime from your profile."
          : "We're confirming your payment. This usually takes a few seconds — refresh this page or check your profile if access isn't ready yet."}
      </p>

      {orderSummary?.verified && (
        <div className="mb-2xl rounded-xl border border-border bg-surface-raised px-xl py-lg text-left">
          <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted mb-sm">
            Order confirmed
          </p>
          <p className="font-display text-lg font-semibold text-foreground">
            {orderSummary.planLabel}
          </p>
          {orderSummary.amountLabel && (
            <p className="mt-xs font-body text-sm text-foreground-secondary">
              Paid {orderSummary.amountLabel}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-md">
        <Link
          href="/lessons"
          className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
        >
          Browse lessons
        </Link>
        <Link
          href="/profile?tab=subscription"
          className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold border border-border text-foreground hover:bg-surface-sunken"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
