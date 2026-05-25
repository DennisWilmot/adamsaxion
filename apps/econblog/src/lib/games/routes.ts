/** Hub for all Adam's Axioms games */
export const PLAY_HUB = "/play";

/** The Price War — economics strategy duel */
export const PRICE_WAR = "/play/price-war";

export const priceWarPaths = {
  lobby: PRICE_WAR,
  history: `${PRICE_WAR}/history`,
  scenario: `${PRICE_WAR}/scenario`,
  leaderboard: `${PRICE_WAR}/leaderboard`,
  notifications: `${PRICE_WAR}/notifications`,
  tutorial: `${PRICE_WAR}/tutorial`,
  queue: (mode?: string) =>
    mode ? `${PRICE_WAR}/queue?mode=${encodeURIComponent(mode)}` : `${PRICE_WAR}/queue`,
  match: {
    briefing: (matchId: string) => `${PRICE_WAR}/match/${matchId}/briefing`,
    decide: (matchId: string) => `${PRICE_WAR}/match/${matchId}/decide`,
    review: (matchId: string) => `${PRICE_WAR}/match/${matchId}/review`,
    waiting: (matchId: string) => `${PRICE_WAR}/match/${matchId}/waiting`,
    postmatch: (matchId: string) => `${PRICE_WAR}/match/${matchId}/postmatch`,
    bankruptcy: (matchId: string) => `${PRICE_WAR}/match/${matchId}/bankruptcy`,
    abandoned: (matchId: string) => `${PRICE_WAR}/match/${matchId}/abandoned`,
    report: (matchId: string, round: number | string) =>
      `${PRICE_WAR}/match/${matchId}/report/${round}`,
  },
} as const;
