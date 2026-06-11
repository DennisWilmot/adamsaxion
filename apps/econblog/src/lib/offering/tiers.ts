import { MARGIN_BETA_PHRASE } from "@/lib/games/margin-branding";

/**
 * Free vs member offering — user-facing bullets and tier labels.
 * Full matrix: apps/econblog/OFFERING_FREE_PAID.md
 *
 * Target member pricing: $14.99/mo, $79–89/yr (future), $129–149 lifetime.
 * Stripe PLAN_PRICES may lag until Price IDs are updated in Dashboard + .env.
 */

export const OFFERING_TIER_LABELS = {
  free: "Free",
  member: "Member",
} as const;

/** Shown on landing pricing card (free column). */
export const OFFERING_FREE_INCLUDES = [
  "Daily Econ Wordle — play and share, no account",
  "One full interactive lesson to try the format",
  `Margin (${MARGIN_BETA_PHRASE}) tutorial and 15-minute practice games (coffee shop)`,
] as const;

/** Shown on landing + subscribe (member / monthly). */
export const OFFERING_MEMBER_INCLUDES = [
  "Full curriculum — every lesson, gate, and mastery exam",
  "Personalized learning path, XP, levels, and rankings",
  `All Margin (${MARGIN_BETA_PHRASE}) scenarios, Blitz mode, and ranked play when live`,
  "AI debrief after matches",
  "Play up to five matches at once",
] as const;

/** Lifetime plan extras (member includes everything above). */
export const OFFERING_LIFETIME_INCLUDES = [
  "Everything in Monthly",
  "One payment — keep access as we finish the library and games",
  "No recurring charges",
  "Best if you want the complete edition, not a monthly habit",
] as const;
