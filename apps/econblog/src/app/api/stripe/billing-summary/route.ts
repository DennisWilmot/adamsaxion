import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getSubscriptionRow } from "@/lib/subscription/service";
import { isCheckoutConfigured } from "@/lib/stripe/config";

export interface BillingSummary {
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  charges: {
    id: string;
    amount: number;
    currency: string;
    created: number;
    receiptUrl: string | null;
    description: string | null;
  }[];
}

export async function GET() {
  try {
    if (!isCheckoutConfigured()) {
      return NextResponse.json<BillingSummary>({ paymentMethod: null, charges: [] });
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
      return NextResponse.json<BillingSummary>({ paymentMethod: null, charges: [] });
    }

    const stripe = getStripe();
    const [paymentMethods, charges] = await Promise.all([
      stripe.paymentMethods.list({
        customer: row.stripeCustomerId,
        type: "card",
        limit: 1,
      }),
      stripe.charges.list({ customer: row.stripeCustomerId, limit: 5 }),
    ]);

    const pm = paymentMethods.data[0]?.card ?? null;

    return NextResponse.json<BillingSummary>({
      paymentMethod: pm
        ? {
            brand: pm.brand,
            last4: pm.last4,
            expMonth: pm.exp_month,
            expYear: pm.exp_year,
          }
        : null,
      charges: charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        created: c.created,
        receiptUrl: c.receipt_url ?? null,
        description: c.description ?? null,
      })),
    });
  } catch (error) {
    console.error("GET /api/stripe/billing-summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
