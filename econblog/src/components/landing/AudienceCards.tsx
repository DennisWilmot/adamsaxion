import Image from "next/image";
import { AUDIENCE } from "@/lib/landing/content";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export function AudienceCards() {
  return (
    <div className="grid md:grid-cols-3 gap-xl">
      {AUDIENCE.map((item, index) => (
        <ScrollReveal key={item.title} delay={index * 0.1}>
          <article className="group h-full overflow-hidden rounded-xl border border-border bg-surface-raised transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg">
            <div className="relative aspect-[5/4] overflow-hidden border-b border-border-subtle bg-surface-sunken">
              <Image
                src={item.image.src}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />
              <span className="absolute bottom-md left-md font-body text-[10px] font-semibold uppercase tracking-widest text-white/90 drop-shadow-sm">
                {item.image.label}
              </span>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <div className="absolute inset-0 animate-landing-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            </div>

            <div className="p-xl">
              <h3 className="font-display text-lg font-medium text-foreground mb-sm">
                {item.title}
              </h3>
              <p className="font-body text-sm text-foreground-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}
