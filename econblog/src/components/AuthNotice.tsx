"use client";

import { useSearchParams } from "next/navigation";

export function AuthNotice() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next");

  if (error === "admin_forbidden") {
    return (
      <div className="bg-error/10 border-b border-error/20 px-xl py-md text-center">
        <p className="font-body text-sm text-error">
          Admin access denied. Sign in with an authorized admin Google account.
        </p>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="bg-error/10 border-b border-error/20 px-xl py-md text-center">
        <p className="font-body text-sm text-error">
          Sign in failed. Please try again.
        </p>
      </div>
    );
  }

  if (error === "confirm_email") {
    return (
      <div className="bg-primary/10 border-b border-primary/20 px-xl py-md text-center">
        <p className="font-body text-sm text-foreground">
          Check your email to confirm your account, then sign in.
        </p>
      </div>
    );
  }

  if (next?.startsWith("/admin")) {
    return (
      <div className="bg-primary/10 border-b border-primary/20 px-xl py-md text-center">
        <p className="font-body text-sm text-foreground">
          Sign in to access the admin panel.
        </p>
      </div>
    );
  }

  if (next) {
    return (
      <div className="bg-primary/10 border-b border-primary/20 px-xl py-md text-center">
        <p className="font-body text-sm text-foreground">
          Sign in to continue where you left off.
        </p>
      </div>
    );
  }

  return null;
}
