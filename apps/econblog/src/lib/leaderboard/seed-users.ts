import { SYNTHETIC_OPPONENTS } from "@/lib/pricewar/synthetic-opponents";

export interface LeaderboardSeedUser {
  username: string;
  totalXp: number;
  currentLevel: number;
}

/** XP tiers for seeded leaderboard rows (high → low). */
const XP_TIERS = [
  14320, 12850, 11200, 10750, 9800, 9450, 8900, 8200, 7650, 7100, 6800, 6350,
  5900, 5500, 5100, 4700, 4300, 3900, 3500, 3200, 2800, 2500, 2200, 1900, 1650,
  1400, 1200, 950, 720, 500, 350, 200, 150, 80, 30,
] as const;

const LEVELS = [
  14, 12, 11, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
] as const;

/** One name per first-name slot, alternating Chen / Okonkwo last names from the pool. */
const MARGIN_OPPONENT_INDICES = [
  0, 25, 5, 30, 10, 35, 15, 40, 20, 45, 3, 28, 8, 33, 13, 38, 18,
] as const;

/** Margin synthetic opponent display names drawn from the matchmaking pool. */
const MARGIN_LEADERBOARD_NAMES = MARGIN_OPPONENT_INDICES.map(
  (index) => SYNTHETIC_OPPONENTS[index]!.displayName
);

/** Handle-style usernames for the rest of the board. */
const REALISTIC_USERNAMES = [
  "maria_torres",
  "bencho98",
  "sarahlearns",
  "jchen.micro",
  "rivera_a",
  "fiona_wu",
  "ed_hargrove",
  "priyanka_s",
  "moconnell",
  "tariq_khan",
  "annaquinn",
  "devonjames",
  "mayachang",
  "eleanor_park",
  "carlos_mendez",
  "danwilson",
  "jordanlee",
  "linzhou",
] as const;

function buildLeaderboardSeedUsers(): LeaderboardSeedUser[] {
  const count = XP_TIERS.length;
  const marginCount = MARGIN_LEADERBOARD_NAMES.length;
  const realisticCount = count - marginCount;

  if (realisticCount > REALISTIC_USERNAMES.length) {
    throw new Error("Not enough realistic usernames for leaderboard seeds");
  }

  const names = [
    ...MARGIN_LEADERBOARD_NAMES,
    ...REALISTIC_USERNAMES.slice(0, realisticCount),
  ];

  return names.map((username, index) => ({
    username,
    totalXp: XP_TIERS[index]!,
    currentLevel: LEVELS[index]!,
  }));
}

export const LEADERBOARD_SEED_USERS = buildLeaderboardSeedUsers();
