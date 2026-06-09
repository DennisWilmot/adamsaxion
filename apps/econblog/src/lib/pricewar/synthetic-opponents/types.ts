export type SyntheticOpponent = {
  id: string;
  displayName: string;
  /** Display Elo for ranked synthetic matches (coffee shop / rapid). */
  rating: number;
  botPersonalityId: string;
  avatarUrl: string;
};
