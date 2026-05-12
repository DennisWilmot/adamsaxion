import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

function buildProfileUsername(user: User) {
  const baseName =
    user.user_metadata?.full_name?.replace(/\s+/g, "") ??
    user.email?.split("@")[0] ??
    `user_${user.id.slice(0, 8)}`;

  return `${baseName}_${user.id.slice(0, 6)}`;
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

  const username = buildProfileUsername(user);

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
