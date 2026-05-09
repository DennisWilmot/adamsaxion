import Link from "next/link";
import { FloatingIcons } from "@/components/FloatingIcons";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative max-w-[64rem] mx-auto px-xl pt-5xl pb-4xl overflow-hidden">
        <FloatingIcons count={24} />
        <div className="relative z-10 max-w-[42rem]">
          <p className="font-body text-sm font-semibold tracking-widest uppercase text-primary mb-lg">
            Interactive Economics Education
          </p>

          <h1 className="font-display font-bold text-4xl text-foreground mb-xl text-balance leading-[1.08]">
            Economics education<br />
            that demands real<br />
            understanding
          </h1>

          <p className="font-body text-lg text-foreground-secondary leading-relaxed max-w-[36rem] mb-2xl">
            Structured lessons with gated quizzes. Wrong answers cost XP.
            Three strikes lock a question for 24 hours. No clicking through.
            No shortcuts. You either learn it or you don&apos;t.
          </p>

          <div className="flex items-center gap-lg">
            <Link
              href="/lessons"
              className="inline-flex items-center px-xl py-md font-body text-sm font-semibold text-surface-raised bg-primary hover:bg-primary-hover transition-colors rounded-lg shadow-sm"
            >
              Start with Lesson Zero
            </Link>
            <span className="text-xs text-foreground-muted font-body">
              Free. No account needed.
            </span>
          </div>
        </div>
      </section>

      {/* Value Props — editorial layout, not card grid */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <div className="grid md:grid-cols-3 gap-3xl">
            <div>
              <p className="font-display font-bold text-2xl text-foreground mb-sm">
                Gated
              </p>
              <p className="font-body text-base text-foreground-secondary leading-relaxed">
                Read a section. Answer the question. Get it right to unlock
                the next. Every gate is a checkpoint that verifies
                genuine comprehension.
              </p>
            </div>

            <div>
              <p className="font-display font-bold text-2xl text-foreground mb-sm">
                Penalized
              </p>
              <p className="font-body text-base text-foreground-secondary leading-relaxed">
                Wrong answers subtract XP. Three misses lock the question
                for 24 hours. The system has teeth because real learning
                requires real stakes.
              </p>
            </div>

            <div>
              <p className="font-display font-bold text-2xl text-foreground mb-sm">
                Earned
              </p>
              <p className="font-body text-base text-foreground-secondary leading-relaxed">
                XP tracks mastery, not time spent. Level up through
                demonstrated understanding. Compete on the leaderboard
                against people who actually know the material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — asymmetric, editorial */}
      <section className="border-t border-border-subtle bg-surface-sunken">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <h2 className="font-display font-bold text-2xl text-foreground mb-3xl">
            How a lesson works
          </h2>

          <div className="space-y-2xl max-w-[44rem]">
            {[
              {
                step: "01",
                title: "Read a dense section",
                desc: "Real economics content. Zimbabwe's hyperinflation. Coachella's ticket pricing. Apple's elasticity strategy. Not toy examples.",
              },
              {
                step: "02",
                title: "Answer the gate question",
                desc: "Each subsection ends with a quiz gate. Get it right: unlock the next section and earn XP. Get it wrong: lose XP and try again.",
              },
              {
                step: "03",
                title: "Complete all sections",
                desc: "8 major sections per lesson, each with ~3 gated subsections. Work through all of them at your own pace.",
              },
              {
                step: "04",
                title: "Pass the mastery exam",
                desc: "25 randomly-drawn questions. Timed. 70% to pass. Different questions every attempt. This is where you prove you know the material.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-xl items-baseline">
                <span className="font-display font-bold text-xl text-foreground-muted shrink-0 w-8 tabular-nums">
                  {item.step}
                </span>
                <div>
                  <p className="font-display font-semibold text-lg text-foreground mb-xs">
                    {item.title}
                  </p>
                  <p className="font-body text-base text-foreground-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl text-center">
          <p className="font-display font-bold text-2xl text-foreground mb-sm">
            Lesson Zero is free
          </p>
          <p className="font-body text-base text-foreground-secondary mb-xl max-w-md mx-auto">
            A full lesson with real content, real quizzes, and real XP.
            See if this is worth $19.99/month before you commit.
          </p>
          <Link
            href="/lessons"
            className="inline-flex items-center px-xl py-md font-body text-sm font-semibold text-surface-raised bg-primary hover:bg-primary-hover transition-colors rounded-lg shadow-sm"
          >
            Start Learning
          </Link>
        </div>
      </section>
    </div>
  );
}
