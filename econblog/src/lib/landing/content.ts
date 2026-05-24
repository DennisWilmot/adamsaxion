import { CORPUS_LESSONS } from "@/lib/learning/corpus-lessons";
import { PHASE_LABELS } from "@/lib/learning/onboarding-outcomes";
import { PLAN_PRICES } from "@/lib/stripe/config";

export const LANDING_STATS = {
  lessonCount: CORPUS_LESSONS.length,
  phaseCount: Object.keys(PHASE_LABELS).length,
  gatesPerLesson: "~24",
  masteryPool: "~200",
} as const;

export const LANDING_NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Curriculum", href: "#curriculum" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const AUDIENCE = [
  {
    title: "Undergrad & pre-college",
    description:
      "Get ahead of micro, macro, and applied courses with structured lessons that test whether you can use the ideas, not just recall definitions.",
    image: {
      src: "/audience/undergrad.webp",
      label: "Course prep",
    },
  },
  {
    title: "Career & policy curious",
    description:
      "Build frameworks for pricing, incentives, and tradeoffs you can apply at work, in debates, and when reading the news.",
    image: {
      src: "/audience/career-policy.webp",
      label: "Real decisions",
    },
  },
  {
    title: "Serious self-study",
    description:
      "A full curriculum with depth beyond YouTube summaries, without the cost or rigidity of a formal program.",
    image: {
      src: "/audience/self-study.webp",
      label: "Deep study",
    },
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "Step 1",
    title: "Context",
    icon: "/how-it-works/context.webp",
    summary:
      "A real-world scenario grounds the concept before the model appears.",
    detail:
      "You open on a real situation: a price spike, a hiring freeze, a policy fight. The lesson names the stakes before it names the model. You are not reading abstract theory first. You are inside a scenario where the economics actually matters, and that is what makes the framework stick when the exam question looks nothing like the textbook.",
  },
  {
    step: "Step 2",
    title: "Mechanism",
    icon: "/how-it-works/mechanism.webp",
    summary:
      "The economic logic unfolds step by step: cause, effect, equilibrium.",
    detail:
      "The lesson builds the logic piece by piece. Supply shifts here, demand responds there, equilibrium moves. Each subsection adds one link in the chain until the full picture clicks. You are tracing cause and effect the way an economist actually thinks, not memorizing a graph label for later.",
  },
  {
    step: "Step 3",
    title: "Quiz gate",
    icon: "/how-it-works/quiz-gate.webp",
    summary:
      "Apply what you just learned before you can move on.",
    detail:
      "Every subsection ends with a gate. You answer while the idea is still warm. The question checks whether you can use what you just read: apply a concept, spot a mistake, predict what happens next. Get it wrong and you lose XP. You cannot skip ahead until you demonstrate that you understood it.",
  },
  {
    step: "Step 4",
    title: "Mastery",
    icon: "/how-it-works/mastery.webp",
    summary:
      "Pass a timed exam drawn from a large randomized question pool.",
    detail:
      "Finish the lesson and you face a timed mastery exam. The pool is large and randomized, so memorizing one walkthrough will not save you. You need to recognize the pattern and apply it under pressure. Pass, earn the XP, and the lesson counts as complete. That is the bar.",
  },
  {
    step: "Step 5",
    title: "Game",
    icon: "/how-it-works/game.webp",
    comingSoon: true,
    summary:
      "Strategic 1v1 games to reinforce what you just learned.",
    detail:
      "After you know the material, you will compete head to head in turn-based games built around the same concepts. Think of it as chess with economic reasoning: each move tests whether you can outthink an opponent using the ideas you just learned. This feature is in development.",
  },
] as const;

export const OUTCOME_STATS = [
  {
    value: String(LANDING_STATS.lessonCount),
    label: "structured lessons",
    sub: "Full undergrad-depth curriculum",
  },
  {
    value: `~${(LANDING_STATS.lessonCount * 24).toLocaleString("en-US")}`,
    label: "quiz gates",
    sub: "Apply theory as you read",
  },
  {
    value: String(LANDING_STATS.lessonCount),
    label: "mastery exams",
    sub: "Prove it under timed pressure",
  },
] as const;

export const OUTCOME_TESTIMONIALS = [
  {
    name: "Sarah Okonkwo",
    color: "#2E6B9C",
    review:
      "The quiz gates are no joke. You can't just skim and move on, you actually have to apply the concept or you're stuck. Took me three tries on the elasticity gate and I was frustrated at the time but it's the reason I still remember it months later. Highly recommend if you want something that actually sticks.",
    highlight:
      "Took me three tries on the elasticity gate and I was frustrated at the time but it's the reason I still remember it months later.",
    initials: "SO",
    stars: 5,
  },
  {
    name: "David Chen",
    color: "#C4943E",
    review:
      "Finally something that isn't a 12 minute YouTube video with an ad break. I went through the pricing and market structure lessons over a weekend and ended up redoing how we price tiers at work on Monday. My director asked where I learned it. Worth every penny.",
    highlight:
      "I went through the pricing and market structure lessons over a weekend and ended up redoing how we price tiers at work on Monday.",
    initials: "DC",
    stars: 5,
  },
  {
    name: "Amara Osei",
    color: "#4A7A62",
    review:
      "I'm in a public admin program and we barely touch actual econ. This filled in so many gaps. The central banking module alone was better than anything in my coursework. Clear, no fluff, and the mastery exam at the end forced me to actually know it not just recognize it.",
    highlight:
      "The central banking module alone was better than anything in my coursework.",
    initials: "AO",
    stars: 5,
  },
  {
    name: "Marco Pellegrini",
    color: "#B85442",
    review:
      "Game theory section is excellent. Very clear, builds up properly, doesn't skip steps. I use the incentive mapping framework in client work now regularly.",
    highlight:
      "I use the incentive mapping framework in client work now regularly.",
    initials: "MP",
    stars: 5,
  },
  {
    name: "Rachel Simmons",
    color: "#5C6B8A",
    review:
      "I started this because I felt stupid reading the economics section of the newspaper. Six weeks in and I actually understand what a rate hike does, why CPI matters, what people mean when they talk about yield curves. My coworker sent me an article about the Fed last week and I understood every word of it. That's never happened before.",
    highlight:
      "My coworker sent me an article about the Fed last week and I understood every word of it.",
    initials: "RS",
    stars: 5,
  },
  {
    name: "James Akintunde",
    color: "#8B6E4E",
    review:
      "Was trying to figure out whether to buy a flat or keep renting and everything I read online was just opinions. The discounting and opportunity cost lessons gave me an actual framework to think through it. Ended up renting two more years and putting the difference into index funds. No regrets so far.",
    highlight:
      "The discounting and opportunity cost lessons gave me an actual framework to think through it.",
    initials: "JA",
    stars: 5,
  },
] as const;

export const APP_SCREENSHOT_PLACEHOLDERS = [
  { label: "onboarding" },
  { label: "learning-path" },
] as const;

export const CURRICULUM_PHASES = Object.entries(PHASE_LABELS).map(([phase, label]) => ({
  phase: Number(phase),
  label,
  count: CORPUS_LESSONS.filter((l) => l.phase === Number(phase)).length,
}));

export const PRICING = {
  monthly: PLAN_PRICES.monthly,
  lifetime: PLAN_PRICES.lifetime,
  freeIncludes: [
    "Lesson Zero — full lesson, no account",
    "Real quiz gates and XP",
    "See the format before you pay",
  ],
  paidIncludes: [
    "Full curriculum — every lesson and gate",
    "Mastery exams with randomized pools",
    "Personalized learning path",
    "XP, levels, and leaderboard",
  ],
  lifetimeIncludes: [
    "Everything in Monthly",
    "One payment — access forever",
    "No recurring charges",
    "Best value if you're committed",
  ],
} as const;
