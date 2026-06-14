import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getStripe } from "./client";
import { upsertSubscription } from "@/lib/subscription/service";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/types";

function periodEnd(sub: Stripe.Subscription) {
  const end = sub.items.data[0]?.current_period_end;
  return end ? new Date(end * 1000) : null;
}

/** Portal cancel often sets cancel_at instead of cancel_at_period_end. */
function isPendingCancellation(sub: Stripe.Subscription) {
  return sub.cancel_at_period_end || sub.cancel_at != null;
}

function accessUntil(sub: Stripe.Subscription) {
  if (sub.cancel_at) {
    return new Date(sub.cancel_at * 1000);
  }
  return periodEnd(sub);
}

async function resolveUserId(stripeSub: Stripe.Subscription) {
  const fromMetadata = stripeSub.metadata?.userId;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer?.id;
  if (!customerId) return null;

  const [row] = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId))
    .limit(1);

  return row?.userId ?? null;
}

async function syncSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
  userId: string
) {
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  let status: SubscriptionStatus = "inactive";
  if (stripeSub.status === "active" || stripeSub.status === "trialing") {
    status = "active";
  } else if (stripeSub.status === "past_due" || stripeSub.status === "unpaid") {
    status = "past_due";
  } else if (
    stripeSub.status === "canceled" ||
    stripeSub.status === "incomplete_expired"
  ) {
    status = "canceled";
  }

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: stripeSub.id,
    plan: "monthly",
    status,
    currentPeriodEnd: accessUntil(stripeSub),
    cancelAtPeriodEnd: isPendingCancellation(stripeSub),
  });
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId) {
    console.error("[stripe] checkout.session.completed missing userId");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!customerId) {
    console.error("[stripe] checkout.session.completed missing customer");
    return;
  }

  if (session.mode === "payment") {
    await upsertSubscription({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      plan: "lifetime",
      status: "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    const stripe = getStripe();
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    await syncSubscriptionFromStripe(stripeSub, userId);
  }
}

export async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const userId = await resolveUserId(stripeSub);
  if (!userId) {
    console.warn("[stripe] subscription.updated could not resolve userId");
    return;
  }
  await syncSubscriptionFromStripe(stripeSub, userId);
}

export async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const userId = await resolveUserId(stripeSub);
  if (!userId) return;

  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: null,
    plan: "monthly",
    status: "canceled",
    currentPeriodEnd: accessUntil(stripeSub),
    cancelAtPeriodEnd: false,
  });
}
