"use client";

import { useQuery } from "@tanstack/react-query";

export interface UserProfileSummary {
  username: string;
  avatarUrl: string | null;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async (): Promise<UserProfileSummary | null> => {
      const res = await fetch("/api/user/profile", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        username: data.username as string,
        avatarUrl: (data.avatarUrl as string | null) ?? null,
      };
    },
    staleTime: 60_000,
  });
}
