import { getSentryDsn } from "../sentry.dsn";

if (getSentryDsn()) {
  void import("../sentry.client.config");
}
