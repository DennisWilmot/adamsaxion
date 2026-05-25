import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Transaction pooler (DATABASE_URL) is fine for normal app queries.
// Avoid selecting large JSON blobs (sections, thumbnail data URLs) in list queries.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL!;

const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
