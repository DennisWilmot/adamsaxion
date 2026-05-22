import type { InterestTagId } from "./interest-tags";

/** Concrete skills/outcomes tied to each focus area — shown on results. */
export const OUTCOMES_BY_INTEREST: Record<InterestTagId, string[]> = {
  fundamentals: [
    "Explain supply, demand, and why prices move",
    "Use a framework when economic news breaks",
    "Connect micro foundations to policy debates",
  ],
  policy: [
    "Understand tax incidence and who really pays",
    "Evaluate government intervention with welfare tools",
    "Read policy fights with economic structure",
  ],
  markets: [
    "Analyze competition, pricing, and market power",
    "Predict effects of shocks on equilibrium",
    "Apply elasticity to real pricing decisions",
  ],
  business: [
    "Think in incentives, strategy, and game theory",
    "Model firm decisions with marginal reasoning",
    "Navigate negotiation and competitive dynamics",
  ],
  "decision-making": [
    "Formalize tradeoffs with budget constraints",
    "Model choices with utility and preferences",
    "Apply economics to everyday decisions",
  ],
  psychology: [
    "Explain bias, present bias, and loss aversion",
    "Connect behavioral findings to policy design",
    "See where rational models break down",
  ],
  data: [
    "Distinguish correlation from causation",
    "Read regressions and empirical papers critically",
    "Understand RCTs, diff-in-diff, and IV logic",
  ],
  "critical-thinking": [
    "Spot weak causal claims in media and studies",
    "Interpret p-values and statistical significance",
    "Judge when evidence supports a policy claim",
  ],
  healthcare: [
    "Explain why healthcare markets are different",
    "Understand insurance, adverse selection, and moral hazard",
    "Apply health economics to policy debates",
  ],
  "personal-finance": [
    "Frame personal tradeoffs with opportunity cost",
    "Connect behavior and habits to economic models",
    "Make sharper money decisions with frameworks",
  ],
};

/** Per-answer skill line when that specific option is chosen */
export const OPTION_SKILL: Record<string, string> = {
  "spark-framework": "Build a core model of how economies coordinate",
  "spark-headlines": "Fact-check economic claims in the wild",
  "spark-study": "Solidify undergrad-level micro/macro foundations",
  "spark-life": "Apply economics to career and money choices",
  "feel-explain": "Teach and argue with precise economic language",
  "feel-skeptic": "Stress-test political and media narratives",
  "feel-money": "Improve personal financial tradeoff thinking",
  "feel-evidence": "Evaluate studies without taking them on faith",
  "moment-studies": "Master causal inference basics",
  "moment-prices": "Trace price movements to supply and demand",
  "moment-strategy": "Use game theory in competitive situations",
  "moment-society": "Analyze policy with welfare and equity tools",
  "brag-debate": "Win debates with structure, not vibes",
  "brag-markets": "Diagnose market success and failure",
  "brag-incentives": "Design better incentives in work and life",
  "brag-health": "Hold your own in healthcare economics discussions",
};

export const PHASE_LABELS: Record<number, string> = {
  0: "Introduction",
  1: "How markets work",
  2: "Strategic thinking",
  3: "Information & incentives",
  4: "Reading the evidence",
  5: "State & policy",
  6: "Behavioral economics",
  7: "Health economics",
};
