import "dotenv/config";
import { asc } from "drizzle-orm";
import { db } from "../src/db";
import { lessons } from "../src/db/schema";

async function main() {
  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      status: lessons.status,
      createdAt: lessons.createdAt,
      sortOrder: lessons.sortOrder,
    })
    .from(lessons)
    .orderBy(asc(lessons.sortOrder), asc(lessons.createdAt));

  console.log(JSON.stringify(rows, null, 2));
  console.log("TOTAL:", rows.length);

  const byTitle = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.title.trim().toLowerCase();
    const group = byTitle.get(key) ?? [];
    group.push(row);
    byTitle.set(key, group);
  }

  const dupes = [...byTitle.entries()].filter(([, g]) => g.length > 1);
  if (dupes.length) {
    console.log("\n=== DUPLICATE TITLES ===");
    for (const [title, group] of dupes) {
      console.log(`\n"${title}" (${group.length}x)`);
      for (const row of group) {
        console.log(`  - ${row.id} | ${row.slug} | ${row.status} | ${row.createdAt.toISOString()}`);
      }
    }
  }
}

void main();
