import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/schema/content.ts", "./src/db/schema/pricewar.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public", "pricewar"],
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
});
