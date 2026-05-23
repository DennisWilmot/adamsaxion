"use client";

import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl, safeNextPath } from "@/lib/auth/redirect";

function setAuthNextCookie(nextPath: string, maxAgeSeconds = 600) {
  document.cookie = `auth_next=${encodeURIComponent(safeNextPath(nextPath))}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export async function signInWithGoogle(nextPath: string) {
  const supabase = createClient();
  const origin = window.location.origin;
  setAuthNextCookie(nextPath);
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(origin),
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
  nextPath: string
) {
  const supabase = createClient();
  const origin = window.location.origin;
  setAuthNextCookie(nextPath, 86_400);
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: authCallbackUrl(origin),
    },
  });
}

export async function ensureProfileOnClient() {
  const res = await fetch("/api/auth/ensure-profile", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not create profile");
  }
  return res.json() as Promise<{ username: string }>;
}
