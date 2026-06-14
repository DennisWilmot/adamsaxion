import { buildGeneratedAvatarPath } from "@/lib/avatars/generate";

/** Generated profile avatar first; OAuth (Google) portrait as fallback. */
export function resolveAvatarUrl(args: {
  profileAvatarUrl?: string | null;
  googleAvatarUrl?: string | null;
}): string | null {
  const profileAvatarUrl = args.profileAvatarUrl?.trim();
  const googleAvatarUrl = args.googleAvatarUrl?.trim();
  return profileAvatarUrl || googleAvatarUrl || null;
}

/** Resolve a stored profile avatar, falling back to the generated avatar route. */
export function resolveProfileAvatarUrl(
  avatarUrl: string | null | undefined,
  userId: string
): string {
  return avatarUrl?.trim() || buildGeneratedAvatarPath(userId);
}

export function googleAvatarUrlFromUserMetadata(
  metadata: Record<string, unknown> | undefined
): string | null {
  const url = metadata?.avatar_url;
  return typeof url === "string" && url.trim() ? url : null;
}
