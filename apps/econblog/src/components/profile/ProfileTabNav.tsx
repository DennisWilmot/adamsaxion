"use client";

import { cn } from "@/lib/utils";

export type ProfileTabId = "personal" | "subscription" | "path" | "progress";

const TABS: { id: ProfileTabId; label: string }[] = [
  { id: "path", label: "My Path" },
  { id: "progress", label: "Progress" },
  { id: "subscription", label: "Subscription" },
  { id: "personal", label: "Personal" },
];

interface ProfileTabNavProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  pathBadge?: string;
  children: React.ReactNode;
}

export function ProfileTabNav({
  activeTab,
  onTabChange,
  pathBadge,
  children,
}: ProfileTabNavProps) {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="mb-3xl min-w-0 overflow-hidden rounded-xl border border-border bg-surface-raised">
      <nav
        className="grid w-full grid-cols-4"
        aria-label="Profile sections"
      >
        {TABS.map(({ id, label }, index) => {
          const active = activeTab === id;
          const leftNeighborActive = activeIndex === index - 1;
          const showDivider = index > 0 && !active && !leftNeighborActive;
          const tabLabel =
            id === "path" && pathBadge ? `${label} ${pathBadge}` : label;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                "relative flex min-h-[2.75rem] w-full min-w-0 items-center justify-center px-sm py-md font-body text-sm font-medium transition-colors",
                showDivider && "shadow-[-1px_0_0_0_var(--color-border)]",
                active
                  ? "bg-surface-raised text-foreground"
                  : "bg-surface-sunken text-foreground-muted hover:bg-surface hover:text-foreground"
              )}
            >
              <span className="block max-w-full truncate text-center">
                {tabLabel}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 p-xl lg:p-2xl">{children}</div>
    </div>
  );
}
