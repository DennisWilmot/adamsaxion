import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionView } from "@/lib/subscription/service";

export default async function SubscribeSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user
    ? await getUserSubscriptionView(user.id, user.email)
    : null;

  const active = subscription?.hasAccess ?? false;

  return (
    <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-success mb-sm">
        {active ? "Payment successful" : "Processing payment"}
      </p>
      <h1 className="font-display font-bold text-2xl text-foreground mb-sm">
        {active ? "Welcome to the full curriculum" : "Almost there"}
      </h1>
      <p className="font-body text-sm text-foreground-secondary mb-2xl leading-relaxed">
        {active
          ? "Your subscription is active. Start your next lesson or review billing anytime from your profile."
          : "We're confirming your payment. This usually takes a few seconds — refresh this page or check your profile if access isn't ready yet."}
      </p>

      <div className="flex flex-wrap justify-center gap-md">
        <Link
          href="/lessons"
          className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
        >
          Browse lessons
        </Link>
        <Link
          href="/profile"
          className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold border border-border text-foreground hover:bg-surface-sunken"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
