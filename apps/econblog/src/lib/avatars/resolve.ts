/** Generated profile avatar first; OAuth (Google) portrait as fallback. */
export function resolveAvatarUrl(args: {
  profileAvatarUrl?: string | null;
  googleAvatarUrl?: string | null;
}): string | null {
  return args.profileAvatarUrl ?? args.googleAvatarUrl ?? null;
}

export function googleAvatarUrlFromUserMetadata(
  metadata: Record<string, unknown> | undefined
): string | null {
  const url = metadata?.avatar_url;
  return typeof url === "string" && url.trim() ? url : null;
}
