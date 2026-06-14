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
        { error: "No monthly subscription to reactivate." },
        { status: 404 }
      );
    }

    if (!row.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is not scheduled to cancel." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.update(row.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    const customerId =
      typeof stripeSub.customer === "string"
        ? stripeSub.customer
        : stripeSub.customer.id;

    const periodEnd = stripeSub.items.data[0]?.current_period_end;

    await upsertSubscription({
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      plan: "monthly",
      status: "active",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : row.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/stripe/reactivate-subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
