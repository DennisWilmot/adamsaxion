import { LANDING_STATS } from "@/lib/landing/content";

export function LessonCarouselSkeleton() {
  return (
    <section
      id="curriculum"
      aria-busy="true"
      aria-label="Loading curriculum preview"
      className="relative overflow-hidden border-y border-border-subtle bg-surface-sunken pb-3xl pt-xl"
    >
      <p className="mb-xl text-center font-body text-sm text-foreground-secondary">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground-muted">
          From the curriculum
        </span>{" "}
        ({LANDING_STATS.lessonCount} lessons across {LANDING_STATS.phaseCount}{" "}
        phases)
      </p>

      <div className="overflow-hidden px-xl">
        <div className="flex gap-xl">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-[280px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface-raised"
            >
              <div className="h-40 animate-pulse bg-surface-sunken" />
              <div className="space-y-sm px-lg py-md pb-lg">
                <div className="h-3 w-24 animate-pulse rounded bg-surface-sunken" />
                <div className="h-4 w-full animate-pulse rounded bg-surface-sunken" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-surface-sunken" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-sunken" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
