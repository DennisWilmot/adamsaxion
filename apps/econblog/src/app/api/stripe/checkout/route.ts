import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import {
  getAppUrl,
  getStripePriceId,
  getStripeSetupMessage,
  isCheckoutConfigured,
  type CheckoutPlan,
} from "@/lib/stripe/config";
import { getSubscriptionRow } from "@/lib/subscription/service";

export async function POST(request: Request) {
  try {
    if (!isCheckoutConfigured()) {
      return NextResponse.json(
        { error: getStripeSetupMessage() ?? "Stripe is not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan as CheckoutPlan;

    if (plan !== "monthly" && plan !== "lifetime") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getStripePriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan" },
        { status: 503 }
      );
    }

    const existing = await getSubscriptionRow(user.id);
    if (existing?.status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();
    const next =
      typeof body.next === "string" && body.next.startsWith("/")
        ? body.next
        : "/lessons";

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: plan === "monthly" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe?canceled=1&next=${encodeURIComponent(next)}`,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      allow_promotion_codes: true,
    };

    if (existing?.stripeCustomerId) {
      sessionParams.customer = existing.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    if (plan === "monthly") {
      sessionParams.subscription_data = {
        metadata: { userId: user.id },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/stripe/checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
