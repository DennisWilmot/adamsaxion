#!/usr/bin/env tsx
/**
 * Replay a match from DB submissions and compare to stored result.
 * Usage: pnpm -F @adamsaxion/econblog pricewar:replay <matchId>
 */
import "dotenv/config";
import type { MatchId } from "@adamsaxion/pricewar-types";
import { reResolveAdminMatch } from "../src/server/pricewar/admin-repository";

async function main() {
  const matchId = process.argv[2];
  if (!matchId) {
    console.error("Usage: pnpm pricewar:replay <matchId>");
    process.exit(1);
  }

  const result = await reResolveAdminMatch(matchId as MatchId);
  if (!result) {
    console.error("Match not found:", matchId);
    process.exit(1);
  }

  console.log(`Match: ${result.matchId}`);
  console.log(`Stored engine: ${result.storedEngineVersion}`);
  console.log(`Replay engine:  ${result.currentEngineVersion}`);
  console.log(`Replayed outcome:`, result.replayedOutcome);
  console.log(`Replayed cash:`, result.replayedCash);

  if (result.matches) {
    console.log("\n✓ Replay matches stored result (no diffs)");
    process.exit(0);
  }

  console.log("\n✗ Diffs found:");
  for (const line of result.diffs) {
    console.log(" ", line);
  }
  process.exit(result.diffs.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
