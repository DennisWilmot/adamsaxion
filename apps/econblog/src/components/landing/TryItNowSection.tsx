import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { lessonZeroPath } from "@/lib/constants/lessons";
import { LANDING_CTA_START_LESSON_ZERO, TRY_IT_NOW } from "@/lib/landing/content";
import { getPlayCatalogGame } from "@/lib/games/catalog";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

function resolveTryItNowThumbnail(item: (typeof TRY_IT_NOW)[number]) {
  if ("gameId" in item) {
    const game = getPlayCatalogGame(item.gameId);
    return { src: game.thumbnail, alt: game.thumbnailAlt };
  }

  return { src: item.thumbnail, alt: item.thumbnailAlt };
}

function tryItNowKey(item: (typeof TRY_IT_NOW)[number]) {
  return "gameId" in item ? item.gameId : item.href;
}

export function TryItNowSection() {
  return (
    <section id="try-now" className="border-t border-border-subtle bg-surface px-xl py-4xl">
      <div className="mx-auto max-w-[1040px]">
        <ScrollReveal>
          <p className="mb-sm text-center font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
            Try it now
          </p>
          <h2 className="mb-md text-center font-display text-[32px] font-medium text-balance text-foreground">
            Three ways in — no account needed
          </h2>
          <p className="mx-auto mb-3xl max-w-[40rem] text-center font-body text-base text-foreground-secondary">
            Pick your entry point. No account needed for Wordle or Lesson Zero.
          </p>
        </ScrollReveal>

        <div className="grid gap-xl md:grid-cols-3">
          {TRY_IT_NOW.map((item, index) => {
            const { src, alt } = resolveTryItNowThumbnail(item);

            return (
              <ScrollReveal key={tryItNowKey(item)} delay={index * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-raised transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-surface-sunken">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 340px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <span className="absolute left-md top-md rounded-full border border-white/20 bg-black/40 px-sm py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-xl">
                    <h3 className="mb-sm font-display text-xl font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-lg flex-1 font-body text-sm leading-relaxed text-foreground-secondary">
                      {item.description}
                    </p>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-sm font-body text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                    >
                      {item.cta}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-3xl flex justify-center">
          <Link
            href={lessonZeroPath()}
            className="group relative inline-flex items-center gap-sm overflow-hidden rounded-lg bg-primary px-xl py-md font-body text-base font-semibold text-surface-raised transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md"
          >
            <span
              aria-hidden
              className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
            <span className="relative z-10 flex items-center gap-sm">
              {LANDING_CTA_START_LESSON_ZERO}
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
