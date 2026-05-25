/** Curriculum plan metadata (from lesson_corpus_complete.md). */
export interface CorpusLesson {
  id: number;
  title: string;
  slug: string;
  phase: number;
  prereqs: number[];
  interests: string[];
}

export const CORPUS_LESSONS: CorpusLesson[] = [
  { id: 0, title: "How a currency dies: Zimbabwe's hyperinflation", slug: "how-a-currency-dies", phase: 0, prereqs: [], interests: ["current-events", "history", "fundamentals"] },
  { id: 1, title: "Budget constraints and tradeoffs", slug: "budget-constraints-and-tradeoffs", phase: 1, prereqs: [], interests: ["personal-finance", "decision-making", "fundamentals"] },
  { id: 2, title: "Preferences and utility", slug: "preferences-and-utility", phase: 1, prereqs: [1], interests: ["decision-making", "psychology", "fundamentals"] },
  { id: 3, title: "Demand: where it actually comes from", slug: "demand-where-it-comes-from", phase: 1, prereqs: [1, 2], interests: ["business", "markets", "fundamentals"] },
  { id: 4, title: "Income vs. substitution effects", slug: "income-vs-substitution-effects", phase: 1, prereqs: [3], interests: ["pricing", "fundamentals"] },
  { id: 5, title: "Production and costs", slug: "production-and-costs", phase: 1, prereqs: [1], interests: ["business", "fundamentals"] },
  { id: 6, title: "Profit maximization", slug: "profit-maximization", phase: 1, prereqs: [5], interests: ["business", "fundamentals"] },
  { id: 7, title: "Perfect competition", slug: "perfect-competition", phase: 1, prereqs: [3, 6], interests: ["markets", "fundamentals"] },
  { id: 8, title: "Monopoly and market power", slug: "monopoly-and-market-power", phase: 1, prereqs: [6], interests: ["business", "policy"] },
  { id: 9, title: "Supply and demand in equilibrium", slug: "supply-and-demand-in-equilibrium", phase: 1, prereqs: [3, 7], interests: ["markets", "fundamentals"] },
  { id: 10, title: "Elasticity: the most useful number in economics", slug: "elasticity", phase: 1, prereqs: [3, 9], interests: ["business", "policy", "fundamentals"] },
  { id: 11, title: "Welfare: surplus, efficiency, and the case for markets", slug: "welfare-surplus-efficiency", phase: 1, prereqs: [9, 10], interests: ["policy", "fundamentals"] },
  { id: 12, title: "When markets fail: externalities and public goods", slug: "market-failures", phase: 1, prereqs: [11], interests: ["environment", "policy"] },
  { id: 13, title: "Strategic interaction and Nash equilibrium", slug: "nash-equilibrium", phase: 2, prereqs: [1, 2], interests: ["strategy", "business"] },
  { id: 14, title: "The prisoner's dilemma and cooperation problems", slug: "prisoners-dilemma", phase: 2, prereqs: [13], interests: ["policy", "international-relations"] },
  { id: 15, title: "Sequential games and credible threats", slug: "sequential-games", phase: 2, prereqs: [13], interests: ["strategy", "negotiation"] },
  { id: 16, title: "Repeated games: how cooperation emerges", slug: "repeated-games", phase: 2, prereqs: [14, 15], interests: ["business", "international-relations"] },
  { id: 17, title: "Auctions and bidding strategy", slug: "auctions-and-bidding", phase: 2, prereqs: [13], interests: ["business", "tech"] },
  { id: 18, title: "Information asymmetry: the lemons problem", slug: "lemons-problem", phase: 2, prereqs: [7, 13], interests: ["markets", "healthcare"] },
  { id: 19, title: "Moral hazard", slug: "moral-hazard", phase: 3, prereqs: [18], interests: ["insurance", "healthcare"] },
  { id: 20, title: "Adverse selection deep dive", slug: "adverse-selection", phase: 3, prereqs: [18], interests: ["insurance", "healthcare"] },
  { id: 21, title: "Signaling: costly proof", slug: "signaling", phase: 3, prereqs: [18, 13], interests: ["education", "business"] },
  { id: 22, title: "Screening: sorting without seeing", slug: "screening", phase: 3, prereqs: [20, 21], interests: ["business", "insurance"] },
  { id: 23, title: "Principal-agent problems", slug: "principal-agent", phase: 3, prereqs: [19], interests: ["management", "business"] },
  { id: 24, title: "Mechanism design: engineering outcomes", slug: "mechanism-design", phase: 3, prereqs: [17, 22, 23], interests: ["policy", "tech"] },
  { id: 25, title: "Correlation vs. causation (for real this time)", slug: "correlation-vs-causation", phase: 4, prereqs: [], interests: ["research", "data", "critical-thinking"] },
  { id: 26, title: "Randomized experiments: the gold standard", slug: "randomized-experiments", phase: 4, prereqs: [25], interests: ["research", "data"] },
  { id: 27, title: "Regression: what it actually does", slug: "regression", phase: 4, prereqs: [25], interests: ["data", "research"] },
  { id: 28, title: "Omitted variable bias", slug: "omitted-variable-bias", phase: 4, prereqs: [27], interests: ["research", "critical-thinking"] },
  { id: 29, title: "Natural experiments and instrumental variables", slug: "instrumental-variables", phase: 4, prereqs: [26, 28], interests: ["research", "policy"] },
  { id: 30, title: "Difference-in-differences", slug: "difference-in-differences", phase: 4, prereqs: [27, 26], interests: ["policy", "data"] },
  { id: 31, title: "Regression discontinuity", slug: "regression-discontinuity", phase: 4, prereqs: [27, 26], interests: ["policy", "data"] },
  { id: 32, title: "How to read an empirical paper", slug: "how-to-read-empirical-paper", phase: 4, prereqs: [28, 29, 30, 31], interests: ["research", "critical-thinking"] },
  { id: 33, title: "Statistical significance and its discontents", slug: "statistical-significance", phase: 4, prereqs: [27], interests: ["research", "critical-thinking"] },
  { id: 34, title: "Tax incidence: who actually pays", slug: "tax-incidence", phase: 5, prereqs: [9, 10], interests: ["taxation", "policy"] },
  { id: 35, title: "Deadweight loss: the hidden cost of taxes", slug: "deadweight-loss", phase: 5, prereqs: [11, 34], interests: ["taxation", "policy"] },
  { id: 36, title: "Optimal income taxation", slug: "optimal-income-taxation", phase: 5, prereqs: [35, 10], interests: ["policy", "inequality"] },
  { id: 37, title: "Behavioral responses to taxation", slug: "behavioral-responses-taxation", phase: 5, prereqs: [36, 10], interests: ["taxation", "policy"] },
  { id: 38, title: "Capital and wealth taxation", slug: "capital-wealth-taxation", phase: 5, prereqs: [34, 35], interests: ["inequality", "policy"] },
  { id: 39, title: "The economics of social insurance", slug: "social-insurance", phase: 5, prereqs: [12, 19, 20], interests: ["policy", "healthcare"] },
  { id: 40, title: "Social security: design and debates", slug: "social-security", phase: 5, prereqs: [39], interests: ["policy", "retirement"] },
  { id: 41, title: "Redistribution: cash vs. in-kind", slug: "redistribution-cash-vs-inkind", phase: 5, prereqs: [11, 39], interests: ["policy", "poverty"] },
  { id: 42, title: "Public goods and free riding", slug: "public-goods-free-riding", phase: 5, prereqs: [12, 13], interests: ["policy", "government"] },
  { id: 43, title: "Reference dependence and loss aversion", slug: "loss-aversion", phase: 6, prereqs: [2], interests: ["psychology", "personal-finance"] },
  { id: 44, title: "Present bias and self-control", slug: "present-bias", phase: 6, prereqs: [2], interests: ["personal-finance", "psychology"] },
  { id: 45, title: "Biases in judgment", slug: "biases-in-judgment", phase: 6, prereqs: [25], interests: ["psychology", "critical-thinking"] },
  { id: 46, title: "Nudges and choice architecture", slug: "nudges-choice-architecture", phase: 6, prereqs: [43, 44, 45], interests: ["policy", "psychology"] },
  { id: 47, title: "When rationality assumptions break down", slug: "rationality-breaks-down", phase: 6, prereqs: [43, 44, 11], interests: ["philosophy", "policy"] },
  { id: 48, title: "Why healthcare markets are different", slug: "why-healthcare-is-different", phase: 7, prereqs: [12, 18, 19, 20], interests: ["healthcare", "policy"] },
  { id: 49, title: "The demand for health insurance", slug: "demand-for-health-insurance", phase: 7, prereqs: [2, 20, 48], interests: ["healthcare", "personal-finance"] },
  { id: 50, title: "Moral hazard in health insurance: the RAND experiment", slug: "rand-health-insurance-experiment", phase: 7, prereqs: [19, 26, 49], interests: ["healthcare", "research"] },
];

export const CORPUS_BY_ID = new Map(CORPUS_LESSONS.map((l) => [l.id, l]));
