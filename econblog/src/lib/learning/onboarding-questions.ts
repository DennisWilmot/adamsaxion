import type { InterestTagId } from "./interest-tags";

export type InterestWeights = Partial<Record<InterestTagId, number>>;

export interface OnboardingOption {
  id: string;
  label: string;
  weights: InterestWeights;
  /** Shown on results if this answer was chosen */
  insight: string;
}

export interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "spark",
    title: "What pulled you in today?",
    subtitle: "No wrong answers — this shapes how we introduce ideas to you.",
    options: [
      {
        id: "spark-framework",
        label: "I want the economy to finally make sense",
        weights: { fundamentals: 3, markets: 1 },
        insight: "You're looking for a coherent mental model, not hot takes.",
      },
      {
        id: "spark-headlines",
        label: "Headlines confuse me — I want to know what's real",
        weights: { fundamentals: 2, "critical-thinking": 2, policy: 1 },
        insight: "You'll get tools to separate signal from spin.",
      },
      {
        id: "spark-study",
        label: "I'm studying economics and want clarity",
        weights: { fundamentals: 3, data: 1 },
        insight: "We'll reinforce foundations without dumbing them down.",
      },
      {
        id: "spark-life",
        label: "Big money or career decisions are on my mind",
        weights: { "personal-finance": 3, "decision-making": 2 },
        insight: "Your path will lean toward choices that affect your life directly.",
      },
    ],
  },
  {
    id: "feeling",
    title: "When you finish, you want to feel…",
    options: [
      {
        id: "feel-explain",
        label: "Confident explaining economic ideas to anyone",
        weights: { fundamentals: 2, markets: 2 },
        insight: "Fluency matters more to you than memorizing definitions.",
      },
      {
        id: "feel-skeptic",
        label: "Harder to fool by politicians and pundits",
        weights: { policy: 2, "critical-thinking": 3 },
        insight: "Skepticism is a feature — we'll sharpen it, not kill it.",
      },
      {
        id: "feel-money",
        label: "Smarter about my own money and tradeoffs",
        weights: { "personal-finance": 3, psychology: 1 },
        insight: "Personal stakes will stay visible in your lesson order.",
      },
      {
        id: "feel-evidence",
        label: "Able to judge studies and statistics myself",
        weights: { data: 3, "critical-thinking": 2 },
        insight: "Evidence literacy is your north star.",
      },
    ],
  },
  {
    id: "moment",
    title: "Which sounds most like you lately?",
    options: [
      {
        id: "moment-studies",
        label: "Someone cites a study and I can't tell if it's solid",
        weights: { data: 2, "critical-thinking": 3 },
        insight: "We'll prioritize how economists actually establish causation.",
      },
      {
        id: "moment-prices",
        label: "I wonder why prices, wages, or rents move the way they do",
        weights: { fundamentals: 2, markets: 3, policy: 1 },
        insight: "Supply, demand, and incentives will show up early for you.",
      },
      {
        id: "moment-strategy",
        label: "I negotiate, compete, or lead — I want sharper strategic thinking",
        weights: { business: 3, "decision-making": 2 },
        insight: "Game theory and incentives belong on your route.",
      },
      {
        id: "moment-society",
        label: "I care about fairness, policy, and how society is shaped",
        weights: { policy: 3, fundamentals: 1 },
        insight: "Public economics and welfare will feature in your mix.",
      },
    ],
  },
  {
    id: "math",
    title: "Your comfort zone with math?",
    subtitle: "We'll respect this — not quiz you on it.",
    options: [
      {
        id: "math-light",
        label: "Keep it intuitive — light math is perfect",
        weights: { psychology: 1, fundamentals: 2 },
        insight: "We'll favor intuition and stories where possible.",
      },
      {
        id: "math-graphs",
        label: "Graphs and basic equations are fine",
        weights: { fundamentals: 2, markets: 2 },
        insight: "Standard undergrad depth fits you well.",
      },
      {
        id: "math-models",
        label: "I want real models — don't oversimplify",
        weights: { data: 2, business: 2, fundamentals: 1 },
        insight: "We'll lean into structure, not just metaphors.",
      },
      {
        id: "math-fine",
        label: "Math isn't the issue — I want rigor",
        weights: { data: 3, business: 1 },
        insight: "Empirical and formal tools can sit higher on your path.",
      },
    ],
  },
  {
    id: "topics",
    title: "What topics secretly interest you most?",
    options: [
      {
        id: "topic-markets",
        label: "Markets, firms, and competition",
        weights: { markets: 3, business: 2 },
        insight: "Producer and market-structure ideas will feel like home.",
      },
      {
        id: "topic-policy",
        label: "Government, taxes, and public policy",
        weights: { policy: 3 },
        insight: "State and economy modules will be weighted up.",
      },
      {
        id: "topic-behavior",
        label: "Why people act irrationally",
        weights: { psychology: 3, "decision-making": 2 },
        insight: "Behavioral economics will be in your lane.",
      },
      {
        id: "topic-data",
        label: "Data, experiments, and proof",
        weights: { data: 3, "critical-thinking": 2 },
        insight: "The empirical block will feel essential, not optional.",
      },
    ],
  },
  {
    id: "news",
    title: "When the economy is in the news, you…",
    options: [
      {
        id: "news-lost",
        label: "Feel lost — I need a framework",
        weights: { fundamentals: 3 },
        insight: "Foundations first will reduce the noise.",
      },
      {
        id: "news-argue",
        label: "Argue in my head but struggle to articulate why",
        weights: { fundamentals: 2, policy: 2 },
        insight: "We'll give you language for what you already sense.",
      },
      {
        id: "news-spin",
        label: "Assume someone is spinning the numbers",
        weights: { "critical-thinking": 3, data: 2 },
        insight: "Media literacy and methods will be emphasized.",
      },
      {
        id: "news-patterns",
        label: "Try to connect it to bigger patterns",
        weights: { fundamentals: 2, policy: 1, business: 1 },
        insight: "Macro threads and policy links will resonate.",
      },
    ],
  },
  {
    id: "frustration",
    title: "What would frustrate you here?",
    options: [
      {
        id: "frust-shallow",
        label: "Shallow summaries with no depth",
        weights: { fundamentals: 2, data: 1 },
        insight: "We'll pace depth through gated lessons, not skimming.",
      },
      {
        id: "frust-theory",
        label: "Theory with no connection to real life",
        weights: { psychology: 1, policy: 2, healthcare: 1 },
        insight: "Cases and hooks will stay tied to each concept.",
      },
      {
        id: "frust-claims",
        label: "Hand-wavy claims without evidence",
        weights: { data: 3, "critical-thinking": 2 },
        insight: "You'll see how claims are tested, not just asserted.",
      },
      {
        id: "frust-generic",
        label: "A generic path that doesn't feel like mine",
        weights: { "decision-making": 2, psychology: 1 },
        insight: "This questionnaire exists precisely to avoid that.",
      },
    ],
  },
  {
    id: "learn",
    title: "How do you learn best?",
    options: [
      {
        id: "learn-stories",
        label: "Stories and real cases first",
        weights: { fundamentals: 2, psychology: 1, healthcare: 1 },
        insight: "Narrative hooks will lead many of your lessons.",
      },
      {
        id: "learn-frameworks",
        label: "Clear frameworks, then examples",
        weights: { fundamentals: 3, markets: 1 },
        insight: "Models first — applications second — suits you.",
      },
      {
        id: "learn-practice",
        label: "Practice and structured problem sets",
        weights: { data: 2, business: 2 },
        insight: "Problem-heavy lessons will feel rewarding.",
      },
      {
        id: "learn-nuance",
        label: "Debate, nuance, and edge cases",
        weights: { policy: 2, "critical-thinking": 2, psychology: 1 },
        insight: "We'll leave room for 'it depends' — because it does.",
      },
    ],
  },
  {
    id: "brag",
    title: "Six months from now, you'd brag that you can…",
    options: [
      {
        id: "brag-debate",
        label: "Spot weak arguments in economic debates",
        weights: { "critical-thinking": 3, data: 1 },
        insight: "Argument quality is your finish line.",
      },
      {
        id: "brag-markets",
        label: "Explain when markets work — and when they don't",
        weights: { fundamentals: 2, markets: 2, policy: 1 },
        insight: "Market failure and welfare will matter to you.",
      },
      {
        id: "brag-incentives",
        label: "Think strategically about incentives",
        weights: { business: 3, psychology: 1 },
        insight: "Strategic thinking is your endgame.",
      },
      {
        id: "brag-health",
        label: "Hold your own in healthcare or policy talks",
        weights: { healthcare: 3, policy: 2 },
        insight: "Applied policy modules will earn their place.",
      },
    ],
  },
  {
    id: "pace",
    title: "Last one — what kind of journey do you want?",
    options: [
      {
        id: "pace-foundations",
        label: "Foundations first — build the full base",
        weights: { fundamentals: 4 },
        insight: "We'll start classical and grow from solid ground.",
      },
      {
        id: "pace-relevant",
        label: "Fastest route to what matters for me",
        weights: { "decision-making": 1 },
        insight: "We'll prioritize relevance over textbook order.",
      },
      {
        id: "pace-ambitious",
        label: "Challenge me — ambitious path",
        weights: { data: 2, business: 2 },
        insight: "We'll pull forward harder material when you're ready.",
      },
      {
        id: "pace-trust",
        label: "Surprise me — I trust your judgment",
        weights: {},
        insight: "We'll blend your signals into one coherent route.",
      },
    ],
  },
];

export const CALCULATING_MESSAGES = [
  "Reading your answers…",
  "Matching lessons to your goals…",
  "Weighing tradeoffs you'd actually care about…",
  "Sequencing your first milestones…",
  "Calibrating difficulty and pacing…",
  "Finalizing your path…",
];
