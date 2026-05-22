import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { createClient } from "@/lib/supabase/server";
import { getUserDashboard } from "@/lib/learning/user-dashboard";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
        <p className="font-body text-foreground-secondary mb-lg">
          Sign in to view your profile.
        </p>
        <a
          href="/auth?next=/profile"
          className="inline-flex rounded-lg px-xl py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
        >
          Sign in or create account
        </a>
      </div>
    );
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    return (
      <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
        <p className="font-body text-foreground-secondary">
          We couldn&apos;t find your profile yet. Try signing out and back in.
        </p>
      </div>
    );
  }

  const dashboard = await getUserDashboard(user.id);
  const xpInLevel = profile.totalXp % 1000;
  const levelProgress = (xpInLevel / 1000) * 100;
  const xpToNext = 1000 - xpInLevel;
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  return (
    <div className="max-w-[72rem] mx-auto px-xl py-3xl">
      <div className="flex items-center gap-xl mb-3xl">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary text-xl font-display font-bold text-surface-raised">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display font-semibold text-2xl text-foreground">
            {profile.username}
          </h1>
          <p className="font-body text-sm text-foreground-muted">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-lg mb-2xl">
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-semibold text-2xl text-gold tabular-nums">
            {profile.totalXp.toLocaleString()}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">Total XP</p>
        </div>
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-semibold text-2xl text-primary tabular-nums">
            {profile.currentLevel}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">Level</p>
        </div>
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-semibold text-2xl text-foreground tabular-nums">
            {xpToNext}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">XP to next</p>
        </div>
      </div>

      <div className="mb-3xl">
        <div className="flex justify-between font-body text-xs text-foreground-muted mb-sm">
          <span>Level {profile.currentLevel}</span>
          <span>Level {profile.currentLevel + 1}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-sunken overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {dashboard && <ProfilePageClient initialDashboard={dashboard} />}

      <div className="mt-3xl">
        <SignOutButton />
      </div>
    </div>
  );
}
