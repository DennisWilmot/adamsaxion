import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getAppUrl, getStripeSetupMessage, isCheckoutConfigured } from "@/lib/stripe/config";
import { getSubscriptionRow } from "@/lib/subscription/service";

export async function POST() {
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await getSubscriptionRow(user.id);
    if (!row?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${getAppUrl()}/profile`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("POST /api/stripe/portal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
