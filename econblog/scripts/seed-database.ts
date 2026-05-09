import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";

const SEED_USERS = [
  { username: "kwame_g", totalXp: 14320, currentLevel: 14 },
  { username: "sarah.t", totalXp: 12850, currentLevel: 12 },
  { username: "jchen_42", totalXp: 11200, currentLevel: 11 },
  { username: "aaliyah_m", totalXp: 10750, currentLevel: 10 },
  { username: "rbanks", totalXp: 9800, currentLevel: 9 },
  { username: "tomás.r", totalXp: 9450, currentLevel: 9 },
  { username: "fiona.w", totalXp: 8900, currentLevel: 8 },
  { username: "ed_h", totalXp: 8200, currentLevel: 8 },
  { username: "priyanka.s", totalXp: 7650, currentLevel: 7 },
  { username: "mike_o", totalXp: 7100, currentLevel: 7 },
  { username: "tariq.k", totalXp: 6800, currentLevel: 6 },
  { username: "anna_q", totalXp: 6350, currentLevel: 6 },
  { username: "devon.j", totalXp: 5900, currentLevel: 5 },
  { username: "maya_c", totalXp: 5500, currentLevel: 5 },
  { username: "izzy_g", totalXp: 5100, currentLevel: 5 },
  { username: "eleanor.p", totalXp: 4700, currentLevel: 4 },
  { username: "rick_99", totalXp: 4300, currentLevel: 4 },
  { username: "maxwellk", totalXp: 3900, currentLevel: 3 },
  { username: "carl_b", totalXp: 3500, currentLevel: 3 },
  { username: "sophia.n", totalXp: 3200, currentLevel: 3 },
  { username: "dan_w", totalXp: 2800, currentLevel: 2 },
  { username: "pat.f", totalXp: 2500, currentLevel: 2 },
  { username: "jordan_l", totalXp: 2200, currentLevel: 2 },
  { username: "tsuki.a", totalXp: 1900, currentLevel: 1 },
  { username: "sara_m", totalXp: 1650, currentLevel: 1 },
  { username: "obi.e", totalXp: 1400, currentLevel: 1 },
  { username: "chris.r", totalXp: 1200, currentLevel: 1 },
  { username: "ada_v", totalXp: 950, currentLevel: 1 },
  { username: "eve_k", totalXp: 720, currentLevel: 1 },
  { username: "pete.d", totalXp: 500, currentLevel: 1 },
  { username: "fred.o", totalXp: 350, currentLevel: 1 },
  { username: "nina_h", totalXp: 200, currentLevel: 1 },
  { username: "kofi.a", totalXp: 150, currentLevel: 1 },
  { username: "lin_z", totalXp: 80, currentLevel: 1 },
  { username: "newuser_01", totalXp: 30, currentLevel: 1 },
];

async function seed() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    console.error("DIRECT_URL not set in environment");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log("Seeding leaderboard with simulated users...");

  for (const user of SEED_USERS) {
    await db.insert(schema.leaderboardSeeds).values({
      username: user.username,
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      isSeeded: true,
    });
  }

  console.log(`Seeded ${SEED_USERS.length} leaderboard users`);

  await client.end();
  console.log("Done.");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
