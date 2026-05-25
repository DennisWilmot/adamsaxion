"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PathLessonListItem } from "@/lib/learning/user-dashboard";

const STEPS_PER_PAGE = 6;

interface PathStepperProps {
  lessons: PathLessonListItem[];
}

function stepVisual(state: PathLessonListItem["state"]) {
  switch (state) {
    case "completed":
      return {
        node: "border-primary bg-primary text-surface-raised",
        ring: "",
        label: "text-foreground-secondary",
      };
    case "in_progress":
      return {
        node: "border-primary bg-primary text-surface-raised",
        ring: "ring-4 ring-primary/20",
        label: "text-primary font-medium",
      };
    case "locked":
      return {
        node: "border-border bg-surface-sunken text-foreground-muted",
        ring: "",
        label: "text-foreground-muted",
      };
    default:
      return {
        node: "border-primary bg-surface-raised text-primary",
        ring: "",
        label: "text-foreground-secondary",
      };
  }
}

export function PathStepper({ lessons }: PathStepperProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(lessons.length / STEPS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * STEPS_PER_PAGE;
  const pageLessons = lessons.slice(pageStart, pageStart + STEPS_PER_PAGE);

  useEffect(() => {
    const activeIdx = lessons.findIndex((l) => l.state === "in_progress");
    if (activeIdx >= 0) {
      setPage(Math.floor(activeIdx / STEPS_PER_PAGE));
    }
  }, [lessons]);

  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div
        ref={scrollerRef}
        className="overflow-x-auto pb-sm [scrollbar-width:thin]"
      >
        <ol className="relative mx-auto flex min-w-min items-start justify-center px-sm pt-sm">
          {pageLessons.map((lesson, index) => {
            const visual = stepVisual(lesson.state);
            const globalIndex = pageStart + index;
            const segmentComplete =
              lesson.state === "completed" ||
              (globalIndex > 0 &&
                lessons[globalIndex - 1]?.state === "completed");
            const isClickable =
              lesson.slug &&
              lesson.state !== "locked" &&
              lesson.state !== "coming_soon";

            const node = (
              <div className="flex w-[4.5rem] shrink-0 flex-col items-center sm:w-[5.5rem]">
                <div className="relative flex size-9 items-center justify-center">
                  {index < pageLessons.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-1/2 top-1/2 z-0 h-0.5 w-[4.5rem] -translate-y-1/2 sm:w-[5.5rem]",
                        segmentComplete ? "bg-primary" : "bg-border"
                      )}
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex size-9 items-center justify-center rounded-full border-2 font-body text-xs font-bold tabular-nums",
                      visual.node,
                      visual.ring
                    )}
                  >
                    {lesson.state === "completed" ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : lesson.state === "locked" ? (
                      <Lock className="size-3.5" />
                    ) : (
                      lesson.listIndex
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <li key={lesson.corpusId} className="list-none">
                {isClickable ? (
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="block rounded-lg py-xs transition-colors hover:bg-surface-sunken/80"
                    title={lesson.title}
                  >
                    {node}
                  </Link>
                ) : (
                  node
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {totalPages > 1 && (
        <div className="mt-sm flex items-center justify-center gap-md">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-surface-sunken disabled:opacity-40"
            aria-label="Previous steps"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-body text-xs text-foreground-muted tabular-nums">
            {pageStart + 1}–
            {Math.min(pageStart + STEPS_PER_PAGE, lessons.length)} of{" "}
            {lessons.length}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-surface-sunken disabled:opacity-40"
            aria-label="Next steps"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
