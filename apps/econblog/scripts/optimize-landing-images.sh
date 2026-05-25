#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required (brew install webp)" >&2
  exit 1
fi

optimize() {
  local file="$1"
  local width="$2"
  local out="${file%.png}.webp"
  cwebp -q 82 -resize "$width" 0 "$file" -o "$out"
  echo "  ${out} ($(du -h "$out" | cut -f1))"
}

echo "Optimizing audience images (640px)..."
for f in public/audience/*.png; do
  [ -f "$f" ] || continue
  optimize "$f" 640
done

echo "Optimizing how-it-works images (800px)..."
for f in public/how-it-works/*.png; do
  [ -f "$f" ] || continue
  optimize "$f" 800
done

echo "Optimizing thumbnails (560px)..."
for f in public/thumbnails/*.png; do
  [ -f "$f" ] || continue
  optimize "$f" 560
done

echo "Done."
