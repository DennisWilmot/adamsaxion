"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

interface LessonPreviewBannerProps {
  sectionCount: number;
}

export function LessonPreviewBanner({ sectionCount }: LessonPreviewBannerProps) {
  const pathname = usePathname();
  const href = `/subscribe?next=${encodeURIComponent(pathname)}`;
  const lockedSections = Math.max(0, sectionCount - 1);

  return (
    <div className="mt-3xl rounded-xl border border-border bg-surface-sunken p-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-primary mb-xs">
            Preview
          </p>
          <h3 className="font-display font-bold text-lg text-foreground mb-sm">
            Ready to keep going?
          </h3>
          <p className="font-body text-sm text-foreground-secondary max-w-md leading-relaxed">
            You&apos;ve read Section 1.
            {lockedSections > 0
              ? ` Subscribe to unlock ${lockedSections} more section${lockedSections === 1 ? "" : "s"}, quizzes, and the mastery exam.`
              : " Subscribe to unlock quizzes and the mastery exam."}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center gap-sm rounded-lg bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
        >
          <Lock className="size-4" />
          Unlock full lesson
        </Link>
      </div>
    </div>
  );
}
