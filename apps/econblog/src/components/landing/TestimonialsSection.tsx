"use client";

import { OUTCOME_TESTIMONIALS } from "@/lib/landing/content";

type Testimonial = (typeof OUTCOME_TESTIMONIALS)[number];

export function TestimonialsSection() {
  const testimonialItems = [...OUTCOME_TESTIMONIALS, ...OUTCOME_TESTIMONIALS];

  return (
    <section className="border-t border-border-subtle bg-surface-sunken px-xl py-4xl">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-lg text-center font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          Social proof
        </p>

        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-sunken to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-sunken to-transparent"
          />

          <div
            className="flex w-max gap-md animate-landing-carousel hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${Math.max(50, OUTCOME_TESTIMONIALS.length * 8)}s`,
            }}
          >
            {testimonialItems.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                testimonial={testimonial}
                decorative={index >= OUTCOME_TESTIMONIALS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  decorative,
}: {
  testimonial: Testimonial;
  decorative?: boolean;
}) {
  const highlightIndex = testimonial.review.indexOf(testimonial.highlight);
  const before =
    highlightIndex === -1
      ? testimonial.review
      : testimonial.review.slice(0, highlightIndex);
  const highlighted = highlightIndex === -1 ? "" : testimonial.highlight;
  const after =
    highlightIndex === -1
      ? ""
      : testimonial.review.slice(highlightIndex + testimonial.highlight.length);

  return (
    <article
      aria-hidden={decorative || undefined}
      className="flex w-[320px] shrink-0 cursor-default flex-col overflow-hidden rounded-xl border border-border bg-surface-raised shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center gap-md px-xl pt-xl">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full font-body text-[15px] font-bold tracking-wide text-white"
          style={{
            background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}bb)`,
          }}
        >
          {testimonial.initials}
        </div>
        <p className="font-display text-[15px] font-semibold leading-snug text-foreground">
          {testimonial.name}
        </p>
      </div>

      <div className="flex-1 px-xl pb-md pt-lg">
        <p className="m-0 font-body text-[13.5px] leading-[1.7] text-foreground-secondary">
          {before}
          {highlighted && (
            <span
              className="mx-0.5 rounded-sm px-1 font-semibold text-foreground"
              style={{
                backgroundColor: `${testimonial.color}12`,
                borderBottom: `2px solid ${testimonial.color}40`,
              }}
            >
              {highlighted}
            </span>
          )}
          {after}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-end border-t border-border-subtle px-xl py-lg">
        <div className="flex gap-0.5" aria-label={`${testimonial.stars} out of 5 stars`}>
          {Array.from({ length: testimonial.stars }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#F5A623" aria-hidden>
      <path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L7 10.27 3.48 11.85l.67-3.93L1.3 5.14l3.94-.57L7 1z" />
    </svg>
  );
}
