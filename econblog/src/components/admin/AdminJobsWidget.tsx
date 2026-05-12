"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  History,
  RefreshCw,
  Square,
  Zap,
} from "lucide-react";
import {
  getJobStageSummary,
  type LessonGenerationJobState,
} from "@/lib/admin/generation-state";

interface JobWithLesson {
  job: LessonGenerationJobState;
  lesson: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
}

const STORAGE_KEY = "admin-jobs-widget-open";

export function AdminJobsWidget() {
  const [open, setOpen] = useState(true);
  const [activeJobs, setActiveJobs] = useState<JobWithLesson[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobWithLesson[]>([]);

  async function loadJobs() {
    const res = await fetch("/api/admin/jobs", { cache: "no-store" });
    const data = await res.json();
    setActiveJobs(data.activeJobs ?? []);
    setRecentJobs(data.recentJobs ?? []);
  }

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "closed") {
      setOpen(false);
    }
    void loadJobs();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, open ? "open" : "closed");
  }, [open]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadJobs();
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  async function cancelJob(jobId: string) {
    await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", jobId }),
    });
    await loadJobs();
  }

  async function resumeLesson(lessonId: string) {
    await fetch(`/api/admin/lessons/${lessonId}/autopilot`, { method: "POST" });
    await loadJobs();
  }

  const totalVisibleJobs = useMemo(
    () => activeJobs.length + recentJobs.length,
    [activeJobs.length, recentJobs.length]
  );

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div className="pointer-events-auto w-[22rem] max-w-[calc(100vw-2rem)]">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="mb-sm ml-auto flex items-center gap-sm rounded-full border border-border bg-surface-raised px-lg py-sm shadow-lg transition-colors hover:border-primary/40"
        >
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="font-body text-sm font-semibold text-foreground">
            Jobs
          </span>
          <span className="rounded-full bg-surface-sunken px-sm py-[2px] font-body text-[10px] text-foreground-muted">
            {totalVisibleJobs}
          </span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          ) : (
            <ChevronUp className="h-4 w-4 text-foreground-muted" />
          )}
        </button>

        {open ? (
          <div className="rounded-2xl border border-border bg-surface-raised p-lg shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Background Jobs
              </h3>
              <button
                onClick={() => void loadJobs()}
                className="font-body text-xs text-primary hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="mt-lg">
              <h4 className="font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                Running
              </h4>
              <div className="mt-md space-y-sm">
                {activeJobs.length === 0 ? (
                  <p className="font-body text-sm text-foreground-muted">
                    No running jobs right now.
                  </p>
                ) : (
                  activeJobs.map(({ job, lesson }) => {
                    const progressPercent =
                      job.total > 0
                        ? Math.min((job.progress / job.total) * 100, 100)
                        : 0;

                    return (
                      <div
                        key={job.id}
                        className="rounded-lg bg-surface-sunken p-md"
                      >
                        <p className="font-body text-sm font-medium text-foreground">
                          {lesson.title}
                        </p>
                        <p className="mt-xs font-body text-xs text-foreground-muted">
                          {job.currentStep ?? "Waiting for worker..."}
                        </p>
                        <div className="mt-sm h-2 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="mt-sm flex items-center justify-between gap-sm">
                          <span className="font-body text-[11px] text-foreground-muted">
                            {getJobStageSummary(job)} · {job.progress}/
                            {job.total || 0}
                          </span>
                          <div className="flex items-center gap-sm">
                            <button
                              onClick={() => void cancelJob(job.id)}
                              className="flex items-center gap-xs font-body text-xs text-red-700 hover:underline"
                            >
                              <Square className="h-3 w-3" /> Cancel
                            </button>
                            <Link
                              href={`/admin/lessons/${lesson.id}`}
                              className="flex items-center gap-xs font-body text-xs text-primary hover:underline"
                            >
                              <Eye className="h-3 w-3" /> Inspect
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-lg border-t border-border pt-lg">
              <h4 className="font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                Recent
              </h4>
              <div className="mt-md space-y-sm">
                {recentJobs.length === 0 ? (
                  <p className="font-body text-sm text-foreground-muted">
                    No recent jobs yet.
                  </p>
                ) : (
                  recentJobs.slice(0, 5).map(({ job, lesson }) => (
                    <div key={job.id} className="rounded-lg bg-surface-sunken p-md">
                      <div className="flex items-start justify-between gap-sm">
                        <div className="min-w-0">
                          <p className="truncate font-body text-sm font-medium text-foreground">
                            {lesson.title}
                          </p>
                          <p className="mt-xs font-body text-xs text-foreground-muted">
                            {getJobStageSummary(job)} ·{" "}
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`rounded px-sm py-[2px] text-[10px] font-semibold uppercase tracking-wider ${
                            job.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : job.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-sm flex items-center justify-between gap-sm">
                        <div className="flex items-center gap-sm">
                          {(job.status === "failed" ||
                            job.status === "cancelled") &&
                          !["review", "published", "archived"].includes(
                            lesson.status
                          ) ? (
                            <button
                              onClick={() => void resumeLesson(lesson.id)}
                              className="flex items-center gap-xs font-body text-xs text-primary hover:underline"
                            >
                              <RefreshCw className="h-3 w-3" /> Resume
                            </button>
                          ) : null}
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="flex items-center gap-xs font-body text-xs text-primary hover:underline"
                          >
                            <Eye className="h-3 w-3" /> Inspect
                          </Link>
                        </div>
                        <History className="h-3.5 w-3.5 text-foreground-muted" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
