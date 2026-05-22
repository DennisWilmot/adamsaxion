"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authPageUrl } from "@/lib/auth/redirect";

interface SignInPromptProps {
  message?: string;
}

export function SignInPrompt({
  message = "Sign in to submit answers and track your progress.",
}: SignInPromptProps) {
  const pathname = usePathname();
  const signInHref = authPageUrl(pathname, "signin");
  const signUpHref = authPageUrl(pathname, "signup");

  return (
    <div className="rounded-lg bg-surface-sunken p-lg text-center">
      <p className="font-body text-sm text-foreground-secondary mb-md">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-sm">
        <Link
          href={signInHref}
          className="font-body text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Sign in
        </Link>
        <span className="hidden sm:inline text-foreground-muted">·</span>
        <Link
          href={signUpHref}
          className="font-body text-sm font-medium text-foreground-muted hover:text-foreground"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
