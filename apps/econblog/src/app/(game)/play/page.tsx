import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ECON_WORDLE, MARGIN_GAME_NAME, priceWarPaths } from "@/lib/games/routes";

const GAMES = [
  {
    id: "econ-wordle",
    title: "Econ Wordle",
    description:
      "Guess the daily economics term in six tries. A quick, free puzzle — and every word links to the lesson that teaches it.",
    href: ECON_WORDLE,
    status: "live" as const,
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
    status: "live" as const,
    cta: "Play",
    thumbnail: "/games/margin-thumbnail.png",
    thumbnailAlt: "Margin strategy game — rival coffee shops facing off",
  },
];

export default function PlayCatalogPage() {
  return (
    <div className="space-y-2xl">
      <section>
        <h1 className="font-display text-3xl font-bold text-foreground">Games</h1>
        <p className="mt-md max-w-2xl text-foreground-secondary">
          Learn economics by playing. Each game teaches different concepts through competitive
          scenarios.
        </p>
      </section>

      <section className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <Card key={game.id} className="overflow-hidden bg-surface-raised">
            <div className="relative aspect-[16/9] w-full border-b border-border bg-surface-sunken">
              <Image
                src={game.thumbnail}
                alt={game.thumbnailAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={game.id === "econ-wordle"}
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {game.title}
                {game.status === "live" && <Badge variant="secondary">Available</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-sm text-foreground-secondary">{game.description}</p>
              <Button asChild className="w-full">
                <Link href={game.href}>{game.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
