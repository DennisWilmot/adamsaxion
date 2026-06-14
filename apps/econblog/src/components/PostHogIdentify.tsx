"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";
import { isPostHogEnabled } from "@/lib/posthog/config";

export function PostHogIdentify() {
  useEffect(() => {
    if (!isPostHogEnabled()) return;

    const supabase = createClient();

    const syncIdentity = (user: { id: string; email?: string | null } | null) => {
      if (user) {
        posthog.identify(user.id, {
          email: user.email ?? undefined,
        });
        return;
      }

      posthog.reset();
    };

    supabase.auth.getUser().then(({ data }) => {
      syncIdentity(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncIdentity(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
