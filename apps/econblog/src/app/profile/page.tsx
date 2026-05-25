import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { ProfilePathSection } from "@/components/profile/ProfilePathSection";
import { ProfilePathSkeleton } from "@/components/profile/ProfilePathSkeleton";
import { getSessionUser } from "@/lib/supabase/session-user";
import { getUserSubscriptionView } from "@/lib/subscription/service";

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-[36rem] px-xl py-5xl text-center">
        <p className="mb-lg font-body text-foreground-secondary">
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

  const [[profile], subscription] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        totalXp: profiles.totalXp,
        currentLevel: profiles.currentLevel,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1),
    getUserSubscriptionView(user.id, user.email),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[36rem] px-xl py-5xl text-center">
        <p className="font-body text-foreground-secondary">
          We couldn&apos;t find your profile yet. Try signing out and back in.
        </p>
      </div>
    );
  }

  const xpInLevel = profile.totalXp % 1000;
  const levelProgress = (xpInLevel / 1000) * 100;
  const xpToNext = 1000 - xpInLevel;
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  return (
    <div className="mx-auto max-w-[72rem] px-xl py-3xl">
      <ProfilePageClient
        username={profile.username}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        totalXp={profile.totalXp}
        currentLevel={profile.currentLevel}
        xpToNext={xpToNext}
        levelProgress={levelProgress}
        subscription={subscription}
        pathTab={
          <Suspense fallback={<ProfilePathSkeleton />}>
            <ProfilePathSection
              userId={user.id}
              userEmail={user.email ?? null}
              profile={profile}
            />
          </Suspense>
        }
      />
    </div>
  );
}
