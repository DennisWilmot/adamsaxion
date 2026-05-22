"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Fallback when Supabase sends OAuth to Site URL (/) instead of /auth/callback. */
export function AuthCallbackRedirect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || pathname === "/auth/callback") return;

    const params = new URLSearchParams();
    params.set("code", code);
    const next = searchParams.get("next");
    if (next) params.set("next", next);

    window.location.replace(`/auth/callback?${params.toString()}`);
  }, [pathname, searchParams]);

  return null;
}
