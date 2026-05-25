"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { UserProgressSection } from "@/lib/learning/user-dashboard";
import { ProfileActivityHeatmap } from "@/components/profile/ProfileActivityHeatmap";

interface ProfileProgressTabProps {
  totalXp: number;
  currentLevel: number;
  xpToNext: number;
}

function formatCompletedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ProfileProgressTab({
  totalXp,
  currentLevel,
  xpToNext,
}: ProfileProgressTabProps) {
  const [progress, setProgress] = useState<UserProgressSection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        const response = await fetch("/api/profile/progress");
        if (!response.ok) {
          throw new Error("Failed to load progress");
        }
        const data = (await response.json()) as UserProgressSection;
        if (!cancelled) {
          setProgress(data);
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load your progress right now.");
        }
      }
    }

    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthLabel = new Date()
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  if (error) {
    return (
      <p className="font-body text-sm text-foreground-muted">{error}</p>
    );
  }

  if (!progress) {
    return <ProfileProgressSkeleton />;
  }

  const rankLabel = progress.rank ? `#${progress.rank}` : "—";

  return (
    <div className="space-y-2xl">
      <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
        <ProgressStatCard
          value={totalXp.toLocaleString()}
          label="Total XP"
          color="text-gold"
        />
        <ProgressStatCard
          value={String(currentLevel)}
          label="Level"
          color="text-primary"
        />
        <ProgressStatCard
          value={progress.streakDays > 0 ? `${progress.streakDays}d` : "0d"}
          label="Streak"
          color="text-success"
        />
        <ProgressStatCard
          value={rankLabel}
          label={`Rank (${monthLabel})`}
          color="text-foreground"
        />
      </div>

      <section className="rounded-xl border border-border bg-surface-raised p-lg">
        <div className="mb-md">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Activity · last 100 days
          </h2>
        </div>
        <ProfileActivityHeatmap days={progress.activityDays} />
      </section>

      <section className="rounded-xl border border-border bg-surface-raised p-xl">
        <div className="mb-lg flex items-center justify-between gap-md">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Lessons completed
          </h2>
          <span className="font-body text-sm text-foreground-muted tabular-nums">
            {progress.completedLessons.length} completed
          </span>
        </div>

        {progress.completedLessons.length === 0 ? (
          <p className="font-body text-sm text-foreground-muted">
            Complete your first lesson to see it here.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {progress.completedLessons.map((lesson) => (
              <li
                key={lesson.slug}
                className="flex items-start gap-md py-lg first:pt-0 last:pb-0"
              >
                <span className="mt-xs flex size-6 shrink-0 items-center justify-center rounded-md bg-success text-surface-raised">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">
                    {lesson.title}
                  </p>
                  <p className="mt-xs font-body text-xs text-foreground-muted">
                    {formatCompletedDate(lesson.completedAt)} · {lesson.xpEarned} XP
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="font-body text-xs text-foreground-muted">
        {xpToNext.toLocaleString()} XP until level {currentLevel + 1}.
      </p>
    </div>
  );
}

function ProfileProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-2xl">
      <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl border border-border bg-surface-sunken"
          />
        ))}
      </div>
      <div className="h-48 rounded-xl border border-border bg-surface-sunken" />
      <div className="h-64 rounded-xl border border-border bg-surface-sunken" />
    </div>
  );
}

function ProgressStatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-lg text-center">
      <p className={`font-display text-3xl font-semibold tabular-nums ${color}`}>
        {value}
      </p>
      <p className="mt-xs font-body text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </p>
    </div>
  );
}
