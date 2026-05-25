"use client";

import { Compass, Pencil } from "lucide-react";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import { PathSetupBanner } from "@/components/learning/PathSetupBanner";
import { LearningPathTimeline } from "@/components/learning/LearningPathTimeline";

interface ProfileDashboardProps {
  dashboard: UserDashboard;
  onEditPath: () => void;
  onSetupPath: () => void;
}

export function ProfileDashboard({
  dashboard,
  onEditPath,
  onSetupPath,
}: ProfileDashboardProps) {
  const { path, preferences } = dashboard;

  return (
    <div className="space-y-3xl">
      {preferences.needsPathSetup && (
        <PathSetupBanner onSetup={onSetupPath} />
      )}

      <section>
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-sm">
            <Compass className="size-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              Your path
            </h2>
            {path.totalCount > 0 && (
              <span className="rounded-full bg-surface-sunken px-md py-xs font-body text-xs font-semibold text-foreground-secondary tabular-nums">
                {path.completedCount}/{path.totalCount}
              </span>
            )}
          </div>
          {preferences.pathSetupComplete && (
            <button
              type="button"
              onClick={onEditPath}
              className="flex items-center gap-xs font-body text-xs text-foreground-muted hover:text-primary"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          )}
        </div>
        <p className="font-body text-sm text-foreground-secondary mb-xl">
          {path.tagline}
        </p>

        <LearningPathTimeline items={path.timeline} />
      </section>
    </div>
  );
}
