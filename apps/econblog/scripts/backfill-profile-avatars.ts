import "dotenv/config";
import { isNull, or, eq } from "drizzle-orm";
import { db } from "../src/db";
import { profiles } from "../src/db/schema";
import { buildGeneratedAvatarPath } from "../src/lib/avatars/generate";

async function main() {
  const rows = await db
    .select({ id: profiles.id, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(or(isNull(profiles.avatarUrl), eq(profiles.avatarUrl, "")));

  if (rows.length === 0) {
    console.log("All profiles already have avatars.");
    return;
  }

  console.log(`Backfilling ${rows.length} profile avatar(s)...`);

  for (const row of rows) {
    const avatarUrl = buildGeneratedAvatarPath(row.id);
    await db
      .update(profiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(profiles.id, row.id));
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
