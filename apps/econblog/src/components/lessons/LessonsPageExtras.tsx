"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PathSetupBanner } from "@/components/learning/PathSetupBanner";
import { PathSetupModal } from "@/components/learning/PathSetupModal";
import type { UserDashboard } from "@/lib/learning/user-dashboard";

export function LessonsPageExtras({
  initialDashboard,
}: {
  initialDashboard: UserDashboard | null;
}) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [pathModalOpen, setPathModalOpen] = useState(false);

  if (!dashboard) return null;

  const { path, preferences } = dashboard;
  const showPathSetup = preferences.needsPathSetup;
  const showContinue = Boolean(path.continue?.slug);

  return (
    <>
      {(showPathSetup || showContinue) && (
        <div
          className={`mb-2xl grid grid-cols-1 gap-md ${
            showPathSetup && showContinue ? "lg:grid-cols-2" : ""
          }`}
        >
          {showPathSetup ? (
            <PathSetupBanner onSetup={() => setPathModalOpen(true)} />
          ) : null}

          {showContinue && path.continue ? (
            <Link
              href={`/lessons/${path.continue.slug}`}
              className="flex h-full items-center justify-between rounded-lg border border-primary/30 bg-primary-subtle/30 px-xl py-lg hover:border-primary/50 transition-colors"
            >
              <div className="min-w-0 pr-md">
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-primary mb-xs">
                  Continue on your path
                </p>
                <p className="font-display font-semibold text-base text-foreground line-clamp-2">
                  {path.continue.title}
                </p>
              </div>
              <ArrowRight className="size-5 text-primary shrink-0" />
            </Link>
          ) : null}
        </div>
      )}

      <PathSetupModal
        open={pathModalOpen}
        onClose={() => setPathModalOpen(false)}
        onComplete={() => {
          setPathModalOpen(false);
          fetch("/api/user/dashboard")
            .then((r) => r.json())
            .then((data) => {
              if (data?.dashboard) setDashboard(data.dashboard);
            });
        }}
        entryBranch="manual"
      />
    </>
  );
}
