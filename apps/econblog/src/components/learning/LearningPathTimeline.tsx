"use client";

import Link from "next/link";
import type { PathTimelineItem } from "@/lib/learning/user-dashboard";

interface LearningPathTimelineProps {
  items: PathTimelineItem[];
}

function nodeStyles(state: PathTimelineItem["state"]) {
  switch (state) {
    case "current":
      return "border-primary bg-primary ring-4 ring-primary/25 size-7 text-surface-raised";
    case "completed":
      return "border-success bg-success size-7 text-surface-raised";
    case "upcoming":
      return "border-border bg-surface-raised size-7 text-foreground-secondary";
    case "coming_soon":
      return "border-border-subtle bg-surface-sunken size-7 text-foreground-muted opacity-60";
  }
}

function stateLabel(state: PathTimelineItem["state"]) {
  switch (state) {
    case "current":
      return "Continue";
    case "completed":
      return "Done";
    case "coming_soon":
      return "Soon";
    default:
      return null;
  }
}

export function LearningPathTimeline({ items }: LearningPathTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="font-body text-sm text-foreground-muted">
        Complete path setup to see your curriculum order.
      </p>
    );
  }

  const current = items.find((i) => i.state === "current");

  return (
    <div className="space-y-lg">
      {current?.slug && (
        <Link
          href={`/lessons/${current.slug}`}
          className="block rounded-lg border border-primary/35 bg-primary-subtle/40 px-xl py-lg hover:border-primary/55 transition-colors"
        >
          <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-primary mb-xs">
            Up next on your path
          </p>
          <p className="font-display font-semibold text-base text-foreground leading-snug">
            {current.title}
          </p>
        </Link>
      )}

      <div className="-mx-xl px-xl overflow-x-auto pb-sm">
        <div className="relative inline-flex min-w-full items-start pt-2 pb-4">
          {/* Horizontal spine */}
          <div
            className="absolute left-6 right-6 top-[14px] h-px bg-border"
            aria-hidden
          />

          <ol className="relative flex items-start gap-0">
            {items.map((item, index) => {
              const label = stateLabel(item.state);
              const isClickable =
                item.slug != null && item.state !== "coming_soon";

              const card = (
                <div
                  className={`flex w-[10.5rem] shrink-0 flex-col items-center px-sm ${
                    index === 0 ? "pl-0" : ""
                  } ${index === items.length - 1 ? "pr-0" : ""}`}
                >
                  <div
                    className={`relative z-10 flex items-center justify-center rounded-full border-2 font-body text-xs font-bold tabular-nums ${nodeStyles(item.state)}`}
                    aria-label={`Step ${index + 1}${item.state === "completed" ? ", completed" : ""}`}
                  >
                    {index + 1}
                  </div>

                  {label && (
                    <p
                      className={`mt-md font-body text-[10px] font-semibold uppercase tracking-wider ${
                        item.state === "current"
                          ? "text-primary"
                          : item.state === "completed"
                          ? "text-success"
                          : "text-foreground-muted"
                      }`}
                    >
                      {label}
                    </p>
                  )}
                  {!label && <div className="mt-md h-[14px]" />}

                  <p
                    className={`mt-sm text-center font-body text-xs leading-snug line-clamp-3 ${
                      item.state === "current"
                        ? "font-medium text-foreground"
                        : item.state === "coming_soon"
                        ? "text-foreground-muted"
                        : "text-foreground-secondary"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              );

              return (
                <li key={item.corpusId} className="list-none">
                  {isClickable ? (
                    <Link
                      href={`/lessons/${item.slug}`}
                      className="block rounded-lg transition-colors hover:bg-surface-sunken/80 py-xs"
                    >
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <p className="font-body text-[11px] text-foreground-muted">
        Scroll to see more of your path →
      </p>
    </div>
  );
}
