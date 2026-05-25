"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PathSetupBanner } from "@/components/learning/PathSetupBanner";
import { PathSetupModal } from "@/components/learning/PathSetupModal";
import type { UserDashboard } from "@/lib/learning/user-dashboard";

export function LessonsPageExtras() {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [pathModalOpen, setPathModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.dashboard) setDashboard(data.dashboard);
      })
      .catch(() => {});
  }, []);

  if (!dashboard) return null;

  const { path, preferences } = dashboard;

  return (
    <>
      {preferences.needsPathSetup && (
        <PathSetupBanner onSetup={() => setPathModalOpen(true)} />
      )}

      {path.continue?.slug && (
        <Link
          href={`/lessons/${path.continue.slug}`}
          className="mb-2xl flex items-center justify-between rounded-lg border border-primary/30 bg-primary-subtle/30 px-xl py-lg hover:border-primary/50 transition-colors"
        >
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-primary mb-xs">
              Continue on your path
            </p>
            <p className="font-display font-semibold text-base text-foreground">
              {path.continue.title}
            </p>
          </div>
          <ArrowRight className="size-5 text-primary shrink-0" />
        </Link>
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
