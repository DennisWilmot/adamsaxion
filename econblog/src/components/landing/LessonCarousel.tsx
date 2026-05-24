"use client";

import Link from "next/link";
import { LANDING_STATS } from "@/lib/landing/content";
import { LandingImage } from "@/components/landing/LandingImage";
import type { LessonMeta } from "@/lib/types/lesson";

function LessonCard({
  lesson,
  index,
  priority,
}: {
  lesson: LessonMeta;
  index: number;
  priority?: boolean;
}) {
  const gateLabel =
    lesson.subsectionCount === 1
      ? "1 quiz gate"
      : `${lesson.subsectionCount} quiz gates`;

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="group w-[280px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface-raised transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden border-b border-border-subtle bg-surface-sunken">
        {lesson.thumbnail ? (
          <LandingImage
            src={lesson.thumbnail}
            alt=""
            fill
            sizes="280px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
        <p className="mb-xs font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
          {lesson.category}
        </p>
        <p className="mb-sm line-clamp-2 font-display text-[15px] font-medium leading-snug text-foreground">
          {lesson.title}
        </p>
        <p className="flex items-center gap-xs font-body text-[11px] text-foreground-muted">
          <span className="inline-block size-1 rounded-full bg-success" />
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
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface-sunken to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface-sunken to-transparent"
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
          className="flex w-max animate-landing-carousel gap-xl hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${Math.max(40, lessons.length * 3)}s`,
          }}
        >
          {items.map((lesson, index) => (
            <LessonCard
              key={`${lesson.id}-${index}`}
              lesson={lesson}
              index={index % lessons.length}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
