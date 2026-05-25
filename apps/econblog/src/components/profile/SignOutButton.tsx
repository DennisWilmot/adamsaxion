"use client";

import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  variant?: "text" | "outline";
}

export function SignOutButton({ variant = "text" }: SignOutButtonProps) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.assign("/");
  }

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-error/40 px-xl py-md font-body text-sm font-medium text-error transition-colors hover:bg-error-subtle"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="font-body text-sm text-foreground-muted transition-colors hover:text-error"
    >
      Sign out
    </button>
  );
}
