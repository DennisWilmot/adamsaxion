import posthog from "posthog-js";
import { getSentryDsn } from "../sentry.dsn";
import {
  getPostHogKey,
  getPostHogUiHost,
  POSTHOG_PROXY_PATH,
} from "./lib/posthog/config";

if (getSentryDsn()) {
  void import("../sentry.client.config");
}

const posthogKey = getPostHogKey();
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: POSTHOG_PROXY_PATH,
    ui_host: getPostHogUiHost(),
    defaults: "2026-01-30",
    person_profiles: "identified_only",
  });
}
