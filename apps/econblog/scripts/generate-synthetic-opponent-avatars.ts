import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSyntheticAvatarSvg } from "../src/lib/pricewar/synthetic-opponents/build-avatar-svg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/pricewar/synthetic-avatars");

fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < 50; i++) {
  const id = `syn-${String(i + 1).padStart(3, "0")}`;
  const svg = buildSyntheticAvatarSvg(i);
  fs.writeFileSync(path.join(outDir, `${id}.svg`), svg, "utf8");
}

console.log(`Wrote 50 synthetic opponent avatars to ${outDir}`);
