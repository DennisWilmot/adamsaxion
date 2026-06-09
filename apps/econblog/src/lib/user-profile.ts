import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { sanitizeUsername, validateUsername } from "@/lib/auth/username";
import { buildGeneratedAvatarPath } from "@/lib/avatars/generate";
import {
  googleAvatarUrlFromUserMetadata,
  resolveAvatarUrl,
} from "@/lib/avatars/resolve";

function buildFallbackUsername(user: User) {
  const baseName =
    user.user_metadata?.full_name?.replace(/\s+/g, "") ??
    user.email?.split("@")[0] ??
    `user_${user.id.slice(0, 8)}`;

  return `${baseName}_${user.id.slice(0, 6)}`;
}

function preferredUsernameFromUser(user: User): string {
  const fromMeta = user.user_metadata?.username;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    const sanitized = sanitizeUsername(fromMeta);
    if (!validateUsername(sanitized)) return sanitized;
  }
  return sanitizeUsername(buildFallbackUsername(user));
}

async function resolveUniqueUsername(base: string, userId: string): Promise<string> {
  let candidate = sanitizeUsername(base) || `user_${userId.slice(0, 8)}`;
  if (validateUsername(candidate)) {
    candidate = `user_${userId.slice(0, 8)}`;
  }

  for (let n = 0; n < 100; n++) {
    const tryName = n === 0 ? candidate : `${candidate}_${n}`;
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, tryName))
      .limit(1);

    if (!existing || existing.id === userId) {
      return tryName;
    }
  }

  return `${candidate}_${userId.slice(0, 6)}`;
}

function generatedAvatarPathForUser(userId: string): string {
  return buildGeneratedAvatarPath(userId);
}

async function ensureProfileAvatar(user: User, existingAvatarUrl: string | null) {
  if (existingAvatarUrl) {
    return existingAvatarUrl;
  }

  const avatarUrl = generatedAvatarPathForUser(user.id);
  await db
    .update(profiles)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(profiles.id, user.id));

  return avatarUrl;
}

export function resolveUserAvatarUrl(
  profile: { avatarUrl?: string | null } | null | undefined,
  user: User
): string | null {
  return resolveAvatarUrl({
    profileAvatarUrl: profile?.avatarUrl ?? null,
    googleAvatarUrl: googleAvatarUrlFromUserMetadata(user.user_metadata),
  });
}

export async function ensureProfileForUser(user: User) {
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfile) {
    await ensureProfileAvatar(user, existingProfile.avatarUrl);
    const [refreshed] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);
    return refreshed ?? existingProfile;
  }

  const username = await resolveUniqueUsername(
    preferredUsernameFromUser(user),
    user.id
  );

  const avatarUrl = generatedAvatarPathForUser(user.id);

  await db
    .insert(profiles)
    .values({
      id: user.id,
      username,
      avatarUrl,
      totalXp: 0,
      currentLevel: 1,
    })
    .onConflictDoNothing();

  const [createdProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return createdProfile ?? null;
}
