import { getSentryDsn } from "../sentry.dsn";

export async function register() {
  if (!getSentryDsn()) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<
    typeof import("@sentry/nextjs").captureRequestError
  >
) {
  if (!getSentryDsn()) return;

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
