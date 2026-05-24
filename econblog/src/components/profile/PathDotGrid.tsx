"use client";

import { cn } from "@/lib/utils";
import type { PathLessonListItem } from "@/lib/learning/user-dashboard";

interface PathDotGridProps {
  lessons: PathLessonListItem[];
}

function dotClass(state: PathLessonListItem["state"]) {
  switch (state) {
    case "completed":
      return "bg-success";
    case "in_progress":
      return "bg-primary";
    case "locked":
      return "bg-border";
    default:
      return "bg-surface-sunken border border-border-subtle";
  }
}

export function PathDotGrid({ lessons }: PathDotGridProps) {
  if (lessons.length === 0) {
    return (
      <p className="font-body text-sm text-foreground-muted">
        No lessons in your path yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-xs">
      {lessons.map((lesson) => (
        <span
          key={lesson.corpusId}
          title={`${lesson.listIndex}. ${lesson.title}`}
          className={cn("size-3 shrink-0 rounded-sm", dotClass(lesson.state))}
        />
      ))}
    </div>
  );
}
