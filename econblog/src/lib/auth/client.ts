"use client";

import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/auth/redirect";

export async function signInWithGoogle(nextPath: string) {
  const supabase = createClient();
  const origin = window.location.origin;
  document.cookie = `auth_next=${encodeURIComponent(nextPath)}; path=/; max-age=600; samesite=lax`;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(origin, nextPath),
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
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: authCallbackUrl(origin, nextPath),
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
