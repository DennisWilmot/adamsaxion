import * as Sentry from "@sentry/nextjs";
import { getSentryDsn } from "./sentry.dsn";

const dsn = getSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: true,
  });
}
