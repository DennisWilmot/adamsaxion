/** Client mirror of server MARGIN_RATED_ENABLED (manual flip). */
export function isMarginRatedEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_MARGIN_RATED_ENABLED === "true";
}

export function isMarginDebugClient(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}
