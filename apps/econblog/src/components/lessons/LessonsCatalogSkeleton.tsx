export function LessonsCatalogSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading lessons catalog"
      className="mx-auto max-w-[72rem] animate-pulse px-xl py-3xl"
    >
      <div className="relative mb-2xl overflow-hidden rounded-xl bg-surface-sunken p-xl">
        <div className="space-y-sm">
          <div className="h-9 w-40 rounded bg-surface-raised/70" />
          <div className="h-5 w-full max-w-lg rounded bg-surface-raised/70" />
          <div className="h-5 w-4/5 max-w-md rounded bg-surface-raised/70" />
        </div>
      </div>

      <div className="mb-2xl flex flex-col gap-md sm:flex-row">
        <div className="h-10 max-w-md flex-1 rounded-lg bg-surface-sunken" />
        <div className="flex gap-xs">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 w-24 rounded-md bg-surface-sunken" />
          ))}
        </div>
        <div className="h-10 w-32 rounded-lg bg-surface-sunken" />
      </div>

      <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-surface-raised"
          >
            <div className="h-44 bg-surface-sunken" />
            <div className="space-y-sm p-xl">
              <div className="h-3 w-40 rounded bg-surface-sunken" />
              <div className="h-5 w-full rounded bg-surface-sunken" />
              <div className="h-5 w-4/5 rounded bg-surface-sunken" />
              <div className="h-4 w-full rounded bg-surface-sunken" />
              <div className="h-4 w-full rounded bg-surface-sunken" />
              <div className="h-4 w-3/5 rounded bg-surface-sunken" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
