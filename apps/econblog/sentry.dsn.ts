/** Returns Sentry DSN when configured; otherwise undefined (Sentry stays disabled). */
export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}
