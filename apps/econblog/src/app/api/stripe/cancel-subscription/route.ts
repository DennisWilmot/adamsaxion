import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { isCheckoutConfigured } from "@/lib/stripe/config";
import { getSubscriptionRow, upsertSubscription } from "@/lib/subscription/service";

export async function POST() {
  try {
    if (!isCheckoutConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await getSubscriptionRow(user.id);
    if (!row?.stripeSubscriptionId || row.plan !== "monthly") {
      return NextResponse.json(
        { error: "No active monthly subscription to cancel." },
        { status: 404 }
      );
    }

    if (row.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is already set to cancel." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.update(row.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const customerId =
      typeof stripeSub.customer === "string"
        ? stripeSub.customer
        : stripeSub.customer.id;

    const periodEnd = stripeSub.items.data[0]?.current_period_end;
    const cancelAt = stripeSub.cancel_at;

    await upsertSubscription({
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      plan: "monthly",
      status: "active",
      currentPeriodEnd: cancelAt
        ? new Date(cancelAt * 1000)
        : periodEnd
          ? new Date(periodEnd * 1000)
          : row.currentPeriodEnd,
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/stripe/cancel-subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
