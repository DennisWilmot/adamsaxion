"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.assign("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="font-body text-sm text-foreground-muted transition-colors hover:text-error"
    >
      Sign out
    </button>
  );
}
