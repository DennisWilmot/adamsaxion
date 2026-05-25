import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubscribePlans } from "@/components/billing/SubscribePlans";
import { getStripeSetupMessage } from "@/lib/stripe/config";
import { getUserSubscriptionView } from "@/lib/subscription/service";
import { LESSON_ZERO_SLUG } from "@/lib/constants/lessons";

export default async function SubscribePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user
    ? await getUserSubscriptionView(user.id, user.email)
    : null;

  const setupMessage = getStripeSetupMessage();

  return (
    <div className="max-w-[48rem] mx-auto px-xl py-3xl">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-primary mb-sm">
        Unlock the full curriculum
      </p>
      <h1 className="font-display font-bold text-3xl text-foreground mb-sm text-balance">
        Choose your plan
      </h1>
      <p className="font-body text-base text-foreground-secondary mb-2xl max-w-lg">
        Lesson Zero is free for everyone. Subscribe to access every other lesson,
        quiz gates, mastery exams, and your personalized path.
      </p>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface-sunken" />}>
        <SubscribePlans
          isAuthenticated={!!user}
          hasAccess={subscription?.hasAccess ?? false}
          setupMessage={setupMessage}
        />
      </Suspense>

      <p className="mt-2xl text-center font-body text-sm text-foreground-muted">
        Not ready yet?{" "}
        <Link
          href={`/lessons/${LESSON_ZERO_SLUG}`}
          className="text-primary hover:underline"
        >
          Continue with Lesson Zero
        </Link>
      </p>
    </div>
  );
}
