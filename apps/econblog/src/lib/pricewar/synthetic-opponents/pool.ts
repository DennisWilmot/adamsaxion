import { syntheticAvatarPath } from "./build-avatar-svg";
import type { SyntheticOpponent } from "./types";

const QUEUE_BOT_PERSONAS = [
  "bot.random",
  "bot.budget",
  "bot.aggressive",
  "bot.premium",
  "bot.efficient",
  "bot.adaptive",
  "bot.savant",
] as const;

const FIRST_NAMES = [
  "Maya",
  "James",
  "Sofia",
  "Noah",
  "Aisha",
  "Lucas",
  "Elena",
  "Marcus",
  "Priya",
  "Owen",
  "Camila",
  "Ethan",
  "Zara",
  "Leo",
  "Hannah",
  "Diego",
  "Nina",
  "Kai",
  "Amara",
  "Felix",
  "Rosa",
  "Theo",
  "Yuki",
  "Andre",
  "Chloe",
];

const LAST_NAMES = [
  "Chen",
  "Okonkwo",
  "Patel",
  "Rivera",
  "Kim",
  "Bauer",
  "Santos",
  "Nguyen",
  "Ali",
  "Fischer",
  "Diaz",
  "Park",
  "Morales",
  "Ibrahim",
  "Larsson",
  "Moreau",
  "Singh",
  "Costa",
  "Walsh",
  "Tanaka",
];

function buildDisplayName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]!;
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]!;
  return `${first} ${last}`;
}

/** Stable pool of 50 synthetic opponents (display names + ratings + engine personas). */
export const SYNTHETIC_OPPONENTS: SyntheticOpponent[] = Array.from({ length: 50 }, (_, i) => {
  const id = `syn-${String(i + 1).padStart(3, "0")}`;
  const tier = Math.floor(i / 10);
  const rating = 980 + tier * 120 + (i % 10) * 9 + (i % 3) * 4;

  return {
    id,
    displayName: buildDisplayName(i),
    rating,
    botPersonalityId: QUEUE_BOT_PERSONAS[i % QUEUE_BOT_PERSONAS.length]!,
    avatarUrl: syntheticAvatarPath(id),
  };
});

const BY_ID = new Map(SYNTHETIC_OPPONENTS.map((o) => [o.id, o]));

export function getSyntheticOpponent(id: string | null | undefined): SyntheticOpponent | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
