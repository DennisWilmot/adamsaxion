"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  username: string;
  email: string;
  totalXp: number;
  currentLevel: number;
  avatarUrl: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
        <p className="font-body text-foreground-muted animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-[36rem] mx-auto px-xl py-5xl text-center">
        <p className="font-body text-foreground-secondary">
          Sign in to view your profile.
        </p>
      </div>
    );
  }

  const xpInLevel = profile.totalXp % 1000;
  const levelProgress = (xpInLevel / 1000) * 100;
  const xpToNext = 1000 - xpInLevel;

  return (
    <div className="max-w-[36rem] mx-auto px-xl py-3xl">
      {/* Identity */}
      <div className="flex items-center gap-xl mb-3xl">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-lg"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-primary flex items-center justify-center text-xl font-display font-bold text-surface-raised">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {profile.username}
          </h1>
          <p className="font-body text-sm text-foreground-muted">
            {profile.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-lg mb-2xl">
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-bold text-2xl text-gold tabular-nums">
            {profile.totalXp.toLocaleString()}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">
            Total XP
          </p>
        </div>
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-bold text-2xl text-primary tabular-nums">
            {profile.currentLevel}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">
            Level
          </p>
        </div>
        <div className="bg-surface-sunken rounded-lg p-lg">
          <p className="font-display font-bold text-2xl text-foreground tabular-nums">
            {xpToNext}
          </p>
          <p className="font-body text-xs text-foreground-muted mt-xs">
            XP to next
          </p>
        </div>
      </div>

      {/* Level Progress */}
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

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="font-body text-sm text-foreground-muted hover:text-error transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
