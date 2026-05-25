"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import type { UserSubscriptionView } from "@/lib/subscription/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  ProfileTabNav,
  type ProfileTabId,
} from "@/components/profile/ProfileTabNav";
import { ProfileMyPathTab } from "@/components/profile/tabs/ProfileMyPathTab";
import { ProfilePersonalTab } from "@/components/profile/tabs/ProfilePersonalTab";
import { ProfileSubscriptionTab } from "@/components/profile/tabs/ProfileSubscriptionTab";
import { ProfileProgressTab } from "@/components/profile/tabs/ProfileProgressTab";
import { PathSetupModal } from "@/components/learning/PathSetupModal";

const VALID_TABS = new Set<ProfileTabId>([
  "personal",
  "subscription",
  "path",
  "progress",
]);

interface ProfilePageClientProps {
  username: string;
  email: string;
  avatarUrl: string | null;
  totalXp: number;
  currentLevel: number;
  xpToNext: number;
  levelProgress: number;
  dashboard: UserDashboard;
  subscription: UserSubscriptionView;
}

export function ProfilePageClient({
  username,
  email,
  avatarUrl,
  totalXp,
  currentLevel,
  xpToNext,
  levelProgress,
  dashboard,
  subscription,
}: ProfilePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ProfileTabId | null;
  const initialTab =
    tabParam && VALID_TABS.has(tabParam) ? tabParam : "path";

  const [activeTab, setActiveTab] = useState<ProfileTabId>(initialTab);
  const [pathModalOpen, setPathModalOpen] = useState(false);

  function handleTabChange(tab: ProfileTabId) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }

  function refresh() {
    router.refresh();
  }

  return (
    <>
      <ProfileHeader
        username={username}
        email={email}
        totalXp={totalXp}
        currentLevel={currentLevel}
        xpToNext={xpToNext}
        levelProgress={levelProgress}
      />

      <ProfileTabNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pathBadge={`${dashboard.path.completedCount}/${dashboard.path.totalCount}`}
      >
        {activeTab === "path" && (
          <ProfileMyPathTab
            dashboard={dashboard}
            onChangeFocus={() => setPathModalOpen(true)}
            onSetupPath={() => setPathModalOpen(true)}
          />
        )}

        {activeTab === "personal" && (
          <ProfilePersonalTab
            username={username}
            email={email}
            avatarUrl={avatarUrl}
          />
        )}

        {activeTab === "subscription" && (
          <ProfileSubscriptionTab subscription={subscription} />
        )}

        {activeTab === "progress" && (
          <ProfileProgressTab
            dashboard={dashboard}
            totalXp={totalXp}
            currentLevel={currentLevel}
            xpToNext={xpToNext}
          />
        )}
      </ProfileTabNav>

      <PathSetupModal
        open={pathModalOpen}
        onClose={() => setPathModalOpen(false)}
        onComplete={() => {
          setPathModalOpen(false);
          refresh();
        }}
        entryBranch="manual"
      />
    </>
  );
}
