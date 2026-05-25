import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin/auth";
import type { GameError } from "@adamsaxion/pricewar-types";

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: { code: "FORBIDDEN" as const, message: "Sign in required." } satisfies GameError,
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      error: { code: "FORBIDDEN" as const, message: "Access denied." } satisfies GameError,
    };
  }

  return { user };
}
