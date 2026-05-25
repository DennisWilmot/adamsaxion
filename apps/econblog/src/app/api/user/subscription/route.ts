import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionView } from "@/lib/subscription/service";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscriptionView(user.id, user.email);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("GET /api/user/subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
