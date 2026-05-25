"use client";

import { useEffect } from "react";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import { ProfileMyPathTab } from "@/components/profile/tabs/ProfileMyPathTab";
import { useProfilePathActions } from "@/components/profile/ProfilePathActionsContext";

interface ProfilePathTabClientProps {
  dashboard: UserDashboard;
}

export function ProfilePathTabClient({ dashboard }: ProfilePathTabClientProps) {
  const { onBadge, onChangeFocus, onSetupPath } = useProfilePathActions();
  const badge = `${dashboard.path.completedCount}/${dashboard.path.totalCount}`;

  useEffect(() => {
    onBadge(badge);
  }, [badge, onBadge]);

  return (
    <ProfileMyPathTab
      dashboard={dashboard}
      onChangeFocus={onChangeFocus}
      onSetupPath={onSetupPath}
    />
  );
}
