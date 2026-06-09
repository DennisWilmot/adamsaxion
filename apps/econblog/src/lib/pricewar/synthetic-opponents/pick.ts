import { SYNTHETIC_OPPONENTS } from "./pool";
import type { SyntheticOpponent } from "./types";

const ELO_BAND = 200;

/** Pick a synthetic opponent — skill-near player rating when rated, else random. */
export function pickSyntheticOpponent(args: {
  playerRating?: number | null;
}): SyntheticOpponent {
  const pool = SYNTHETIC_OPPONENTS;
  if (args.playerRating == null || !Number.isFinite(args.playerRating)) {
    return pool[Math.floor(Math.random() * pool.length)]!;
  }

  const target = args.playerRating;
  const inBand = pool.filter((o) => Math.abs(o.rating - target) <= ELO_BAND);
  const candidates =
    inBand.length > 0
      ? inBand
      : [...pool].sort(
          (a, b) => Math.abs(a.rating - target) - Math.abs(b.rating - target)
        ).slice(0, 8);

  return candidates[Math.floor(Math.random() * candidates.length)]!;
}
