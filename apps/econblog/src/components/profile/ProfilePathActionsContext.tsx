"use client";

import { createContext, useContext } from "react";

interface ProfilePathActions {
  onBadge: (badge: string) => void;
  onChangeFocus: () => void;
  onSetupPath: () => void;
}

const ProfilePathActionsContext = createContext<ProfilePathActions | null>(null);

export function ProfilePathActionsProvider({
  value,
  children,
}: {
  value: ProfilePathActions;
  children: React.ReactNode;
}) {
  return (
    <ProfilePathActionsContext.Provider value={value}>
      {children}
    </ProfilePathActionsContext.Provider>
  );
}

export function useProfilePathActions() {
  const ctx = useContext(ProfilePathActionsContext);
  if (!ctx) {
    throw new Error("useProfilePathActions must be used within ProfilePathActionsProvider");
  }
  return ctx;
}
