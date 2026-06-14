/** Reverse-proxy path for PostHog (first-party, ad-blocker resistant). */
export const POSTHOG_PROXY_PATH = "/aa-capture";

export type PostHogRegion = "us" | "eu";

export function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  );
}

export function getPostHogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
}

export function getPostHogRegion(host = getPostHogHost()): PostHogRegion {
  return host.includes("eu") ? "eu" : "us";
}

export function isPostHogEnabled(): boolean {
  return Boolean(getPostHogKey());
}

export function getPostHogUiHost(region = getPostHogRegion()): string {
  return region === "eu" ? "https://eu.posthog.com" : "https://us.posthog.com";
}
