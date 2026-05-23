import "dotenv/config";
import { testSerpApiConnection } from "../src/lib/serpapi";

async function main() {
  const result = await testSerpApiConnection();
  if (result.ok) {
    console.log("SerpAPI OK:", result.status);
    console.log(result.preview);
    return;
  }

  console.error("SerpAPI FAILED");
  if ("status" in result) console.error("HTTP", result.status);
  console.error(result.error);
  process.exit(1);
}

void main();
