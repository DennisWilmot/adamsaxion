"use client";

interface ProfileHeaderProps {
  username: string;
  email: string;
  totalXp: number;
  currentLevel: number;
  xpToNext: number;
  levelProgress: number;
}

export function ProfileHeader({
  username,
  email,
  totalXp,
  currentLevel,
  xpToNext,
  levelProgress,
}: ProfileHeaderProps) {
  return (
    <div className="mb-2xl space-y-xl">
      <div className="flex flex-wrap items-start justify-between gap-xl">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {username}
          </h1>
          <p className="font-body text-sm text-foreground-muted">{email}</p>
        </div>

        <div className="flex gap-md">
          <StatPill value={totalXp.toLocaleString()} label="Total XP" />
          <StatPill value={String(currentLevel)} label="Level" accent="primary" />
          <StatPill value={xpToNext.toLocaleString()} label="XP to next" />
        </div>
      </div>

      <div>
        <div className="mb-sm flex justify-between font-body text-xs text-foreground-muted">
          <span>Level {currentLevel}</span>
          <span>Level {currentLevel + 1}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-border bg-surface-sunken">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: "primary";
}) {
  return (
    <div className="min-w-[5.5rem] rounded-lg border border-border bg-surface-raised px-md py-sm text-center">
      <p
        className={`font-display text-xl font-semibold tabular-nums ${
          accent === "primary" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </p>
    </div>
  );
}
