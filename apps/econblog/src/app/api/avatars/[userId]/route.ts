import { NextResponse } from "next/server";
import { fetchGeneratedAvatarSvg } from "@/lib/avatars/generate";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const svg = await fetchGeneratedAvatarSvg(userId);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/avatars/[userId] error:", error);
    return NextResponse.json({ error: "Could not generate avatar" }, { status: 502 });
  }
}
