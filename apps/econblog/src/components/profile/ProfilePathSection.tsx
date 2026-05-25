import type { profiles } from "@/db/schema";
import { getUserPathDashboard } from "@/lib/learning/user-dashboard";
import { ProfilePathTabClient } from "@/components/profile/ProfilePathTabClient";

type ProfilePathProfile = Pick<
  typeof profiles.$inferSelect,
  "id" | "username" | "totalXp" | "currentLevel"
>;

interface ProfilePathSectionProps {
  userId: string;
  userEmail: string | null;
  profile: ProfilePathProfile;
}

export async function ProfilePathSection({
  userId,
  userEmail,
  profile,
}: ProfilePathSectionProps) {
  const dashboard = await getUserPathDashboard(userId, profile, { userEmail });

  if (!dashboard) {
    return (
      <p className="font-body text-sm text-foreground-muted">
        We couldn&apos;t load your learning path. Please refresh the page.
      </p>
    );
  }

  return <ProfilePathTabClient dashboard={dashboard} />;
}
