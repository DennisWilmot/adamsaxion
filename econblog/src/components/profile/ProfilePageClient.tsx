"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { PathSetupModal } from "@/components/learning/PathSetupModal";

interface ProfilePageClientProps {
  initialDashboard: UserDashboard;
}

export function ProfilePageClient({ initialDashboard }: ProfilePageClientProps) {
  const router = useRouter();
  const [pathModalOpen, setPathModalOpen] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <>
      <ProfileDashboard
        dashboard={initialDashboard}
        onEditPath={() => setPathModalOpen(true)}
        onSetupPath={() => setPathModalOpen(true)}
      />
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
