"use client";

import Link from "next/link";
import { LANDING_STATS } from "@/lib/landing/content";
import type { LessonMeta } from "@/lib/types/lesson";

function LessonCard({ lesson, index }: { lesson: LessonMeta; index: number }) {
  const gateLabel =
    lesson.subsectionCount === 1
      ? "1 quiz gate"
      : `${lesson.subsectionCount} quiz gates`;

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="group flex-shrink-0 w-[280px] bg-surface-raised rounded-xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden border-b border-border-subtle bg-surface-sunken">
        {lesson.thumbnail ? (
          <img
            src={lesson.thumbnail}
            alt={`${lesson.title} thumbnail`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-4xl text-foreground-muted/20">
            {String(index + 1).padStart(2, "0")}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>

      <div className="px-lg py-md pb-lg">
        <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted mb-xs">
          {lesson.category}
        </p>
        <p className="font-display text-[15px] font-medium text-foreground leading-snug mb-sm line-clamp-2">
          {lesson.title}
        </p>
        <p className="font-body text-[11px] text-foreground-muted flex items-center gap-xs">
          <span className="inline-block w-1 h-1 rounded-full bg-success" />
          {gateLabel}
        </p>
      </div>
    </Link>
  );
}

interface LessonCarouselProps {
  lessons: LessonMeta[];
}

export function LessonCarousel({ lessons }: LessonCarouselProps) {
  if (lessons.length === 0) {
    return null;
  }

  const items = [...lessons, ...lessons];

  return (
    <section
      id="curriculum"
      className="relative overflow-hidden border-y border-border-subtle bg-surface-sunken pb-3xl pt-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-surface-sunken to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-surface-sunken to-transparent"
      />

      <p className="mb-xl text-center font-body text-sm text-foreground-secondary">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground-muted">
          From the curriculum
        </span>{" "}
        ({LANDING_STATS.lessonCount} lessons across {LANDING_STATS.phaseCount}{" "}
        phases)
      </p>

      <div className="overflow-hidden">
        <div
          className="flex gap-xl w-max animate-landing-carousel hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${Math.max(40, lessons.length * 3)}s`,
          }}
        >
          {items.map((lesson, index) => (
            <LessonCard
              key={`${lesson.id}-${index}`}
              lesson={lesson}
              index={index % lessons.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
