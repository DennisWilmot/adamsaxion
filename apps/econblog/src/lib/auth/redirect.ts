import type { NextRequest } from "next/server";

export function safeNextPath(value: string | null | undefined, fallback = "/lessons") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

/** Exact callback URL — must match Supabase redirect allowlist (no query params). */
export function authCallbackUrl(origin: string) {
  return `${origin}/auth/callback`;
}

export function authPageUrl(next: string, mode?: "signin" | "signup") {
  const params = new URLSearchParams();
  params.set("next", safeNextPath(next));
  if (mode) params.set("mode", mode);
  return `/auth?${params.toString()}`;
}

export function readAuthNextCookie(request: NextRequest | Request): string | null {
  const raw =
    "cookies" in request && typeof request.cookies?.get === "function"
      ? request.cookies.get("auth_next")?.value
      : null;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Public origin behind proxies (Vercel) for post-login redirects. */
export function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(",")[0]?.trim()}`;
  }
  return new URL(request.url).origin;
}
