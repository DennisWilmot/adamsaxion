export function ProfilePathSkeleton() {
  return (
    <div className="animate-pulse space-y-3xl">
      <div className="grid gap-2xl lg:grid-cols-[1fr_18rem]">
        <div className="space-y-2xl">
          <div className="h-72 rounded-xl border border-border bg-surface-sunken" />
          <div className="h-96 rounded-xl border border-border bg-surface-sunken" />
        </div>
        <div className="h-80 rounded-xl border border-border bg-surface-sunken" />
      </div>
    </div>
  );
}
