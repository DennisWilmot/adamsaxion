import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserDashboard } from "@/lib/learning/user-dashboard";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await getUserDashboard(user.id);
  if (!dashboard) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ dashboard });
}
