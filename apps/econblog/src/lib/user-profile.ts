import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { sanitizeUsername, validateUsername } from "@/lib/auth/username";

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

export async function ensureProfileForUser(user: User) {
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfile) {
    return existingProfile;
  }

  const username = await resolveUniqueUsername(
    preferredUsernameFromUser(user),
    user.id
  );

  await db
    .insert(profiles)
    .values({
      id: user.id,
      username,
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
