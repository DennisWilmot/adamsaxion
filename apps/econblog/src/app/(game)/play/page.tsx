import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { priceWarPaths } from "@/lib/games/routes";

const GAMES = [
  {
    id: "price-war",
    title: "The Price War",
    description:
      "Turn-based economics strategy. Pick moves across sales, marketing, and operations — outmaneuver your opponent round by round.",
    href: priceWarPaths.lobby,
    status: "live" as const,
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
          <Card key={game.id} className="bg-surface-raised">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {game.title}
                {game.status === "live" && <Badge variant="secondary">Available</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-sm text-foreground-secondary">{game.description}</p>
              <Button asChild className="w-full">
                <Link href={game.href}>Play</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
