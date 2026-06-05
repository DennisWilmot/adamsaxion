import Link from "next/link";
import Image from "next/image";
import { FloatingIcons } from "@/components/FloatingIcons";
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
    <div>
      <div className="relative mb-2xl overflow-hidden rounded-xl bg-surface-sunken p-xl">
        <FloatingIcons count={18} />
        <div className="relative z-10">
          <h1 className="mb-sm font-display text-3xl font-bold text-foreground">Games</h1>
          <p className="max-w-lg font-body text-base text-foreground-secondary">
            Learn economics by playing. Each game teaches different concepts through competitive
            scenarios.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <Card
            key={game.id}
            className="group overflow-hidden rounded-xl border-border bg-surface-raised transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transform-none motion-reduce:hover:shadow"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-surface-sunken">
              <Image
                src={game.thumbnail}
                alt={game.thumbnailAlt}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={game.id === "econ-wordle"}
              />
            </div>
            <CardHeader className="p-xl pb-0">
              <CardTitle className="flex items-center justify-between font-display text-lg font-bold leading-snug text-foreground">
                {game.title}
                {game.status === "live" && (
                  <Badge className="shrink-0 border-transparent bg-success-subtle font-body text-[10px] font-semibold uppercase tracking-widest text-success">
                    Available
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md p-xl pt-md">
              <p className="font-body text-sm leading-relaxed text-foreground-muted">
                {game.description}
              </p>
              <Button
                asChild
                className="w-full bg-primary font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover"
              >
                <Link href={game.href}>{game.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
