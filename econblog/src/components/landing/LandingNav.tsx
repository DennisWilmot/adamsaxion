"use client";

import Link from "next/link";
import { LANDING_NAV } from "@/lib/landing/content";
import { lessonZeroPath } from "@/lib/constants/lessons";

export function LandingNav() {
  return (
    <nav
      aria-label="Landing page sections"
      className="sticky top-14 z-40 border-b border-border-subtle bg-surface/90 backdrop-blur-lg"
    >
      <div className="max-w-[72rem] mx-auto px-xl flex items-center justify-between h-11 gap-lg">
        <div className="flex items-center gap-xl overflow-x-auto scrollbar-none">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 font-body text-xs font-medium tracking-wide text-foreground-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
        <Link
          href={lessonZeroPath()}
          className="shrink-0 font-body text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Start free →
        </Link>
      </div>
    </nav>
  );
}
