"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import { PathSetupBanner } from "@/components/learning/PathSetupBanner";
import { PathDotGrid } from "@/components/profile/PathDotGrid";
import { PathStepper } from "@/components/profile/PathStepper";

const LESSONS_PER_PAGE = 8;

interface ProfileMyPathTabProps {
  dashboard: UserDashboard;
  onChangeFocus: () => void;
  onSetupPath: () => void;
}

function lessonStateLabel(state: UserDashboard["path"]["lessons"][0]["state"]) {
  switch (state) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "up_next":
      return "Up next";
    case "locked":
      return "Locked — subscribe to unlock";
    case "coming_soon":
      return "Coming soon";
  }
}

export function ProfileMyPathTab({
  dashboard,
  onChangeFocus,
  onSetupPath,
}: ProfileMyPathTabProps) {
  const { path, preferences } = dashboard;
  const lessons = path.lessons;
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(lessons.length / LESSONS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * LESSONS_PER_PAGE;
  const pageLessons = lessons.slice(pageStart, pageStart + LESSONS_PER_PAGE);

  useEffect(() => {
    const activeIdx = lessons.findIndex((l) => l.state === "in_progress");
    if (activeIdx >= 0) {
      setPage(Math.floor(activeIdx / LESSONS_PER_PAGE));
    }
  }, [lessons]);

  return (
    <div className="space-y-3xl">
      {preferences.needsPathSetup && (
        <PathSetupBanner onSetup={onSetupPath} />
      )}

      <div className="grid gap-2xl lg:grid-cols-[1fr_18rem]">
        <div className="space-y-2xl">
          <section className="min-w-0 rounded-xl border border-border bg-surface-raised p-xl">
            <p className="mb-sm font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
              Your path · {path.completedCount} / {path.totalCount}
            </p>
            <h2 className="mb-lg font-display text-xl font-semibold text-foreground">
              {path.title}
            </h2>

            <div className="mb-lg">
              <PathDotGrid lessons={lessons} />
            </div>

            <PathStepper lessons={lessons} />

            {path.plannedCount > path.totalCount && (
              <p className="mt-md font-body text-xs text-foreground-muted">
                {path.totalCount} available now ·{" "}
                {path.plannedCount - path.totalCount} more coming in this path
              </p>
            )}

            <button
              type="button"
              onClick={onChangeFocus}
              className="mt-xl rounded-full bg-primary px-lg py-sm font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover"
            >
              Change focus
            </button>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised p-xl">
            <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
              <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
                Lessons
              </p>
              {totalPages > 1 && (
                <p className="font-body text-xs text-foreground-muted tabular-nums">
                  {pageStart + 1}–{Math.min(pageStart + LESSONS_PER_PAGE, lessons.length)} of{" "}
                  {lessons.length}
                </p>
              )}
            </div>

            <ul className="divide-y divide-border-subtle">
              {pageLessons.map((lesson) => {
                const label = lessonStateLabel(lesson.state);
                const canOpen =
                  lesson.slug &&
                  lesson.state !== "locked" &&
                  lesson.state !== "coming_soon";
                const isResume = lesson.state === "in_progress";

                return (
                  <li
                    key={lesson.corpusId}
                    className="flex items-center gap-lg py-lg first:pt-0 last:pb-0"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken font-body text-xs font-semibold tabular-nums text-foreground-muted">
                      {lesson.listIndex}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-medium text-foreground leading-snug">
                        {lesson.title}
                      </p>
                      <p
                        className={`mt-xs font-body text-xs ${
                          lesson.state === "locked"
                            ? "text-foreground-muted"
                            : lesson.state === "in_progress"
                            ? "text-primary"
                            : "text-foreground-secondary"
                        }`}
                      >
                        {lesson.state === "locked" && (
                          <Lock className="mr-xs inline size-3 -translate-y-px" />
                        )}
                        {label}
                      </p>
                    </div>
                    {canOpen ? (
                      <Link
                        href={`/lessons/${lesson.slug}`}
                        className={`shrink-0 rounded-full px-lg py-sm font-body text-xs font-semibold transition-colors ${
                          isResume
                            ? "bg-primary text-surface-raised hover:bg-primary-hover"
                            : "border border-border text-foreground hover:bg-surface-sunken"
                        }`}
                      >
                        {isResume ? "Resume" : "Open"}
                      </Link>
                    ) : lesson.state === "locked" ? (
                      <Link
                        href="/subscribe"
                        className="shrink-0 rounded-full border border-border px-lg py-sm font-body text-xs font-semibold text-foreground hover:bg-surface-sunken"
                      >
                        Subscribe
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="mt-xl flex items-center justify-between gap-md border-t border-border-subtle pt-lg">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-xs rounded-full border border-border px-lg py-sm font-body text-sm text-foreground hover:bg-surface-sunken disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <span className="font-body text-xs text-foreground-muted tabular-nums">
                  Page {safePage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="inline-flex items-center gap-xs rounded-full border border-border px-lg py-sm font-body text-sm text-foreground hover:bg-surface-sunken disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-xl">
          {path.continueCard && (
            <section className="rounded-xl border border-border bg-surface-raised p-xl">
              <p className="mb-md font-body text-[10px] font-semibold uppercase tracking-widest text-primary">
                Continue learning
              </p>
              <h3 className="mb-lg font-display text-base font-semibold text-foreground leading-snug">
                {path.continueCard.title}
              </h3>
              <div className="relative mb-lg aspect-[4/3] overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken">
                <Image
                  src={path.continueCard.thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="18rem"
                />
              </div>
              <p className="mb-lg font-body text-xs text-foreground-muted">
                Lesson {path.continueCard.listIndex} ·{" "}
                {path.continueCard.estimatedMinutes} min · earns{" "}
                {path.continueCard.totalXp} XP
              </p>
              <Link
                href={`/lessons/${path.continueCard.slug}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-lg py-md font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover"
              >
                Start lesson
              </Link>
            </section>
          )}

          <section className="rounded-xl border border-border bg-surface-sunken/50 p-xl">
            <p className="mb-md font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
              Why this path?
            </p>
            <p className="font-body text-sm leading-relaxed text-foreground-secondary">
              {path.whyDescription}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
