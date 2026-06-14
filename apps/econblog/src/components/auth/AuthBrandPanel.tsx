import { BookOpen, Gamepad2, Trophy } from "lucide-react";
import { HeroBackgroundDiagrams } from "@/components/landing/LessonDiagram";
import { BrushUnderline } from "@/components/landing/BrushUnderline";
import { AuthLogo } from "@/components/auth/AuthLogo";

const highlights = [
  {
    icon: BookOpen,
    title: "Structured curriculum",
    description: "Micro, macro, trade, and finance — built as lessons, not lectures.",
  },
  {
    icon: Trophy,
    title: "Progress that sticks",
    description: "Quiz gates, mastery exams, and XP so you know what you’ve learned.",
  },
  {
    icon: Gamepad2,
    title: "Learn by doing",
    description: "Interactive games like Margin turn theory into decisions.",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-full overflow-hidden bg-gradient-to-br from-primary-subtle/40 via-surface to-gold-subtle/30 lg:flex lg:items-center lg:justify-center lg:p-3xl">
      <HeroBackgroundDiagrams />

      <div className="relative z-10 flex w-full max-w-md flex-col justify-between gap-3xl py-xl">
        <AuthLogo size="lg" showDomain />

        <div>
          <div className="mb-xl inline-flex items-center gap-sm rounded-full bg-gold-subtle px-md py-xs">
            <span className="size-[5px] rounded-full bg-gold animate-landing-pulse-dot" />
            <span className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-gold">
              Interactive economics
            </span>
          </div>

          <h1 className="font-display text-[2rem] font-semibold leading-[1.12] text-foreground text-balance xl:text-[2.35rem]">
            Learn economics by{" "}
            <BrushUnderline color="#FFD024" thickness={14} offset={10} animate={false}>
              <em className="text-primary not-italic">doing</em>
            </BrushUnderline>
            , not watching.
          </h1>

          <p className="mt-lg font-body text-base leading-relaxed text-foreground-secondary">
            Join Adam&apos;s Axioms to save progress, earn XP, unlock your learning
            path, and compete on the leaderboard.
          </p>
        </div>

        <ul className="space-y-lg">
          {highlights.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-md">
              <span className="mt-xs flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface/80 text-primary shadow-sm backdrop-blur-sm">
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-body text-sm font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-xs font-body text-sm leading-relaxed text-foreground-secondary">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
