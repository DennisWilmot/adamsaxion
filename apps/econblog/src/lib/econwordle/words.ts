/**
 * Econ Wordle answer pool.
 *
 * Curation: genuine economics terms — not intro vocab like supply or demand.
 * Length 4–8 letters, A–Z only. Each word maps to an existing lesson slug.
 */
export interface EconWord {
  /** Answer, A–Z only. Stored uppercase. */
  word: string;
  /** One-line definition shown after the puzzle ends. */
  definition: string;
  /** Vague nudge shown on request after a few guesses. */
  hint: string;
  /** Slug of the lesson that teaches this concept (must exist in the corpus). */
  lessonSlug: string;
}

export const MIN_WORD_LENGTH = 4;
export const MAX_WORD_LENGTH = 8;

export const ECON_WORDS: readonly EconWord[] = [
  { word: "SURPLUS", definition: "The gain to a buyer or seller beyond what they'd accept.", hint: "Think about the extra benefit someone gets from a deal.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "MARGIN", definition: "The effect of one more unit — how economists think at the edge.", hint: "Economists often reason about 'one more' of something.", lessonSlug: "profit-maximization" },
  { word: "UTILITY", definition: "A measure of the satisfaction a person gets from consuming.", hint: "A word for how much someone values what they consume.", lessonSlug: "preferences-and-utility" },
  { word: "ELASTIC", definition: "Quantity that responds strongly to a change in price.", hint: "Describes demand or supply that stretches a lot with price.", lessonSlug: "elasticity" },
  { word: "MONOPOLY", definition: "A market with a single dominant seller.", hint: "A market structure with one firm in charge.", lessonSlug: "monopoly-and-market-power" },
  { word: "RENT", definition: "Payment above what's needed to keep a resource in use — economic rent.", hint: "Extra payment beyond what's needed to keep a resource in use.", lessonSlug: "monopoly-and-market-power" },
  { word: "CARTEL", definition: "A group of firms colluding to raise prices.", hint: "Competitors who quietly agree instead of fighting.", lessonSlug: "repeated-games" },
  { word: "COLLUDE", definition: "To secretly cooperate to limit competition.", hint: "What rivals do when they scheme together in secret.", lessonSlug: "repeated-games" },
  { word: "WELFARE", definition: "Total economic well-being: consumer plus producer surplus.", hint: "A broad measure of how well-off everyone is.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "CEILING", definition: "A legal maximum price, like rent control.", hint: "A legal cap on how high a price can go.", lessonSlug: "supply-and-demand-in-equilibrium" },
  { word: "SCARCITY", definition: "Limited resources against unlimited wants — the core problem.", hint: "The basic problem when wants outrun what's available.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "TRADEOFF", definition: "Giving up one thing to get another.", hint: "You can't have everything — something has to give.", lessonSlug: "budget-constraints-and-tradeoffs" },
  { word: "SUBSIDY", definition: "A government payment that lowers a price or cost.", hint: "Government help that makes something cheaper to buy or produce.", lessonSlug: "tax-incidence" },
  { word: "INSURE", definition: "To pay a premium to transfer risk to another party.", hint: "Paying someone else to bear uncertainty for you.", lessonSlug: "social-insurance" },
  { word: "PREMIUM", definition: "The price paid for insurance coverage.", hint: "What you pay upfront to buy protection against risk.", lessonSlug: "demand-for-health-insurance" },
  { word: "HAZARD", definition: "Extra risk-taking when you're shielded from the consequences.", hint: "A problem when protection makes people take more risks.", lessonSlug: "moral-hazard" },
  { word: "LEMONS", definition: "Low-quality goods that dominate when buyers can't see quality.", hint: "A famous metaphor for hidden quality in used markets.", lessonSlug: "lemons-problem" },
  { word: "SIGNAL", definition: "A costly action that credibly reveals hidden quality.", hint: "Something costly you do to prove you're the real deal.", lessonSlug: "signaling" },
  { word: "SCREEN", definition: "Designing options so people sort themselves by hidden type.", hint: "Designing menus so different types pick different options.", lessonSlug: "screening" },
  { word: "AGENT", definition: "Someone acting on another's behalf, with their own incentives.", hint: "Someone who acts for a principal but has their own goals.", lessonSlug: "principal-agent" },
  { word: "AUCTION", definition: "A sale where buyers bid against one another.", hint: "A sale where people compete by raising their offers.", lessonSlug: "auctions-and-bidding" },
  { word: "NASH", definition: "An outcome where no player can gain by changing alone.", hint: "A famous name attached to a stable game-theory outcome.", lessonSlug: "nash-equilibrium" },
  { word: "DEFECT", definition: "To break cooperation for a short-term gain.", hint: "What you do when you betray the group for yourself.", lessonSlug: "prisoners-dilemma" },
  { word: "THREAT", definition: "A promise to act that only works if it's credible.", hint: "A warning that only matters if people believe you'll follow through.", lessonSlug: "sequential-games" },
  { word: "NUDGE", definition: "A small design tweak that steers choices without forcing them.", hint: "A gentle push in how choices are presented.", lessonSlug: "nudges-choice-architecture" },
  { word: "BIAS", definition: "A systematic, repeatable error in judgment.", hint: "A predictable way people get decisions wrong.", lessonSlug: "biases-in-judgment" },
  { word: "AVERSION", definition: "A strong dislike — as in loss aversion.", hint: "A strong dislike — often paired with 'loss' in behavioral econ.", lessonSlug: "loss-aversion" },
  { word: "DISCOUNT", definition: "To value future payoffs less than present ones.", hint: "Treating tomorrow's rewards as worth less than today's.", lessonSlug: "present-bias" },
  { word: "RATIONAL", definition: "Acting consistently to best achieve one's goals.", hint: "The classical assumption about how people ought to decide.", lessonSlug: "rationality-breaks-down" },
  { word: "RANDOM", definition: "Assigned by chance — which removes selection bias.", hint: "Assigned by chance — key to clean experiments.", lessonSlug: "randomized-experiments" },
  { word: "CONTROL", definition: "The untreated comparison group in an experiment.", hint: "The group in a study that doesn't get the treatment.", lessonSlug: "randomized-experiments" },
  { word: "SAMPLE", definition: "A subset of data used to infer about a population.", hint: "The slice of data you use to learn about the whole.", lessonSlug: "randomized-experiments" },
  { word: "CAUSAL", definition: "Showing that one thing actually produces another.", hint: "The gold standard: proving X actually causes Y.", lessonSlug: "correlation-vs-causation" },
  { word: "VARIABLE", definition: "A measured quantity that changes across observations.", hint: "Something you measure that can differ across people or times.", lessonSlug: "regression" },
  { word: "TARIFF", definition: "A tax on imported goods.", hint: "A tax that hits goods crossing a border.", lessonSlug: "tax-incidence" },
  { word: "RIVAL", definition: "A good one person's use of which reduces another's.", hint: "If I use it, you can't — think private goods.", lessonSlug: "public-goods-free-riding" },
  { word: "PAYOFF", definition: "The reward a player receives from a strategic choice.", hint: "What a player stands to gain from their move.", lessonSlug: "nash-equilibrium" },
  { word: "STAKES", definition: "What players stand to win or lose in a game.", hint: "How much is on the line in a strategic situation.", lessonSlug: "sequential-games" },
  { word: "ADVERSE", definition: "Hidden information that worsens who selects into a deal.", hint: "Often paired with 'selection' — bad types crowd in.", lessonSlug: "adverse-selection" },
  { word: "OMITTED", definition: "A left-out factor that biases an estimated relationship.", hint: "A missing factor that can wreck your regression.", lessonSlug: "omitted-variable-bias" },
  { word: "REGRESS", definition: "To estimate how one variable moves with others.", hint: "A statistical verb for fitting a line to data.", lessonSlug: "regression" },
  { word: "PARETO", definition: "An allocation where no one can gain without someone losing.", hint: "Named after an Italian economist — efficiency without losers.", lessonSlug: "welfare-surplus-efficiency" },
  { word: "GIFFEN", definition: "A good people buy more of as its price rises.", hint: "A paradoxical good — demand rises when price does.", lessonSlug: "income-vs-substitution-effects" },
  { word: "COASE", definition: "Bargaining can fix externalities when property rights are clear.", hint: "A theorem about bargaining and who owns what.", lessonSlug: "market-failures" },
  { word: "SHIRK", definition: "To put in less effort when someone else bears the cost.", hint: "Slacking off when someone else is watching the results.", lessonSlug: "principal-agent" },
  { word: "WEDGE", definition: "The gap a tax opens between what buyers pay and sellers get.", hint: "The gap a tax drives between buyer and seller prices.", lessonSlug: "tax-incidence" },
  { word: "BUNDLE", definition: "Selling goods together when separate pricing would fail.", hint: "Packaging things together instead of selling separately.", lessonSlug: "preferences-and-utility" },
  { word: "INFLATE", definition: "When money loses purchasing power across the economy.", hint: "What happens when prices rise across the whole economy.", lessonSlug: "how-a-currency-dies" },
  { word: "LIQUID", definition: "Easy to convert to cash without moving the price much.", hint: "Easy to sell quickly without crashing the price.", lessonSlug: "capital-wealth-taxation" },
  { word: "EXTERNAL", definition: "A cost or benefit that falls on people outside the transaction.", hint: "Spillovers that hit people not involved in the deal.", lessonSlug: "market-failures" },
  { word: "NONRIVAL", definition: "One person's use doesn't reduce what's left for others.", hint: "My use doesn't stop yours — think public goods.", lessonSlug: "public-goods-free-riding" },
  { word: "LAFFER", definition: "The idea that some tax cuts can raise revenue.", hint: "A curve named after an economist — taxes and revenue.", lessonSlug: "tax-incidence" },
  { word: "SPENCE", definition: "Education as a costly signal of ability in hiring markets.", hint: "A Nobel laureate who linked schooling to signaling.", lessonSlug: "signaling" },
  { word: "PIGOU", definition: "Taxes that make polluters pay for the harm they cause.", hint: "An early thinker on taxing harmful side effects.", lessonSlug: "market-failures" },
  { word: "OPTIMAL", definition: "The best achievable tradeoff given real constraints.", hint: "The best you can do given the rules you're stuck with.", lessonSlug: "optimal-income-taxation" },
  { word: "EVASION", definition: "Illegal steps taken to pay less tax than owed.", hint: "Breaking the rules to shrink your tax bill.", lessonSlug: "behavioral-responses-taxation" },
  { word: "POOLING", definition: "When different types get the same contract or price.", hint: "When unlike types end up on the same deal.", lessonSlug: "screening" },
  { word: "CREDIBLE", definition: "A threat or promise believable enough to change behavior.", hint: "A promise or threat people actually believe you'll keep.", lessonSlug: "sequential-games" },
  { word: "TRIGGER", definition: "A rule that punishes defection to sustain cooperation.", hint: "A punishment rule that keeps repeated games honest.", lessonSlug: "repeated-games" },
  { word: "CURSE", definition: "Winning an auction because you overestimated value.", hint: "Winning might mean you paid too much — a famous auction pitfall.", lessonSlug: "auctions-and-bidding" },
  { word: "PRIVATE", definition: "Values known only to the bidder, not shared by all.", hint: "Information only you know — common in bidding theory.", lessonSlug: "auctions-and-bidding" },
  { word: "RESERVE", definition: "A minimum price the seller won't go below.", hint: "A floor price the seller sets before the sale starts.", lessonSlug: "auctions-and-bidding" },
  { word: "VICKREY", definition: "A sealed-bid auction where the winner pays the second-highest bid.", hint: "An auction format where the winner pays the runner-up's bid.", lessonSlug: "auctions-and-bidding" },
  { word: "SEALED", definition: "Bids submitted in secret before any are revealed.", hint: "Bids written down and hidden until everyone's committed.", lessonSlug: "auctions-and-bidding" },
  { word: "STRATEGY", definition: "A complete plan for how to act in every situation.", hint: "Your full game plan for every move you might face.", lessonSlug: "nash-equilibrium" },
  { word: "DOMINANT", definition: "A strategy that beats every alternative, no matter what.", hint: "A move that's best no matter what the other side does.", lessonSlug: "nash-equilibrium" },
  { word: "MIXED", definition: "Randomizing moves so opponents can't predict you.", hint: "Deliberately randomizing so rivals can't read you.", lessonSlug: "nash-equilibrium" },
  { word: "SUBGAME", definition: "A smaller game inside a larger sequential interaction.", hint: "A piece of a bigger back-and-forth interaction.", lessonSlug: "sequential-games" },
  { word: "BACKWARD", definition: "Solving a game from the last move to the first.", hint: "Start from the end and work your way to the opening move.", lessonSlug: "sequential-games" },
  { word: "FRAMING", definition: "How a choice is worded changes what people pick.", hint: "The same choice, different words — different decisions.", lessonSlug: "biases-in-judgment" },
  { word: "MYOPIA", definition: "Overweighting today relative to the future.", hint: "Short-sightedness about what happens later.", lessonSlug: "present-bias" },
  { word: "COMMIT", definition: "To bind your future self to a plan today.", hint: "Locking yourself in so you can't chicken out later.", lessonSlug: "present-bias" },
  { word: "DEFAULT", definition: "The option people get if they don't actively choose.", hint: "What happens when you do nothing and let the system decide.", lessonSlug: "nudges-choice-architecture" },
  { word: "INERTIA", definition: "Sticking with the status quo because change takes effort.", hint: "Sticking with what you've got because switching is a hassle.", lessonSlug: "nudges-choice-architecture" },
  { word: "SALIENCE", definition: "What grabs attention and drives decisions.", hint: "What jumps out and shapes what people notice.", lessonSlug: "biases-in-judgment" },
  { word: "ANCHOR", definition: "An early number that skews later estimates.", hint: "An early number that warps everything that follows.", lessonSlug: "loss-aversion" },
  { word: "CONFOUND", definition: "A factor that distorts the link between two variables.", hint: "Something else muddying the story between X and Y.", lessonSlug: "correlation-vs-causation" },
  { word: "PLACEBO", definition: "A fake treatment used to isolate real causal effects.", hint: "A sham treatment to see if the real one actually works.", lessonSlug: "randomized-experiments" },
  { word: "ENDOWED", definition: "Valuing something more simply because you already own it.", hint: "You value it more just because it's already yours.", lessonSlug: "loss-aversion" },
  { word: "BELIEF", definition: "What a player thinks others will do in a game.", hint: "What you expect the other players to do.", lessonSlug: "nash-equilibrium" },
  { word: "SHADING", definition: "Understating costs or overstating quality to capture surplus.", hint: "Fudging the numbers to keep a bit more for yourself.", lessonSlug: "mechanism-design" },
  { word: "COMPOUND", definition: "Small biases that stack into large long-run mistakes.", hint: "Little errors that pile up into big problems over time.", lessonSlug: "present-bias" },
] as const;
