/**
 * Price War seed script — staging/local only.
 * Creates test profiles + subscriptions per PRICE_WAR_EXECUTION_PLAN.md §13.
 *
 * Usage: pnpm -F @adamsaxion/econblog seed:pricewar
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import * as schema from "../src/db/schema";

export const TEST_USERS = [
  {
    id: "11111111-1111-4111-8111-111111111001",
    email: "alice+test@adamsaxion.dev",
    password: "TestAlice123!",
    username: "alice_test",
    tier: "free" as const,
  },
  {
    id: "11111111-1111-4111-8111-111111111002",
    email: "bob+test@adamsaxion.dev",
    password: "TestBob123!",
    username: "bob_test",
    tier: "free" as const,
  },
  {
    id: "11111111-1111-4111-8111-111111111003",
    email: "carol+test@adamsaxion.dev",
    password: "TestCarol123!",
    username: "carol_test",
    tier: "paid" as const,
  },
  {
    id: "11111111-1111-4111-8111-111111111004",
    email: "dan+test@adamsaxion.dev",
    password: "TestDan123!",
    username: "dan_test",
    tier: "paid" as const,
  },
  {
    id: "11111111-1111-4111-8111-111111111005",
    email: "admin+test@adamsaxion.dev",
    password: "TestAdmin123!",
    username: "admin_test",
    tier: "paid" as const,
  },
];

async function seedAuthUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn(
      "Skipping Supabase auth seed (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)."
    );
    return;
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of TEST_USERS) {
    const { data: existing } = await admin.auth.admin.getUserById(user.id);
    if (existing?.user) {
      await admin.auth.admin.updateUserById(user.id, {
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      console.log(`Auth user exists, updated: ${user.email}`);
      continue;
    }

    const { error } = await admin.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error) {
      console.warn(`Auth create failed for ${user.email}: ${error.message}`);
    } else {
      console.log(`Created auth user: ${user.email}`);
    }
  }
}

async function seedProfiles(db: ReturnType<typeof drizzle>) {
  for (const user of TEST_USERS) {
    await db
      .insert(schema.profiles)
      .values({
        id: user.id,
        username: user.username,
        totalXp: 0,
        currentLevel: 1,
      })
      .onConflictDoUpdate({
        target: schema.profiles.id,
        set: { username: user.username, updatedAt: new Date() },
      });

    if (user.tier === "paid") {
      await db
        .insert(schema.subscriptions)
        .values({
          userId: user.id,
          plan: "lifetime",
          status: "active",
          stripeCustomerId: `seed_${user.username}`,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: {
            plan: "lifetime",
            status: "active",
            updatedAt: new Date(),
          },
        });
    } else {
      await db.delete(schema.subscriptions).where(eq(schema.subscriptions.userId, user.id));
    }

    console.log(`Profile seeded: ${user.username} (${user.tier})`);
  }
}

function isSeedAllowed(dbUrl: string): boolean {
  if (process.env.PRICEWAR_SEED_ALLOW === "true") return true;
  return (
    dbUrl.includes("localhost") ||
    dbUrl.includes("127.0.0.1") ||
    dbUrl.includes("staging") ||
    dbUrl.includes("supabase.com")
  );
}

async function main() {
  const dbUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  if (!isSeedAllowed(dbUrl)) {
    console.error(
      "Refusing to seed: set PRICEWAR_SEED_ALLOW=true or use localhost/staging Supabase."
    );
    process.exit(1);
  }

  if (!dbUrl) {
    console.error("DIRECT_URL or DATABASE_URL required.");
    process.exit(1);
  }

  await seedAuthUsers();

  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });

  await seedProfiles(db);

  await client.end();
  console.log("Price War seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
