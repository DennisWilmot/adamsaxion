/** Warm parchment tones that fit Margin / econblog palette. */
const AVATAR_BACKGROUNDS = "e8dcc8,d4c4a8,c9b896,dbc9ad";

/** Stable same-origin path stored on the profile row. */
export function buildGeneratedAvatarPath(userId: string): string {
  return `/api/avatars/${userId}`;
}

export async function fetchGeneratedAvatarSvg(userId: string): Promise<string> {
  const params = new URLSearchParams({
    seed: userId,
    backgroundColor: AVATAR_BACKGROUNDS,
  });
  const res = await fetch(
    `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`,
    { next: { revalidate: 60 * 60 * 24 * 365 } }
  );

  if (!res.ok) {
    throw new Error(`Avatar generation failed (${res.status})`);
  }

  return res.text();
}
