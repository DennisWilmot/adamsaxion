import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin/auth";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  UserSubscriptionView,
} from "./types";

export interface UpsertSubscriptionInput {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildStatusLabel(
  status: SubscriptionStatus,
  cancelAtPeriodEnd: boolean
): string {
  if (status === "active" && cancelAtPeriodEnd) {
    return "Active — cancels at period end";
  }
  switch (status) {
    case "active":
      return "Active";
    case "canceled":
      return "Canceled";
    case "past_due":
      return "Payment issue";
    default:
      return "No active subscription";
  }
}

function buildRenewalLabel(
  plan: SubscriptionPlan | null,
  status: SubscriptionStatus,
  currentPeriodEnd: Date | null | undefined,
  cancelAtPeriodEnd: boolean
): string | null {
  if (plan === "lifetime" && status === "active") {
    return "Lifetime access — no renewal";
  }
  if (plan === "monthly" && status === "active") {
    const end = formatDate(currentPeriodEnd ?? undefined);
    if (cancelAtPeriodEnd && end) {
      return `Access until ${end}`;
    }
    if (end) {
      return `Renews on ${end}`;
    }
    return "Renews monthly";
  }
  if (status === "past_due") {
    return "Update your payment method to restore access";
  }
  return null;
}

export function subscriptionGrantsAccess(
  status: SubscriptionStatus,
  plan: SubscriptionPlan | null
): boolean {
  if (!plan) return false;
  if (plan === "lifetime" && status === "active") return true;
  return status === "active";
}

export async function getSubscriptionRow(userId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertSubscription(input: UpsertSubscriptionInput) {
  const now = new Date();
  const existing = await getSubscriptionRow(input.userId);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        plan: input.plan,
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, input.userId));
    return;
  }

  await db.insert(subscriptions).values({
    userId: input.userId,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    plan: input.plan,
    status: input.status,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getUserSubscriptionView(
  userId: string,
  userEmail?: string | null
): Promise<UserSubscriptionView> {
  if (isAdminEmail(userEmail)) {
    return {
      plan: null,
      status: "active",
      hasAccess: true,
      stripeCustomerId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      planLabel: "Admin access",
      statusLabel: "Full access",
      renewalLabel: null,
    };
  }

  const row = await getSubscriptionRow(userId);

  if (!row) {
    return {
      plan: null,
      status: "inactive",
      hasAccess: false,
      stripeCustomerId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      planLabel: null,
      statusLabel: "No subscription",
      renewalLabel: null,
    };
  }

  const plan = row.plan as SubscriptionPlan;
  const status = row.status as SubscriptionStatus;
  const hasAccess = subscriptionGrantsAccess(status, plan);

  return {
    plan,
    status,
    hasAccess,
    stripeCustomerId: row.stripeCustomerId,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    planLabel: plan === "monthly" ? "Monthly" : "Lifetime",
    statusLabel: buildStatusLabel(status, row.cancelAtPeriodEnd),
    renewalLabel: buildRenewalLabel(
      plan,
      status,
      row.currentPeriodEnd,
      row.cancelAtPeriodEnd
    ),
  };
}

export async function userHasLessonAccess(
  userId: string,
  userEmail?: string | null
) {
  const sub = await getUserSubscriptionView(userId, userEmail);
  return sub.hasAccess;
}
