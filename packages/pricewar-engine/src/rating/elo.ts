export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function kFactor(gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;
  if (gamesPlayed <= 100) return 32;
  return 20;
}

export function computeRatingDelta(args: {
  rating: number;
  opponentRating: number;
  gamesPlayed: number;
  score: 0 | 0.5 | 1;
  reducedK?: boolean;
}): number {
  const k = (args.reducedK ? 0.5 : 1) * kFactor(args.gamesPlayed);
  const expected = expectedScore(args.rating, args.opponentRating);
  return Math.round(k * (args.score - expected));
}

export function applyRatingDelta(rating: number, delta: number): number {
  return Math.max(100, rating + delta);
}
