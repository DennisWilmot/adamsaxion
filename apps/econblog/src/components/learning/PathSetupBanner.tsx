"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

interface PathSetupBannerProps {
  onSetup: () => void;
}

export function PathSetupBanner({ onSetup }: PathSetupBannerProps) {
  return (
    <div className="mb-2xl flex flex-col sm:flex-row sm:items-center gap-md rounded-lg border border-primary/25 bg-primary-subtle/40 px-xl py-lg">
      <Compass className="size-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="font-body text-sm font-semibold text-foreground">
          Finish path setup (~2 min)
        </p>
        <p className="font-body text-xs text-foreground-secondary mt-xs">
          Tell us what you want to learn and we&apos;ll order your curriculum.
        </p>
      </div>
      <button
        type="button"
        onClick={onSetup}
        className="shrink-0 rounded-lg px-lg py-sm font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover"
      >
        Set up path
      </button>
      <Link
        href="/profile"
        className="shrink-0 font-body text-xs text-foreground-muted hover:text-primary sm:ml-0"
      >
        Profile
      </Link>
    </div>
  );
}
