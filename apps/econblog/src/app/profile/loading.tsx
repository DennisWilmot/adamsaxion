export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-[72rem] animate-pulse px-xl py-3xl">
      <div className="mb-2xl flex flex-wrap items-start justify-between gap-xl">
        <div className="space-y-sm">
          <div className="h-7 w-40 rounded bg-surface-sunken" />
          <div className="h-4 w-52 rounded bg-surface-sunken" />
        </div>
        <div className="flex gap-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 w-20 rounded-lg bg-surface-sunken" />
          ))}
        </div>
      </div>

      <div className="mb-3xl h-2 rounded-full bg-surface-sunken" />

      <div className="mb-3xl overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-4 bg-surface-sunken">
          {["path", "progress", "subscription", "personal"].map((id, i) => (
            <div
              key={id}
              className={
                i === 0
                  ? "h-11 bg-surface-raised"
                  : "h-11 shadow-[-1px_0_0_0_var(--color-border)]"
              }
            />
          ))}
        </div>
        <div className="space-y-xl bg-surface-raised p-2xl">
          <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-surface-sunken" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-surface-sunken" />
        </div>
      </div>
    </div>
  );
}
