import { ECON_WORDLE, MARGIN_GAME_NAME, priceWarPaths } from "@/lib/games/routes";

export type PlayCatalogGame = {
  id: "econ-wordle" | "price-war";
  title: string;
  description: string;
  href: string;
  status: "live";
  cta: string;
  thumbnail: string;
  thumbnailAlt: string;
};

/** Shared game cards for /play and landing — single source for thumbnails. */
export const PLAY_CATALOG_GAMES: PlayCatalogGame[] = [
  {
    id: "econ-wordle",
    title: "Econ Wordle",
    description:
      "Guess the daily economics term in six tries. A quick, free puzzle — and every word links to the lesson that teaches it.",
    href: ECON_WORDLE,
    status: "live",
    cta: "Play today's puzzle",
    thumbnail: "/games/econ-wordle-thumbnail.png",
    thumbnailAlt: "Econ Wordle daily puzzle grid with letter tiles",
  },
  {
    id: "price-war",
    title: MARGIN_GAME_NAME,
    description:
      "Turn-based economics strategy. Protect your margins — pick moves across sales, marketing, and operations to outmaneuver your opponent.",
    href: priceWarPaths.lobby,
    status: "live",
    cta: "Play",
    thumbnail: "/games/margin-thumbnail.png",
    thumbnailAlt: "Margin strategy game — rival coffee shops facing off",
  },
];

const PLAY_CATALOG_BY_ID = Object.fromEntries(
  PLAY_CATALOG_GAMES.map((game) => [game.id, game])
) as Record<PlayCatalogGame["id"], PlayCatalogGame>;

export function getPlayCatalogGame(id: PlayCatalogGame["id"]): PlayCatalogGame {
  const game = PLAY_CATALOG_BY_ID[id];
  if (!game) {
    throw new Error(`Unknown play catalog game: ${id}`);
  }
  return game;
}
