/**
 * Econ Wordle answer pool.
 *
 * Curation rules (see ECON_WORDLE_SCOPE.md §6/§7):
 * - Words must be recognizable to an econ-curious player, not obscure jargon.
 * - Length 4–8 letters, A–Z only.
 * - Each word maps to an existing lesson slug (the funnel bridge).
 *
 * To add words: append entries. Order is irrelevant — the daily puzzle indexes
 * by date, so reordering changes which day a word lands on but nothing else.
 */
export interface EconWord {
  /** Answer, A–Z only. Stored uppercase. */
  word: string;
  /** One-line, fair definition shown on the result screen. */
  definition: string;
  /** Slug of the lesson that teaches this concept (must exist in the corpus). */
  lessonSlug: string;
}

export const ECON_WORDS: readonly EconWord[] = [
  { word: "SURPLUS", definition: "The gain to a buyer or seller beyond what they'd accept.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "DEMAND", definition: "How much buyers want to purchase at each price.", lessonSlug: "demand-where-it-comes-from" },
  { word: "SUPPLY", definition: "How much sellers are willing to offer at each price.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "MONEY", definition: "A medium of exchange, store of value, and unit of account.", lessonSlug: "how-a-currency-dies" },
  { word: "TRADE", definition: "Voluntary exchange that can leave both parties better off.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "COST", definition: "What a firm gives up to produce — fixed plus variable.", lessonSlug: "production-and-costs" },
  { word: "FIRM", definition: "An organization that combines inputs to produce for profit.", lessonSlug: "profit-maximization" },
  { word: "PROFIT", definition: "Total revenue minus total cost.", lessonSlug: "profit-maximization" },
  { word: "REVENUE", definition: "Money a firm takes in: price times quantity sold.", lessonSlug: "profit-maximization" },
  { word: "OUTPUT", definition: "The quantity of goods a firm produces.", lessonSlug: "production-and-costs" },
  { word: "MARGIN", definition: "The effect of one more unit — how economists think at the edge.", lessonSlug: "profit-maximization" },
  { word: "UTILITY", definition: "A measure of the satisfaction a person gets from consuming.", lessonSlug: "preferences-and-utility" },
  { word: "GOOD", definition: "A product people buy to satisfy a want.", lessonSlug: "demand-where-it-comes-from" },
  { word: "BUYER", definition: "Someone whose willingness to pay drives demand.", lessonSlug: "demand-where-it-comes-from" },
  { word: "SELLER", definition: "A supplier who offers goods to the market.", lessonSlug: "perfect-competition" },
  { word: "MARKET", definition: "Where buyers and sellers interact to set prices.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "ELASTIC", definition: "Quantity that responds strongly to a change in price.", lessonSlug: "elasticity" },
  { word: "MONOPOLY", definition: "A market with a single dominant seller.", lessonSlug: "monopoly-and-market-power" },
  { word: "RENT", definition: "Payment above what's needed to keep a resource in use.", lessonSlug: "monopoly-and-market-power" },
  { word: "CARTEL", definition: "A group of firms colluding to raise prices.", lessonSlug: "repeated-games" },
  { word: "COLLUDE", definition: "To secretly cooperate to limit competition.", lessonSlug: "repeated-games" },
  { word: "PRICE", definition: "What buyers pay and sellers receive — set where supply meets demand.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "WELFARE", definition: "Total economic well-being: consumer plus producer surplus.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "SHORTAGE", definition: "When quantity demanded exceeds quantity supplied.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "CEILING", definition: "A legal maximum price, like rent control.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "SCARCITY", definition: "Limited resources against unlimited wants — the core problem.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "TRADEOFF", definition: "Giving up one thing to get another.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "DEBT", definition: "Money owed — a claim on future income.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "INCOME", definition: "The flow of earnings a person receives over time.", lessonSlug: "optimal-income-taxation" },
  { word: "WAGE", definition: "The price of labor paid by employers to workers.", lessonSlug: "production-and-costs" },
  { word: "CAPITAL", definition: "Productive assets like machines, tools, and buildings.", lessonSlug: "capital-wealth-taxation" },
  { word: "WEALTH", definition: "The total value of the assets someone owns.", lessonSlug: "capital-wealth-taxation" },
  { word: "TAXES", definition: "Compulsory payments that drive a wedge into markets.", lessonSlug: "tax-incidence" },
  { word: "SUBSIDY", definition: "A government payment that lowers a price or cost.", lessonSlug: "tax-incidence" },
  { word: "EQUITY", definition: "Fairness in how resources are distributed.", lessonSlug: "redistribution-cash-vs-inkind" },
  { word: "POVERTY", definition: "Having resources below a basic living standard.", lessonSlug: "redistribution-cash-vs-inkind" },
  { word: "INSURE", definition: "To pay a premium to transfer risk to another party.", lessonSlug: "social-insurance" },
  { word: "PREMIUM", definition: "The price paid for insurance coverage.", lessonSlug: "demand-for-health-insurance" },
  { word: "RISK", definition: "Exposure to uncertain outcomes — central to insurance.", lessonSlug: "demand-for-health-insurance" },
  { word: "HAZARD", definition: "Extra risk-taking when you're shielded from the consequences.", lessonSlug: "moral-hazard" },
  { word: "LEMONS", definition: "Low-quality goods that dominate when buyers can't see quality.", lessonSlug: "lemons-problem" },
  { word: "SIGNAL", definition: "A costly action that credibly reveals hidden quality.", lessonSlug: "signaling" },
  { word: "SCREEN", definition: "Designing options so people sort themselves by hidden type.", lessonSlug: "screening" },
  { word: "AGENT", definition: "Someone acting on another's behalf, with their own incentives.", lessonSlug: "principal-agent" },
  { word: "AUCTION", definition: "A sale where buyers bid against one another.", lessonSlug: "auctions-and-bidding" },
  { word: "BIDDER", definition: "A participant competing to win in an auction.", lessonSlug: "auctions-and-bidding" },
  { word: "NASH", definition: "An outcome where no player can gain by changing alone.", lessonSlug: "nash-equilibrium" },
  { word: "DEFECT", definition: "To break cooperation for a short-term gain.", lessonSlug: "prisoners-dilemma" },
  { word: "THREAT", definition: "A promise to act that only works if it's credible.", lessonSlug: "sequential-games" },
  { word: "NUDGE", definition: "A small design tweak that steers choices without forcing them.", lessonSlug: "nudges-choice-architecture" },
  { word: "BIAS", definition: "A systematic, repeatable error in judgment.", lessonSlug: "biases-in-judgment" },
  { word: "AVERSION", definition: "A strong dislike — as in loss aversion.", lessonSlug: "loss-aversion" },
  { word: "DISCOUNT", definition: "To value future payoffs less than present ones.", lessonSlug: "present-bias" },
  { word: "SAVINGS", definition: "Income set aside instead of spent now.", lessonSlug: "present-bias" },
  { word: "RATIONAL", definition: "Acting consistently to best achieve one's goals.", lessonSlug: "rationality-breaks-down" },
  { word: "RANDOM", definition: "Assigned by chance — which removes selection bias.", lessonSlug: "randomized-experiments" },
  { word: "CONTROL", definition: "The untreated comparison group in an experiment.", lessonSlug: "randomized-experiments" },
  { word: "SAMPLE", definition: "A subset of data used to infer about a population.", lessonSlug: "randomized-experiments" },
  { word: "CAUSAL", definition: "Showing that one thing actually produces another.", lessonSlug: "correlation-vs-causation" },
  { word: "VARIABLE", definition: "A measured quantity that changes across observations.", lessonSlug: "regression" },
  { word: "TARIFF", definition: "A tax on imported goods.", lessonSlug: "tax-incidence" },
  { word: "BORROW", definition: "To take on debt now against future repayment.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "GOODS", definition: "Tangible products traded in markets.", lessonSlug: "demand-where-it-comes-from" },
  { word: "VALUE", definition: "What something is worth to the person who holds it.", lessonSlug: "preferences-and-utility" },
  { word: "RIVAL", definition: "A good one person's use of which reduces another's.", lessonSlug: "public-goods-free-riding" },
  { word: "FREE", definition: "Enjoying a shared good without paying — the free-rider problem.", lessonSlug: "public-goods-free-riding" },
  { word: "INPUTS", definition: "The resources a firm combines to make output.", lessonSlug: "production-and-costs" },
  { word: "DEMANDS", definition: "The quantities buyers want across a range of prices.", lessonSlug: "demand-where-it-comes-from" },
  { word: "PAYOFF", definition: "The reward a player receives from a strategic choice.", lessonSlug: "nash-equilibrium" },
  { word: "STAKES", definition: "What players stand to win or lose in a game.", lessonSlug: "sequential-games" },
] as const;
