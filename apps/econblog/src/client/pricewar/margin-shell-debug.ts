/** Client-side logging for Margin match shell / routing issues. */
const LOG_PREFIX = "[MarginShell]";

export function isMarginShellDebugEnabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  if (process.env.NODE_ENV === "development") return true;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function logMarginShell(
  area: string,
  event: string,
  payload?: Record<string, unknown>
): void {
  if (!isMarginShellDebugEnabled()) return;
  const label = `${LOG_PREFIX}[${area}] ${event}`;
  if (payload && Object.keys(payload).length > 0) {
    console.log(label, payload);
  } else {
    console.log(label);
  }
}

export function logMarginShellGroup(
  area: string,
  title: string,
  payload: Record<string, unknown>
): void {
  if (!isMarginShellDebugEnabled()) return;
  console.groupCollapsed(`${LOG_PREFIX}[${area}] ${title}`);
  for (const [key, value] of Object.entries(payload)) {
    console.log(`  ${key}:`, value);
  }
  console.groupEnd();
}
