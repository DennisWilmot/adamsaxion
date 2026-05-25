"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

interface SubscribePromptProps {
  message?: string;
}

export function SubscribePrompt({
  message = "Subscribe to unlock quizzes, the full lesson, and the mastery exam.",
}: SubscribePromptProps) {
  const pathname = usePathname();
  const href = `/subscribe?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary-subtle/30 p-lg text-center">
      <Lock className="mx-auto mb-sm size-5 text-primary" />
      <p className="font-body text-sm text-foreground-secondary mb-md">{message}</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-lg py-sm font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
      >
        View subscription plans
      </Link>
    </div>
  );
}
