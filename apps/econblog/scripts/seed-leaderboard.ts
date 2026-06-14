import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { LEADERBOARD_SEED_USERS } from "../src/lib/leaderboard/seed-users";

async function seedLeaderboard() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DIRECT_URL or DATABASE_URL required");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log("Replacing leaderboard seeds...");

  await db.delete(schema.leaderboardSeeds).where(eq(schema.leaderboardSeeds.isSeeded, true));

  for (const user of LEADERBOARD_SEED_USERS) {
    await db.insert(schema.leaderboardSeeds).values({
      username: user.username,
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      isSeeded: true,
    });
  }

  console.log(`Seeded ${LEADERBOARD_SEED_USERS.length} leaderboard users`);
  console.log(
    `  ${LEADERBOARD_SEED_USERS.filter((u) => u.username.includes(" ")).length} from Margin opponents`
  );
  console.log(
    `  ${LEADERBOARD_SEED_USERS.filter((u) => !u.username.includes(" ")).length} realistic handles`
  );

  await client.end();
  console.log("Done.");
}

seedLeaderboard().catch((error) => {
  console.error("Leaderboard seed failed:", error);
  process.exit(1);
});
