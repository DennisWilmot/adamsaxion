export type CheckoutPlan = "monthly" | "lifetime";

export const PLAN_LABELS: Record<CheckoutPlan, string> = {
  monthly: "Monthly",
  lifetime: "Lifetime",
};

export const PLAN_PRICES: Record<CheckoutPlan, { amount: string; interval?: string }> = {
  monthly: { amount: "$19.99", interval: "/month" },
  lifetime: { amount: "$149", interval: " one-time" },
};

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function envValue(key: string) {
  const raw = process.env[key]?.trim();
  if (!raw) return null;
  return raw.replace(/^["']|["']$/g, "");
}

function isPlaceholder(value: string | null) {
  if (!value) return true;
  if (value.includes("...") || value.includes("REPLACE_ME")) return true;
  if (value === "price_" || value === "whsec_") return true;
  return false;
}

export function getStripePriceId(plan: CheckoutPlan): string | null {
  if (plan === "monthly") {
    return envValue("STRIPE_PRICE_ID_MONTHLY");
  }
  return envValue("STRIPE_PRICE_ID_LIFETIME");
}

/** Checkout needs secret key + real Price IDs from Stripe Dashboard. */
export function isCheckoutConfigured() {
  const secret = envValue("STRIPE_SECRET_KEY");
  const monthly = getStripePriceId("monthly");
  const lifetime = getStripePriceId("lifetime");
  return Boolean(
    secret?.startsWith("sk_") &&
      monthly?.startsWith("price_") &&
      !isPlaceholder(monthly) &&
      lifetime?.startsWith("price_") &&
      !isPlaceholder(lifetime)
  );
}

/** Webhooks need a real signing secret (from Dashboard or `stripe listen`). */
export function isWebhookConfigured() {
  const secret = envValue("STRIPE_WEBHOOK_SECRET");
  return Boolean(secret?.startsWith("whsec_") && !isPlaceholder(secret));
}

export function isStripeConfigured() {
  return isCheckoutConfigured() && isWebhookConfigured();
}

/** Human-readable hint for the subscribe page / API errors. */
export function getStripeSetupMessage(): string | null {
  const secret = envValue("STRIPE_SECRET_KEY");
  if (!secret?.startsWith("sk_")) {
    return "Add STRIPE_SECRET_KEY to econblog/.env (not the repo root .env), then restart the dev server.";
  }

  const monthly = getStripePriceId("monthly");
  if (!monthly?.startsWith("price_") || isPlaceholder(monthly)) {
    return "Set STRIPE_PRICE_ID_MONTHLY in econblog/.env to your real monthly price ID (Stripe Dashboard → Products → price_...).";
  }

  const lifetime = getStripePriceId("lifetime");
  if (!lifetime?.startsWith("price_") || isPlaceholder(lifetime)) {
    return "Set STRIPE_PRICE_ID_LIFETIME in econblog/.env to your real one-time price ID.";
  }

  if (!isWebhookConfigured()) {
    return "Checkout can work without webhooks in test mode, but set STRIPE_WEBHOOK_SECRET (run: stripe listen --forward-to localhost:3000/api/stripe/webhook) so subscriptions activate after payment.";
  }

  return null;
}
