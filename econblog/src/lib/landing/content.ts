import { CORPUS_LESSONS } from "@/lib/learning/corpus-lessons";
import {
  OUTCOMES_BY_INTEREST,
  PHASE_LABELS,
} from "@/lib/learning/onboarding-outcomes";
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
      "Get ahead of micro, macro, and applied courses with structured lessons that test whether you can use the ideas — not just recall definitions.",
  },
  {
    title: "Career & policy curious",
    description:
      "Build frameworks for pricing, incentives, and tradeoffs you can apply at work, in debates, and when reading the news.",
  },
  {
    title: "Serious self-study",
    description:
      "A full curriculum with depth beyond YouTube summaries — without the cost or rigidity of a formal program.",
  },
] as const;

export const PHILOSOPHY = [
  {
    title: "Understanding beats exposure",
    body: "Most economics content is passive. Here you read dense material, then prove you can apply it before moving on.",
  },
  {
    title: "Progress should mean something",
    body: "XP tracks demonstrated mastery, not minutes on a page. Wrong answers cost points. The leaderboard reflects people who earned it.",
  },
  {
    title: "Rigor without gatekeeping",
    body: "Hard questions and honest feedback — but you choose where to start. Open lesson selection with a path that recommends what to do next.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Work through a real section",
    description:
      "Case-based content with tradeoffs and decisions — roughly eight major sections per lesson, each broken into short subsections.",
  },
  {
    step: "02",
    title: "Pass the gate",
    description:
      "Every subsection ends with a quiz. Answer correctly to unlock the next part while the idea is still fresh.",
  },
  {
    step: "03",
    title: "Earn XP and level up",
    description:
      "Correct answers add XP by difficulty. Wrong answers subtract. Every 1,000 XP is a new level on the leaderboard.",
  },
  {
    step: "04",
    title: "Prove mastery",
    description:
      "Finish with a timed exam drawn from a large question pool. Different questions each attempt — recall alone won't carry you.",
  },
] as const;

export const SAMPLE_PATH = [
  { title: "Budget constraints and tradeoffs", reason: "Foundation for every choice model" },
  { title: "Demand: where it actually comes from", reason: "Matches your markets focus" },
  { title: "Elasticity: the most useful number in economics", reason: "Apply pricing logic to real decisions" },
] as const;

export const PERSONALIZATION_OUTCOMES = OUTCOMES_BY_INTEREST.markets.slice(0, 3);

export const CURRICULUM_PHASES = Object.entries(PHASE_LABELS).map(([phase, label]) => ({
  phase: Number(phase),
  label,
  count: CORPUS_LESSONS.filter((l) => l.phase === Number(phase)).length,
}));

export const FEATURES = [
  {
    title: "Gated subsections",
    description: "You can't skip ahead without showing you understood the last idea.",
  },
  {
    title: "Mastery exams",
    description: "Large randomized pools per lesson. Pass the exam to complete the lesson.",
  },
  {
    title: "XP, levels & leaderboard",
    description: "Visible progress with real stakes — penalties and lockouts keep the loop honest.",
  },
  {
    title: "Personalized path",
    description: "Short onboarding maps your interests to a recommended lesson sequence.",
  },
  {
    title: "Tabbed lesson workspace",
    description: "Desktop-first UI built for focused reading, quizzing, and revisiting sections.",
  },
  {
    title: "Full curriculum access",
    description: "Subscribe for every lesson, gate, and mastery exam beyond Lesson Zero.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I've watched a lot of econ YouTube. This is the first place where I had to show I could apply elasticity to a pricing scenario — not just define it.",
    attribution: "Early access learner",
    context: "Preparing for undergrad micro",
  },
  {
    quote:
      "The gates are annoying in the best way. I can't lie to myself about progress anymore. Wrong answers actually hurt.",
    attribution: "Early access learner",
    context: "Career switcher, self-study",
  },
  {
    quote:
      "The personalized path pointed me at game theory and mechanism design after I said I cared about business strategy. Felt tailored, not generic.",
    attribution: "Early access learner",
    context: "Policy & business focus",
  },
] as const;

export const COMPARISON = [
  { label: "Passive video", youtube: true, textbook: false, axioms: false },
  { label: "Self-paced reading", youtube: false, textbook: true, axioms: true },
  { label: "Applied quiz gates", youtube: false, textbook: false, axioms: true },
  { label: "XP & mastery tracking", youtube: false, textbook: false, axioms: true },
  { label: "Personalized path", youtube: false, textbook: false, axioms: true },
] as const;

export const FAQ = [
  {
    question: "Is Lesson Zero really free?",
    answer:
      "Yes. Lesson Zero is a full lesson with real content, quiz gates, and XP — no account required. It's the only free lesson on the platform.",
  },
  {
    question: "Do I need an account to start?",
    answer:
      "No. Start Lesson Zero anonymously. You'll need to sign in when you're ready for the full curriculum and your personalized path.",
  },
  {
    question: "What happens if I get a question wrong?",
    answer:
      "Wrong answers subtract XP. After three misses on a question, it locks for 24 hours — you can keep reading, but that gate stays incomplete until you pass it.",
  },
  {
    question: "Can I skip lessons?",
    answer:
      "Yes. Any lesson is available from the catalog. Your personalized path recommends an order based on your goals, but nothing is forced.",
  },
  {
    question: "How is this different from the YouTube channel?",
    answer:
      "YouTube explains ideas. Adam's Axioms makes you use them — gated quizzes, XP, mastery exams, and a structured curriculum you work through at your own pace.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Monthly subscribers can cancel from their profile. Lifetime access is a one-time payment with no recurring charges.",
  },
] as const;

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
} as const;
