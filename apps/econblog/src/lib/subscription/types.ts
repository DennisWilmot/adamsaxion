export type SubscriptionPlan = "monthly" | "lifetime";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "inactive";

export interface UserSubscriptionView {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  hasAccess: boolean;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  planLabel: string | null;
  statusLabel: string;
  renewalLabel: string | null;
}
