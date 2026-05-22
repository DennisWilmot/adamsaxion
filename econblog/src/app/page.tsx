import Link from "next/link";
import { redirect } from "next/navigation";
import { FloatingIcons } from "@/components/FloatingIcons";
import { lessonZeroPath } from "@/lib/constants/lessons";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const params = await searchParams;
  if (params.code) {
    const qs = new URLSearchParams({ code: params.code });
    if (params.next) qs.set("next", params.next);
    redirect(`/auth/callback?${qs.toString()}`);
  }

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
            Every XP point must be earned. Structured lessons, fast feedback
            loops, and gated quizzes that test whether you can actually apply
            economics under pressure. No clicking through. No fake progress.
          </p>

          <div className="flex flex-col items-start gap-md sm:flex-row sm:items-center sm:gap-lg">
            <Link
              href={lessonZeroPath()}
              className="inline-flex items-center px-xl py-md font-body text-sm font-semibold text-surface-raised bg-primary hover:bg-primary-hover transition-colors rounded-lg shadow-sm"
            >
              Start with Lesson Zero
            </Link>
            <span className="text-xs text-foreground-muted font-body">
              Free. Built for serious self-study before undergrad, a master&apos;s,
              or a harder economics course.
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

      <section className="border-t border-border-subtle">
        <div className="max-w-[64rem] mx-auto px-xl py-4xl">
          <div className="max-w-[46rem]">
            <p className="font-display font-bold text-2xl text-foreground mb-lg">
              The philosophy
            </p>
            <div className="space-y-lg font-body text-base text-foreground-secondary leading-relaxed">
              <p>
                This is economics boot camp. The goal is not to make you feel
                busy. The goal is to make you better at reasoning through real
                economic problems.
              </p>
              <p>
                Every XP point represents demonstrated understanding. You read a
                section, get tested quickly, and move forward only when you earn
                it. The pace stays tight so the feedback loop stays honest.
              </p>
              <p>
                The questions are designed around application, not recall. You
                should have to compare tradeoffs, work through scenarios, and
                notice where your assumptions or biases break down.
              </p>
              <p>
                The ambition is simple: build something rigorous enough to help
                someone prepare for undergraduate economics, a master&apos;s
                program, or serious independent study.
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
                title: "Work through a real section",
                desc: "Dense economics content grounded in real cases, tradeoffs, and decisions. Not toy examples and not watered-down summaries.",
              },
              {
                step: "02",
                title: "Apply it immediately",
                desc: "Each subsection ends with a quiz gate. You are tested fast, while the idea is still fresh, so the system can tell whether you actually understood it.",
              },
              {
                step: "03",
                title: "Earn your progress",
                desc: "Correct answers unlock the next step and earn XP. Wrong answers cost XP. Progress reflects demonstrated understanding, not time spent on the page.",
              },
              {
                step: "04",
                title: "Prove it on mastery",
                desc: "Finish with a timed mastery exam drawn from a larger pool of application-heavy questions. This is where recall stops being enough.",
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
            A full lesson with real content, real quizzes, and XP that must be
            earned. See whether this style of economics training works for you
            before you commit.
          </p>
          <Link
            href={lessonZeroPath()}
            className="inline-flex items-center px-xl py-md font-body text-sm font-semibold text-surface-raised bg-primary hover:bg-primary-hover transition-colors rounded-lg shadow-sm"
          >
            Start Learning
          </Link>
        </div>
      </section>
    </div>
  );
}
