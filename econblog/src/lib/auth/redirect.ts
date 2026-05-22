export function safeNextPath(value: string | null | undefined, fallback = "/lessons") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export function authCallbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`;
}

export function authPageUrl(next: string, mode?: "signin" | "signup") {
  const params = new URLSearchParams();
  params.set("next", safeNextPath(next));
  if (mode) params.set("mode", mode);
  return `/auth?${params.toString()}`;
}
