export interface Rating {
  userId: string;
  scenarioId: string;
  playModeId: string;
  rating: number;
  ratingDeviation: number;
  gamesPlayed: number;
  highestRating: number;
  lastMatchAt: string | null;
}

export interface RatingDelta {
  before: number;
  after: number;
  delta: number;
  kFactor: number;
  opponentRatingBefore: number;
  reason: "win" | "loss" | "draw" | "timeout_forfeit" | "abandonment_forfeit";
}
