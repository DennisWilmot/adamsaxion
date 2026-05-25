import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionView } from "@/lib/subscription/service";

export async function requireAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { code: "FORBIDDEN" as const, message: "Sign in required." } };
  }

  return { user };
}

export async function getUserTier(userId: string, email?: string | null) {
  const sub = await getUserSubscriptionView(userId, email);
  return sub.hasAccess ? ("paid" as const) : ("free" as const);
}

export function getConcurrentCap(tier: "free" | "paid") {
  const freeCap = Number(process.env.PRICEWAR_FREE_CONCURRENT_CAP ?? "1");
  const paidCap = Number(process.env.PRICEWAR_PAID_CONCURRENT_CAP ?? "5");
  return tier === "paid" ? paidCap : freeCap;
}
