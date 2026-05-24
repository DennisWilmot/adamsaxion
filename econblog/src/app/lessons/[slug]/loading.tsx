export default function LessonLoading() {
  return (
    <div className="mx-auto max-w-[72rem] animate-pulse px-xl py-3xl">
      <div className="mb-xl flex items-center justify-between gap-lg">
        <div className="h-8 w-64 rounded bg-surface-sunken" />
        <div className="h-9 w-28 rounded bg-surface-sunken" />
      </div>

      <div className="grid gap-2xl lg:grid-cols-[16rem_1fr]">
        <div className="space-y-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-sunken" />
          ))}
        </div>

        <div className="space-y-lg rounded-xl border border-border-subtle p-xl">
          <div className="h-6 w-48 rounded bg-surface-sunken" />
          <div className="space-y-sm">
            <div className="h-4 w-full rounded bg-surface-sunken" />
            <div className="h-4 w-full rounded bg-surface-sunken" />
            <div className="h-4 w-5/6 rounded bg-surface-sunken" />
            <div className="h-4 w-full rounded bg-surface-sunken" />
            <div className="h-4 w-4/6 rounded bg-surface-sunken" />
          </div>
        </div>
      </div>
    </div>
  );
}
