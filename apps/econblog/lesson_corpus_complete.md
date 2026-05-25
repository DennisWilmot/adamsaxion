# Economics Platform -- Complete Lesson Corpus v1
## 50 Lessons + Lesson Zero | All attributes for personalized learning paths

---

## SCHEMA

Each lesson includes:
- **id**: Unique lesson number
- **title**: Lesson name
- **slug**: URL-friendly identifier
- **phase**: Which phase/module it belongs to
- **prereqs**: Lesson IDs recommended before this one
- **difficulty**: 1 (accessible) → 5 (advanced)
- **duration_minutes**: Estimated completion time
- **math_level**: none | light | moderate | heavy
- **domain**: micro | macro | empirical | behavioral | applied
- **tags**: Granular topic tags for filtering and recommendations
- **interests**: What kind of learner gravitates toward this (used in onboarding)
- **description**: 2-3 sentence summary for course catalog
- **learning_outcomes**: What the learner can do after completing this lesson
- **real_world_hook**: A concrete example or question that makes this lesson feel urgent
- **assessment_type**: quiz | problem_set | case_analysis | data_exercise | reflection

---

## LESSON ZERO (FREE)

```yaml
id: 0
title: "How a currency dies: Zimbabwe's hyperinflation"
slug: how-a-currency-dies
phase: 0
prereqs: []
difficulty: 1
duration_minutes: 30
math_level: none
domain: macro
tags: [inflation, hyperinflation, monetary-policy, money-supply, government-failure, currency, developing-economies]
interests: [current-events, history, politics, developing-world, money]
description: >
  In 2008, Zimbabwe printed a $100 trillion banknote. This lesson traces exactly how
  a functioning currency collapsed, from political decisions to economic mechanics to
  the human cost. You'll learn the actual mechanism behind hyperinflation, not just
  the headlines.
learning_outcomes:
  - Explain the relationship between money supply, output, and price levels
  - Trace how political incentives can trigger a currency collapse
  - Identify early warning signs of hyperinflationary spirals
  - Distinguish between inflation, high inflation, and hyperinflation
real_world_hook: "Why was a loaf of bread 35 million Zimbabwe dollars? And could it happen anywhere?"
assessment_type: case_analysis
```

---

## PHASE 1: HOW MARKETS WORK

```yaml
id: 1
title: "Budget constraints and tradeoffs"
slug: budget-constraints-and-tradeoffs
phase: 1
prereqs: []
difficulty: 1
duration_minutes: 25
math_level: light
domain: micro
tags: [scarcity, opportunity-cost, budget-constraint, consumer-choice, tradeoffs, foundational]
interests: [personal-finance, decision-making, everyday-economics, fundamentals]
description: >
  Every decision is a tradeoff. This lesson introduces the budget constraint, the most
  fundamental tool in economics for visualizing what's available to you given your
  income and the prices you face. You'll see why opportunity cost, not dollar cost,
  is what economists actually care about.
learning_outcomes:
  - Draw and interpret a budget constraint
  - Calculate opportunity cost in terms of foregone alternatives
  - Explain why "there's no such thing as a free lunch" is a technical claim, not just a saying
  - Predict how changes in income or prices shift the set of available choices
real_world_hook: "You have $50 and two hours. How do you decide what to do tonight?"
assessment_type: problem_set
```

```yaml
id: 2
title: "Preferences and utility"
slug: preferences-and-utility
phase: 1
prereqs: [1]
difficulty: 2
duration_minutes: 30
math_level: light
domain: micro
tags: [utility, preferences, indifference-curves, consumer-theory, rationality, foundational]
interests: [decision-making, psychology, philosophy, fundamentals]
description: >
  Economists model what people want using utility functions and indifference curves.
  This lesson shows how we formalize the idea that people have consistent preferences
  and make choices to maximize their satisfaction. You'll also see the first cracks
  in this assumption, setting up the behavioral economics lessons later.
learning_outcomes:
  - Explain what a utility function represents and what it does not
  - Draw and interpret indifference curves
  - State the assumptions behind rational preferences (completeness, transitivity)
  - Identify situations where these assumptions might break down
real_world_hook: "How much coffee would you give up for one more hour of sleep? You just revealed a preference."
assessment_type: quiz
```

```yaml
id: 3
title: "Demand: where it actually comes from"
slug: demand-where-it-comes-from
phase: 1
prereqs: [1, 2]
difficulty: 2
duration_minutes: 35
math_level: moderate
domain: micro
tags: [demand, consumer-choice, utility-maximization, demand-curve, marginal-utility, foundational]
interests: [business, markets, pricing, fundamentals]
description: >
  Demand curves aren't just lines on a graph you memorize. They emerge from millions
  of individual decisions. This lesson derives demand from first principles: given
  what people want (utility) and what they can afford (budget constraint), what do
  they actually buy? You'll never look at a demand curve the same way.
learning_outcomes:
  - Derive a demand curve from utility maximization subject to a budget constraint
  - Explain why demand curves slope downward using diminishing marginal utility
  - Distinguish between a movement along the demand curve and a shift of the curve
  - Predict how changes in income, prices of related goods, or tastes affect demand
real_world_hook: "Why does the second slice of pizza never taste as good as the first? That's diminishing marginal utility driving your demand curve."
assessment_type: problem_set
```

```yaml
id: 4
title: "Income vs. substitution effects"
slug: income-vs-substitution-effects
phase: 1
prereqs: [3]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: micro
tags: [income-effect, substitution-effect, price-changes, consumer-theory, giffen-goods, slutsky]
interests: [pricing, policy, consumer-behavior, fundamentals]
description: >
  When the price of something changes, two things happen simultaneously: the good
  becomes relatively cheaper or more expensive (substitution effect), and your real
  purchasing power changes (income effect). Separating these two forces explains
  everything from why higher gas prices change driving habits to the rare case where
  raising a price increases demand.
learning_outcomes:
  - Decompose a price change into substitution and income effects
  - Explain why normal goods and inferior goods respond differently to price changes
  - Describe the theoretical conditions for a Giffen good
  - Apply the framework to real policy questions like tax changes
real_world_hook: "When gas prices spike, do people drive less because gas is expensive relative to other things, or because they feel poorer? The answer is both, and the split matters for policy."
assessment_type: problem_set
```

```yaml
id: 5
title: "Production and costs"
slug: production-and-costs
phase: 1
prereqs: [1]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: micro
tags: [production, costs, firms, marginal-cost, economies-of-scale, returns-to-scale, foundational]
interests: [business, entrepreneurship, operations, fundamentals]
description: >
  Firms transform inputs (labor, capital, materials) into outputs. This lesson covers
  production functions, the distinction between fixed and variable costs, and why
  marginal cost, the cost of producing one more unit, is the most important number
  in a firm's decision-making. You'll understand why some industries naturally
  concentrate into a few big players while others stay fragmented.
learning_outcomes:
  - Distinguish between fixed costs, variable costs, and marginal cost
  - Explain diminishing marginal returns and why they arise
  - Draw and interpret short-run and long-run cost curves
  - Identify whether a firm exhibits economies or diseconomies of scale
real_world_hook: "Why can Netflix serve 250 million subscribers but your local restaurant struggles past 100 covers a night? The cost structure is fundamentally different."
assessment_type: problem_set
```

```yaml
id: 6
title: "Profit maximization"
slug: profit-maximization
phase: 1
prereqs: [5]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: micro
tags: [profit, firms, marginal-revenue, marginal-cost, supply, firm-behavior, foundational]
interests: [business, entrepreneurship, strategy, fundamentals]
description: >
  Every firm faces the same core question: how much should I produce? The answer is
  deceptively simple: produce until the cost of making one more unit equals the revenue
  from selling it. This lesson formalizes that logic and shows why it holds regardless
  of market structure, industry, or firm size.
learning_outcomes:
  - State and apply the profit-maximization rule (MR = MC)
  - Determine a firm's optimal output given cost and revenue information
  - Identify conditions under which a firm should shut down vs. continue operating at a loss
  - Derive a firm's supply curve from its marginal cost curve
real_world_hook: "Should your business take one more client? Hire one more person? The MR = MC rule gives you the exact answer."
assessment_type: problem_set
```

```yaml
id: 7
title: "Perfect competition"
slug: perfect-competition
phase: 1
prereqs: [3, 6]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: micro
tags: [competition, markets, price-taking, long-run-equilibrium, market-structure, foundational]
interests: [markets, business, agriculture, commodities, fundamentals]
description: >
  Perfect competition is the benchmark economists use to evaluate all other market
  structures. When many firms sell identical products and no one has market power,
  prices get driven to the minimum possible cost. This lesson builds the model and
  explains why perfectly competitive firms earn zero economic profit in the long run,
  and why that's actually a good thing.
learning_outcomes:
  - List and explain the assumptions behind perfect competition
  - Show how a price-taking firm decides how much to produce
  - Explain why long-run economic profit is zero under perfect competition
  - Distinguish economic profit from accounting profit
real_world_hook: "Wheat farmers can't set their own prices. Why not? And why does understanding this explain so much about how markets work?"
assessment_type: quiz
```

```yaml
id: 8
title: "Monopoly and market power"
slug: monopoly-and-market-power
phase: 1
prereqs: [6]
difficulty: 2
duration_minutes: 35
math_level: moderate
domain: micro
tags: [monopoly, market-power, deadweight-loss, pricing, antitrust, market-structure]
interests: [business, tech, regulation, competition, policy]
description: >
  When a single firm dominates a market, it can set prices above competitive levels,
  producing less and charging more. This lesson builds the monopoly model, introduces
  deadweight loss (the economic value destroyed by market power), and sets up the
  entire field of antitrust economics. You'll understand why economists obsess over
  market concentration.
learning_outcomes:
  - Explain why a monopolist's marginal revenue is below its price
  - Calculate monopoly price, quantity, and profit
  - Measure deadweight loss from monopoly pricing
  - Evaluate arguments for and against breaking up monopolies
real_world_hook: "Is Google a monopoly? What about your local cable company? This lesson gives you the framework to answer precisely."
assessment_type: case_analysis
```

```yaml
id: 9
title: "Supply and demand in equilibrium"
slug: supply-and-demand-in-equilibrium
phase: 1
prereqs: [3, 7]
difficulty: 2
duration_minutes: 30
math_level: light
domain: micro
tags: [equilibrium, supply-demand, market-clearing, price-mechanism, shortages, surpluses, foundational]
interests: [markets, current-events, policy, fundamentals]
description: >
  This is the lesson most people think they already understand but don't. Equilibrium
  isn't just "where the lines cross." It's a dynamic process where prices adjust to
  eliminate shortages and surpluses. This lesson makes that precise and shows you how
  to use supply and demand to predict the effect of any market intervention.
learning_outcomes:
  - Define market equilibrium precisely and explain the adjustment mechanism
  - Predict the effect of demand or supply shifts on price and quantity
  - Analyze the impact of price floors, price ceilings, and quotas
  - Explain why shortages and surpluses are self-correcting in free markets
real_world_hook: "Why did hand sanitizer prices spike in March 2020? Why did rent control in San Francisco make housing harder to find? Same framework answers both."
assessment_type: problem_set
```

```yaml
id: 10
title: "Elasticity: the most useful number in economics"
slug: elasticity
phase: 1
prereqs: [3, 9]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: micro
tags: [elasticity, price-sensitivity, revenue, taxation, demand-elasticity, supply-elasticity, foundational]
interests: [business, pricing, policy, taxation, fundamentals]
description: >
  Elasticity measures how responsive quantity is to a change in price, income, or the
  price of another good. It's the single most useful number in applied economics because
  it determines who bears the burden of a tax, whether a price increase raises or lowers
  revenue, and how sensitive markets are to policy changes. Every policy debate eventually
  comes down to an elasticity.
learning_outcomes:
  - Calculate price elasticity of demand and supply
  - Explain why elasticity, not slope, is the right measure of responsiveness
  - Predict whether a price increase raises or lowers total revenue
  - Apply elasticity to determine tax incidence
real_world_hook: "If a city raises the cigarette tax by $1, how much does smoking actually fall? The answer is an elasticity, and it determines whether the tax works."
assessment_type: problem_set
```

```yaml
id: 11
title: "Welfare: surplus, efficiency, and the case for markets"
slug: welfare-surplus-efficiency
phase: 1
prereqs: [9, 10]
difficulty: 2
duration_minutes: 35
math_level: moderate
domain: micro
tags: [welfare, consumer-surplus, producer-surplus, efficiency, pareto, market-efficiency, foundational]
interests: [policy, philosophy, justice, markets, fundamentals]
description: >
  How do we measure whether a market outcome is "good"? Economists use consumer surplus
  and producer surplus to quantify the gains from trade, and Pareto efficiency to define
  what "optimal" means. This lesson builds the welfare framework, proves why competitive
  markets maximize total surplus, and immediately shows you when that result breaks down.
learning_outcomes:
  - Calculate consumer surplus and producer surplus from supply and demand diagrams
  - Define Pareto efficiency and explain the First Welfare Theorem
  - Measure the welfare cost of market distortions (taxes, monopoly, price controls)
  - Articulate the limits of surplus as a welfare measure (distribution, equity)
real_world_hook: "A new highway saves commuters 20 minutes but displaces 50 families. Is that efficient? This lesson gives you the tools to answer, and to see what those tools miss."
assessment_type: case_analysis
```

```yaml
id: 12
title: "When markets fail: externalities and public goods"
slug: market-failures
phase: 1
prereqs: [11]
difficulty: 2
duration_minutes: 35
math_level: light
domain: micro
tags: [externalities, public-goods, market-failure, government-intervention, pigouvian-tax, free-rider, climate, foundational]
interests: [environment, policy, climate, regulation, public-interest]
description: >
  Markets don't always get it right. When your actions impose costs or benefits on others
  (externalities), or when goods are non-excludable and non-rival (public goods), the
  invisible hand fails. This lesson is the economic foundation for every environmental
  regulation, public health mandate, and infrastructure investment ever proposed.
learning_outcomes:
  - Define positive and negative externalities with real examples
  - Explain why externalities cause markets to over- or under-produce
  - Describe the free-rider problem and why public goods are under-provided
  - Evaluate solutions: Pigouvian taxes, cap-and-trade, regulation, Coase bargaining
real_world_hook: "Why doesn't the market solve climate change on its own? This lesson gives you the precise economic answer."
assessment_type: case_analysis
```

---

## PHASE 2: STRATEGIC THINKING

```yaml
id: 13
title: "Strategic interaction and Nash equilibrium"
slug: nash-equilibrium
phase: 2
prereqs: [1, 2]
difficulty: 2
duration_minutes: 35
math_level: light
domain: micro
tags: [game-theory, nash-equilibrium, strategy, strategic-interaction, dominant-strategy, foundational]
interests: [strategy, competition, politics, negotiation, sports]
description: >
  In most real situations, your best choice depends on what everyone else does. Game
  theory formalizes this. This lesson introduces the strategic form game and Nash
  equilibrium, the concept that won John Nash a Nobel Prize. You'll learn to find
  equilibria in any strategic situation and understand why individually rational
  choices can lead to collectively terrible outcomes.
learning_outcomes:
  - Set up a strategic form game with players, strategies, and payoffs
  - Identify dominant and dominated strategies
  - Find Nash equilibria in simple games
  - Explain why Nash equilibrium doesn't mean "best outcome"
real_world_hook: "Two gas stations across the street from each other. How do they set prices? That's a game, and Nash equilibrium tells you exactly what happens."
assessment_type: problem_set
```

```yaml
id: 14
title: "The prisoner's dilemma and cooperation problems"
slug: prisoners-dilemma
phase: 2
prereqs: [13]
difficulty: 2
duration_minutes: 30
math_level: light
domain: micro
tags: [prisoners-dilemma, cooperation, defection, collective-action, tragedy-of-commons, game-theory]
interests: [politics, environment, international-relations, teamwork, society]
description: >
  The prisoner's dilemma is the most famous game in economics. Two players are both
  better off cooperating, but each has an individual incentive to defect. This structure
  shows up everywhere: arms races, climate agreements, price wars, team projects.
  Understanding it is understanding why groups of rational people produce irrational
  collective outcomes.
learning_outcomes:
  - Identify the prisoner's dilemma structure in real-world situations
  - Explain why mutual defection is the Nash equilibrium despite being collectively worse
  - Connect the prisoner's dilemma to the tragedy of the commons
  - Evaluate institutional solutions to cooperation problems
real_world_hook: "Why do countries agree to cut emissions at summits and then not do it? It's a prisoner's dilemma played by 195 governments."
assessment_type: case_analysis
```

```yaml
id: 15
title: "Sequential games and credible threats"
slug: sequential-games
phase: 2
prereqs: [13]
difficulty: 3
duration_minutes: 35
math_level: light
domain: micro
tags: [sequential-games, backward-induction, credible-threats, commitment, subgame-perfection, game-theory]
interests: [strategy, negotiation, business, politics, law]
description: >
  Not all games happen simultaneously. When players move in sequence, the order matters
  and threats only work if they're credible. This lesson introduces game trees, backward
  induction, and the concept of credible vs. incredible threats. You'll see why burning
  your ships, like Cortés, is sometimes the smartest strategic move.
learning_outcomes:
  - Draw and solve extensive-form (sequential) games using backward induction
  - Distinguish between credible and non-credible threats
  - Explain why commitment devices increase bargaining power
  - Apply sequential game logic to business entry deterrence and negotiation
real_world_hook: "A CEO threatens to match any competitor's price. Is that credible? If not, it changes the entire competitive dynamic."
assessment_type: problem_set
```

```yaml
id: 16
title: "Repeated games: how cooperation emerges"
slug: repeated-games
phase: 2
prereqs: [14, 15]
difficulty: 3
duration_minutes: 30
math_level: light
domain: micro
tags: [repeated-games, cooperation, reputation, tit-for-tat, punishment, folk-theorem, game-theory]
interests: [relationships, business, international-relations, trust, society]
description: >
  The prisoner's dilemma has a different outcome when you play it repeatedly. If people
  interact over and over, reputation and punishment can sustain cooperation. This lesson
  explains why long-term relationships produce better outcomes than one-shot interactions,
  and why the threat of future retaliation keeps people honest.
learning_outcomes:
  - Explain how repetition changes the equilibrium of the prisoner's dilemma
  - Describe tit-for-tat and other strategies that sustain cooperation
  - State the folk theorem and what it implies about repeated games
  - Identify why end-game effects undermine cooperation in finite games
real_world_hook: "Why do businesses honor warranties even when cheating would be more profitable? Because they'll see you again. That's the repeated game logic."
assessment_type: quiz
```

```yaml
id: 17
title: "Auctions and bidding strategy"
slug: auctions-and-bidding
phase: 2
prereqs: [13]
difficulty: 3
duration_minutes: 30
math_level: moderate
domain: micro
tags: [auctions, mechanism-design, bidding, revenue-equivalence, winners-curse, market-design]
interests: [business, art, real-estate, tech, advertising, procurement]
description: >
  Auctions are everywhere: eBay, Google ads, government spectrum sales, art houses,
  construction contracts. This lesson covers the four main auction formats, optimal
  bidding strategies, the winner's curse, and the surprising result that very different
  auction designs can generate the same expected revenue.
learning_outcomes:
  - Describe the four standard auction types (English, Dutch, first-price sealed, second-price sealed)
  - Derive the optimal bidding strategy in a second-price auction
  - Explain the winner's curse and when it arises
  - State the revenue equivalence theorem and its practical limitations
real_world_hook: "Every time you Google something, an auction runs in milliseconds to decide which ads you see. Understanding auction design is understanding the internet's business model."
assessment_type: problem_set
```

```yaml
id: 18
title: "Information asymmetry: the lemons problem"
slug: lemons-problem
phase: 2
prereqs: [7, 13]
difficulty: 2
duration_minutes: 30
math_level: light
domain: micro
tags: [asymmetric-information, lemons, adverse-selection, market-failure, information, akerlof, foundational]
interests: [markets, consumer-protection, insurance, used-cars, trust]
description: >
  George Akerlof's "market for lemons" is one of the most important papers in economics.
  When sellers know more about product quality than buyers, the market can unravel entirely:
  good products get driven out by bad ones. This insight explains everything from why used
  cars are cheap to why health insurance markets struggle without mandates.
learning_outcomes:
  - Explain the lemons problem using Akerlof's used car example
  - Show how information asymmetry leads to market unraveling
  - Identify the lemons dynamic in insurance, labor, and financial markets
  - Describe market responses: warranties, certifications, regulation
real_world_hook: "Why is a brand-new car worth 20% less the moment you drive it off the lot? Akerlof's answer won him the Nobel Prize."
assessment_type: case_analysis
```

---

## PHASE 3: THE INFORMATION PROBLEM

```yaml
id: 19
title: "Moral hazard"
slug: moral-hazard
phase: 3
prereqs: [18]
difficulty: 3
duration_minutes: 35
math_level: light
domain: micro
tags: [moral-hazard, insurance, incentives, hidden-action, risk-taking, information-economics]
interests: [insurance, banking, regulation, finance, healthcare]
description: >
  When you're insured, you take more risks. When your boss can't see what you're doing,
  you slack off. Moral hazard is the universal problem of hidden action: one party changes
  their behavior because the other party bears the cost. This lesson formalizes it and
  shows why every insurance contract, employment agreement, and bailout has to wrestle
  with this tradeoff.
learning_outcomes:
  - Define moral hazard and distinguish it from adverse selection
  - Explain why full insurance is almost never optimal
  - Identify moral hazard in insurance, employment, banking, and government policy
  - Describe contractual solutions: deductibles, monitoring, performance pay
real_world_hook: "Did bailing out the banks in 2008 encourage them to take bigger risks next time? That's the moral hazard question at the center of the debate."
assessment_type: case_analysis
```

```yaml
id: 20
title: "Adverse selection deep dive"
slug: adverse-selection
phase: 3
prereqs: [18]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: micro
tags: [adverse-selection, insurance, screening, market-unraveling, death-spiral, information-economics]
interests: [insurance, healthcare, policy, markets]
description: >
  Building on the lemons problem, this lesson goes deep into adverse selection: what
  happens when the people most likely to buy insurance are the ones who need it most.
  You'll trace the death spiral mechanism, understand why insurers are obsessed with
  risk pools, and see why the ACA's individual mandate was an economic solution to
  an information problem.
learning_outcomes:
  - Model adverse selection mathematically with a simple insurance market
  - Trace the death spiral mechanism step by step
  - Explain risk pooling and community rating
  - Evaluate policy responses: mandates, subsidies, risk adjustment
real_world_hook: "Why did health insurance premiums spike when healthy young people opted out of the ACA exchanges? You're about to learn exactly why."
assessment_type: problem_set
```

```yaml
id: 21
title: "Signaling: costly proof"
slug: signaling
phase: 3
prereqs: [18, 13]
difficulty: 3
duration_minutes: 30
math_level: moderate
domain: micro
tags: [signaling, spence, education, costly-signals, separating-equilibrium, information-economics]
interests: [education, career, branding, marketing, hiring]
description: >
  If you can't directly observe someone's ability, how do you infer it? Michael Spence's
  answer: look at what costly actions they've taken. A college degree might not teach you
  anything useful, but the fact that you endured four years of it signals that you're
  the kind of person who can. This lesson builds the signaling model and changes how
  you think about education, branding, and status.
learning_outcomes:
  - Build Spence's job market signaling model from scratch
  - Distinguish separating and pooling equilibria
  - Explain why signals must be costly to be credible
  - Apply signaling logic to education, warranties, advertising, and luxury goods
real_world_hook: "Is a college degree valuable because of what you learn, or because of what it proves about you? Spence's model says the answer might make you uncomfortable."
assessment_type: case_analysis
```

```yaml
id: 22
title: "Screening: sorting without seeing"
slug: screening
phase: 3
prereqs: [20, 21]
difficulty: 3
duration_minutes: 30
math_level: moderate
domain: micro
tags: [screening, self-selection, menu-of-contracts, price-discrimination, information-economics]
interests: [business, insurance, product-design, strategy]
description: >
  Screening is the flip side of signaling. Instead of the informed party sending a
  signal, the uninformed party designs a menu of options that gets people to reveal
  their type through their choices. Every time an airline offers economy vs. business
  class, or an insurer offers high-deductible vs. low-deductible plans, they're
  screening you.
learning_outcomes:
  - Distinguish screening from signaling and explain who moves first
  - Design a menu of contracts that induces self-selection
  - Explain why the "no distortion at the top" result holds
  - Identify screening mechanisms in insurance, airlines, telecom, and education
real_world_hook: "Why do airlines make economy seats deliberately uncomfortable? It's not cruelty. It's a screening mechanism designed to make you reveal how much you're willing to pay."
assessment_type: problem_set
```

```yaml
id: 23
title: "Principal-agent problems"
slug: principal-agent
phase: 3
prereqs: [19]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: micro
tags: [principal-agent, incentives, contracting, compensation, moral-hazard, management, information-economics]
interests: [management, leadership, compensation, governance, entrepreneurship]
description: >
  A principal (owner, shareholder, voter) hires an agent (manager, CEO, politician) to
  act on their behalf. But the agent has their own interests. This lesson formalizes
  the fundamental tension in every employment, governance, and delegation relationship,
  and shows how contract design can partially align incentives.
learning_outcomes:
  - Set up a principal-agent model with hidden action
  - Derive the tradeoff between risk-sharing and incentive provision
  - Explain why flat salaries reduce effort and pure commissions increase risk
  - Evaluate real compensation structures through the principal-agent lens
real_world_hook: "Should your CEO's pay be tied to the stock price? This lesson explains why the answer isn't as obvious as it seems."
assessment_type: case_analysis
```

```yaml
id: 24
title: "Mechanism design: engineering outcomes"
slug: mechanism-design
phase: 3
prereqs: [17, 22, 23]
difficulty: 4
duration_minutes: 40
math_level: moderate
domain: micro
tags: [mechanism-design, incentive-compatibility, revelation-principle, market-design, institutions, information-economics]
interests: [policy, tech, market-design, institutions, governance]
description: >
  Traditional economics asks: given the rules, what happens? Mechanism design flips
  it: given the outcome you want, what rules should you set? This is the economics
  behind organ donation matching, school choice algorithms, spectrum auctions, and
  kidney exchanges. It's where economics becomes engineering.
learning_outcomes:
  - State the revelation principle and explain its significance
  - Define incentive compatibility and individual rationality constraints
  - Explain the Vickrey-Clarke-Groves mechanism for public goods
  - Describe real-world applications in matching markets and auction design
real_world_hook: "How does New York City assign 80,000 students to high schools in a way that's fair and efficient? An economist designed the algorithm."
assessment_type: problem_set
```

---

## PHASE 4: READING THE EVIDENCE

```yaml
id: 25
title: "Correlation vs. causation (for real this time)"
slug: correlation-vs-causation
phase: 4
prereqs: []
difficulty: 1
duration_minutes: 25
math_level: none
domain: empirical
tags: [causality, correlation, confounding, counterfactual, empirical-methods, foundational]
interests: [research, data, critical-thinking, media-literacy, science]
description: >
  Everyone says "correlation isn't causation." Almost nobody can explain precisely why,
  or what you'd need to establish causation. This lesson introduces the counterfactual
  framework: to know if X causes Y, you need to know what would have happened without X.
  Since you can never observe the counterfactual directly, all of empirical economics is
  about clever ways to approximate it.
learning_outcomes:
  - Define the counterfactual and explain why it's unobservable
  - Identify confounding variables in real examples
  - Explain why "controlling for" variables doesn't always solve the problem
  - Articulate the fundamental problem of causal inference
real_world_hook: "Countries with more chocolate consumption win more Nobel Prizes. Should Jamaica start importing Cadbury? Obviously not. But can you explain precisely why not?"
assessment_type: quiz
```

```yaml
id: 26
title: "Randomized experiments: the gold standard"
slug: randomized-experiments
phase: 4
prereqs: [25]
difficulty: 2
duration_minutes: 30
math_level: light
domain: empirical
tags: [rct, experiments, randomization, treatment-effect, control-group, empirical-methods]
interests: [research, public-health, policy, development, medicine]
description: >
  Randomization solves the fundamental problem of causal inference by making the treatment
  and control groups identical on average. This lesson covers how RCTs work, why they're
  the gold standard, and where they fall short: ethical constraints, external validity,
  compliance problems, and cost.
learning_outcomes:
  - Explain why randomization balances observed and unobserved confounders
  - Interpret the average treatment effect (ATE)
  - Identify threats to RCT validity: attrition, noncompliance, spillovers
  - Evaluate when RCTs are feasible and when alternative methods are needed
real_world_hook: "A charity wants to know if giving laptops to students improves test scores. You just design the experiment. How?"
assessment_type: data_exercise
```

```yaml
id: 27
title: "Regression: what it actually does"
slug: regression
phase: 4
prereqs: [25]
difficulty: 2
duration_minutes: 40
math_level: moderate
domain: empirical
tags: [regression, ols, conditional-mean, prediction, empirical-methods, foundational]
interests: [data, research, business-analytics, social-science]
description: >
  Regression is the most used tool in empirical economics. This lesson explains what
  OLS regression actually computes (the best linear predictor of Y given X), when it
  estimates a causal effect and when it doesn't, and how to interpret coefficients
  correctly. Most people who "know regression" can't explain what the coefficient
  actually means. You will.
learning_outcomes:
  - Explain OLS as minimizing the sum of squared residuals
  - Interpret regression coefficients in levels, logs, and with interactions
  - Distinguish between prediction and causal inference using regression
  - Read and critically evaluate a regression table from an academic paper
real_world_hook: "A study says every year of education adds $5,000 to your salary. What exactly does that number mean, and should you believe it?"
assessment_type: data_exercise
```

```yaml
id: 28
title: "Omitted variable bias"
slug: omitted-variable-bias
phase: 4
prereqs: [27]
difficulty: 3
duration_minutes: 30
math_level: moderate
domain: empirical
tags: [ovb, bias, confounding, endogeneity, controls, empirical-methods]
interests: [research, critical-thinking, data, policy-evaluation]
description: >
  The single most important threat to causal inference in observational data. If a
  variable affects both your X and your Y and you don't include it in the regression,
  your estimate is biased. This lesson teaches you to sign the bias (is the estimate
  too high or too low?), which is the most useful analytical skill in applied economics.
learning_outcomes:
  - State the omitted variable bias formula and sign the bias
  - Identify likely omitted variables in real research designs
  - Explain why "just add more controls" doesn't always fix the problem
  - Use the bias framework to evaluate published research claims
real_world_hook: "A study finds that hospital patients who get a specific treatment die more often. Is the treatment deadly, or are sicker patients more likely to get it? That's OVB."
assessment_type: problem_set
```

```yaml
id: 29
title: "Natural experiments and instrumental variables"
slug: instrumental-variables
phase: 4
prereqs: [26, 28]
difficulty: 3
duration_minutes: 40
math_level: moderate
domain: empirical
tags: [instrumental-variables, natural-experiments, endogeneity, causal-inference, two-stage, empirical-methods]
interests: [research, policy-evaluation, history, clever-methods]
description: >
  When you can't randomize, sometimes nature or policy does it for you. A draft lottery,
  a policy cutoff, a geographic boundary. Instrumental variables exploit these "natural
  experiments" to isolate causal effects. This lesson covers the logic, the two conditions
  an instrument must satisfy, and famous applications from economics research.
learning_outcomes:
  - Explain the logic of instrumental variables in intuitive terms
  - State the two conditions for a valid instrument (relevance and exclusion)
  - Walk through classic IV examples (draft lottery, distance to college, rainfall)
  - Interpret the local average treatment effect (LATE)
real_world_hook: "Does serving in the military hurt your earnings? You can't randomly assign people to war. But the Vietnam draft lottery did something close."
assessment_type: case_analysis
```

```yaml
id: 30
title: "Difference-in-differences"
slug: difference-in-differences
phase: 4
prereqs: [27, 26]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: empirical
tags: [diff-in-diff, parallel-trends, policy-evaluation, natural-experiments, causal-inference, empirical-methods]
interests: [policy-evaluation, regulation, labor-policy, healthcare-policy]
description: >
  Difference-in-differences compares the change in outcome for a treated group to the
  change for a control group. It's the workhorse of policy evaluation: minimum wage
  studies, health insurance expansions, environmental regulations. This lesson covers
  the method, the critical parallel trends assumption, and how to spot violations.
learning_outcomes:
  - Set up a difference-in-differences estimator with a 2x2 table
  - State and evaluate the parallel trends assumption
  - Interpret diff-in-diff coefficients from regression output
  - Identify settings where diff-in-diff is and isn't appropriate
real_world_hook: "New Jersey raised its minimum wage. Pennsylvania didn't. Card and Krueger compared fast food employment in both states. The result changed the field."
assessment_type: data_exercise
```

```yaml
id: 31
title: "Regression discontinuity"
slug: regression-discontinuity
phase: 4
prereqs: [27, 26]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: empirical
tags: [rdd, discontinuity, cutoff, causal-inference, quasi-experimental, empirical-methods]
interests: [education-policy, voting, eligibility-rules, policy-evaluation]
description: >
  Many policies kick in at arbitrary cutoffs: test score thresholds, age limits, income
  caps. People just above and just below the cutoff are essentially identical except
  for the treatment. Regression discontinuity exploits this to estimate causal effects
  with almost experimental credibility. It's the closest thing to an RCT you can get
  without actually randomizing.
learning_outcomes:
  - Explain the logic of sharp regression discontinuity designs
  - Distinguish sharp and fuzzy RD designs
  - Identify the key assumption (no manipulation at the cutoff)
  - Interpret RD estimates and their local nature
real_world_hook: "Students who score 64 on an exam fail. Students who score 65 pass. Are those students really different? RD says no, and uses that to measure the effect of passing."
assessment_type: data_exercise
```

```yaml
id: 32
title: "How to read an empirical paper"
slug: how-to-read-empirical-paper
phase: 4
prereqs: [28, 29, 30, 31]
difficulty: 3
duration_minutes: 40
math_level: light
domain: empirical
tags: [research-literacy, critical-reading, methodology, academic-papers, peer-review, empirical-methods]
interests: [research, academia, critical-thinking, media-literacy, policy]
description: >
  This is the capstone of the empirical block. You now know the methods. This lesson
  teaches you how to read a real economics paper efficiently and critically: how to
  find the identification strategy, evaluate the threats, judge the robustness checks,
  and form your own view on whether the conclusions are warranted. You'll practice on
  a real published paper.
learning_outcomes:
  - Navigate the structure of an empirical economics paper efficiently
  - Identify the paper's identification strategy and key assumptions
  - Evaluate internal validity threats using the OVB and causal inference frameworks
  - Articulate a reasoned judgment on whether the findings are credible
real_world_hook: "A politician cites a study that supports their policy. A lobbyist cites one that contradicts it. After this lesson, you can read both and decide who's right."
assessment_type: case_analysis
```

```yaml
id: 33
title: "Statistical significance and its discontents"
slug: statistical-significance
phase: 4
prereqs: [27]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: empirical
tags: [p-values, significance, hypothesis-testing, replication-crisis, statistical-power, empirical-methods]
interests: [research, media-literacy, critical-thinking, science, data]
description: >
  "The result was statistically significant" is the most misunderstood phrase in science.
  This lesson explains what p-values actually measure, why the 0.05 threshold is arbitrary,
  what statistical power means, and why the replication crisis has shaken confidence in
  published findings. You'll never read a "studies show" claim the same way.
learning_outcomes:
  - Define a p-value correctly (and identify common misinterpretations)
  - Explain Type I and Type II errors and the power of a test
  - Describe the replication crisis and p-hacking
  - Evaluate whether a "statistically significant" result is practically meaningful
real_world_hook: "A study with p = 0.04 gets published. A replication with p = 0.06 doesn't. Are we sure the first one was right?"
assessment_type: quiz
```

---

## PHASE 5: THE STATE AND THE ECONOMY

```yaml
id: 34
title: "Tax incidence: who actually pays"
slug: tax-incidence
phase: 5
prereqs: [9, 10]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: applied
tags: [taxation, incidence, elasticity, burden, policy, public-economics]
interests: [taxation, policy, business, fairness, politics]
description: >
  Politicians argue about whether to tax workers or employers, buyers or sellers. Economics
  shows it often doesn't matter: the burden falls on whoever is less able to adjust.
  This lesson uses elasticity to determine who really pays a tax, regardless of who
  writes the check.
learning_outcomes:
  - Explain why legal and economic incidence differ
  - Use elasticity to determine who bears the burden of a tax
  - Show that a tax on buyers and a tax on sellers produce the same outcome
  - Apply tax incidence analysis to payroll taxes, sales taxes, and tariffs
real_world_hook: "Your employer pays half your Social Security tax. Or do they? This lesson shows why you're probably paying all of it."
assessment_type: problem_set
```

```yaml
id: 35
title: "Deadweight loss: the hidden cost of taxes"
slug: deadweight-loss
phase: 5
prereqs: [11, 34]
difficulty: 2
duration_minutes: 30
math_level: moderate
domain: applied
tags: [deadweight-loss, efficiency, taxation, distortion, welfare-loss, public-economics]
interests: [taxation, policy, efficiency, government]
description: >
  Every tax that changes behavior creates a deadweight loss: economic value that
  neither the buyer, the seller, nor the government captures. This lesson quantifies
  that loss, shows why it grows with the square of the tax rate, and explains the
  deep tradeoff between raising revenue and minimizing economic distortion.
learning_outcomes:
  - Calculate deadweight loss from a tax using supply and demand
  - Explain why deadweight loss grows with the square of the tax rate
  - State the Ramsey rule for efficient taxation
  - Evaluate the efficiency argument for broad-based, low-rate taxes
real_world_hook: "A 10% tax creates a certain amount of waste. A 20% tax doesn't create twice as much. It creates four times as much. Why?"
assessment_type: problem_set
```

```yaml
id: 36
title: "Optimal income taxation"
slug: optimal-income-taxation
phase: 5
prereqs: [35, 10]
difficulty: 4
duration_minutes: 40
math_level: moderate
domain: applied
tags: [optimal-taxation, mirrlees, equity-efficiency, marginal-tax-rate, redistribution, public-economics]
interests: [inequality, policy, taxation, redistribution, fairness]
description: >
  What should the tax schedule look like? How high should the top rate be? The Mirrlees
  model formalizes this as a tradeoff: higher taxes fund redistribution but discourage
  work. This lesson walks through the economics of optimal tax design, including the
  surprising result about what the top marginal rate should be.
learning_outcomes:
  - Frame the optimal income tax problem as an equity-efficiency tradeoff
  - Explain the role of the elasticity of taxable income in setting rates
  - Describe the Mirrlees framework and its key assumptions
  - Interpret debates about top marginal tax rates using the model
real_world_hook: "Should the top tax rate be 30%? 50%? 70%? This isn't a political question. There's an actual formula, and the answer depends on one number."
assessment_type: case_analysis
```

```yaml
id: 37
title: "Behavioral responses to taxation"
slug: behavioral-responses-taxation
phase: 5
prereqs: [36, 10]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: applied
tags: [elasticity, tax-response, labor-supply, taxable-income, evasion, avoidance, public-economics]
interests: [taxation, labor, policy, behavioral-response]
description: >
  The optimal tax rate depends on how much people change their behavior in response.
  Do they work less? Shift income to other forms? Move to lower-tax jurisdictions?
  This lesson surveys the empirical evidence on behavioral responses to taxation,
  covering labor supply elasticities, the elasticity of taxable income, and the
  distinction between real responses and accounting games.
learning_outcomes:
  - Distinguish between labor supply responses and taxable income responses
  - Summarize the empirical evidence on how taxes affect work decisions
  - Explain the difference between real economic responses and avoidance/evasion
  - Evaluate claims about tax-driven migration and capital flight
real_world_hook: "When France raised its top tax rate, did rich people actually leave? The evidence might surprise you."
assessment_type: data_exercise
```

```yaml
id: 38
title: "Capital and wealth taxation"
slug: capital-wealth-taxation
phase: 5
prereqs: [34, 35]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: applied
tags: [wealth-tax, capital-taxation, inheritance, capital-gains, piketty, inequality, public-economics]
interests: [inequality, wealth, policy, investment, politics]
description: >
  Should we tax wealth directly? Capital gains? Inheritance? This lesson covers the
  economic arguments on all sides: the efficiency costs of discouraging savings and
  investment, the equity case for taxing concentrated wealth, the administrative challenges,
  and the empirical evidence from countries that have tried wealth taxes.
learning_outcomes:
  - Distinguish between taxes on income, capital gains, wealth, and inheritance
  - Explain the Atkinson-Stiglitz argument against capital taxation
  - Present the counter-arguments for wealth taxation (Piketty, Saez, Zucman)
  - Evaluate real-world wealth tax experiments and their outcomes
real_world_hook: "Elon Musk's net worth can swing $20 billion in a day. Should that be taxed? How would you even do it?"
assessment_type: case_analysis
```

```yaml
id: 39
title: "The economics of social insurance"
slug: social-insurance
phase: 5
prereqs: [12, 19, 20]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: applied
tags: [social-insurance, unemployment, disability, insurance, moral-hazard, adverse-selection, public-economics]
interests: [social-policy, welfare, safety-nets, labor, government]
description: >
  Why does the government provide insurance for unemployment, disability, health, and
  old age rather than leaving it to private markets? This lesson brings together market
  failures (adverse selection, moral hazard) and equity concerns to build the economic
  case for social insurance, then examines the design challenges.
learning_outcomes:
  - Explain why private insurance markets fail for certain risks
  - Articulate the tradeoff between insurance provision and moral hazard
  - Describe the Baily-Chetty formula for optimal unemployment insurance
  - Compare universal vs. means-tested program designs
real_world_hook: "Why can't you buy private unemployment insurance? The answer involves every information problem we've studied so far."
assessment_type: case_analysis
```

```yaml
id: 40
title: "Social security: design and debates"
slug: social-security
phase: 5
prereqs: [39]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: applied
tags: [social-security, pensions, aging, pay-as-you-go, retirement, fiscal-policy, public-economics]
interests: [retirement, aging, fiscal-policy, intergenerational, politics]
description: >
  Social Security is the largest government program in most developed countries. This
  lesson covers how pay-as-you-go systems work, why demographic change threatens their
  sustainability, and the economic tradeoffs involved in reform proposals: raising the
  retirement age, cutting benefits, increasing taxes, or switching to funded accounts.
learning_outcomes:
  - Explain the difference between pay-as-you-go and funded pension systems
  - Show how demographic shifts affect system solvency
  - Evaluate the economic arguments for privatization and against it
  - Analyze the intergenerational equity dimensions of pension reform
real_world_hook: "Will Social Security be there when you retire? The math says it depends on decisions being made right now."
assessment_type: case_analysis
```

```yaml
id: 41
title: "Redistribution: cash vs. in-kind"
slug: redistribution-cash-vs-inkind
phase: 5
prereqs: [11, 39]
difficulty: 3
duration_minutes: 30
math_level: light
domain: applied
tags: [redistribution, transfers, welfare, paternalism, cash-transfers, food-stamps, public-economics]
interests: [poverty, social-policy, development, welfare, government]
description: >
  Is it better to give poor people cash or specific goods and services (food stamps,
  public housing, healthcare)? Economics has a clear default answer (cash, because
  people know their own needs best), but there are real reasons governments choose
  in-kind transfers: paternalism, political economy, and behavioral considerations.
  This lesson lays out both sides.
learning_outcomes:
  - Use consumer theory to show why cash transfers are generally more efficient
  - Explain the paternalistic and behavioral arguments for in-kind transfers
  - Describe the political economy of redistribution (why cash is harder to pass)
  - Evaluate evidence from cash transfer experiments in developing countries
real_world_hook: "GiveDirectly sends cash to the extreme poor. Traditional charities send food, clothes, supplies. Who's right?"
assessment_type: reflection
```

```yaml
id: 42
title: "Public goods and free riding"
slug: public-goods-free-riding
phase: 5
prereqs: [12, 13]
difficulty: 3
duration_minutes: 30
math_level: moderate
domain: applied
tags: [public-goods, free-rider, provision, non-excludable, non-rival, collective-action, public-economics]
interests: [government, infrastructure, defense, research, open-source]
description: >
  National defense, basic research, clean air, street lighting. These are goods everyone
  benefits from but nobody can be excluded from. Because you can enjoy them without
  paying, the market underprovides them. This lesson formalizes the public goods problem,
  connects it to the prisoner's dilemma, and evaluates mechanisms for efficient provision.
learning_outcomes:
  - Classify goods by rivalry and excludability (private, public, club, common pool)
  - Derive the Samuelson condition for optimal public goods provision
  - Explain the free-rider problem and why voluntary provision fails
  - Evaluate solutions: taxation, Lindahl pricing, assurance contracts
real_world_hook: "Why does the government fund basic science research but not iPhone development? One is a public good. The other isn't."
assessment_type: quiz
```

---

## PHASE 6: WHY PEOPLE ARE WEIRD

```yaml
id: 43
title: "Reference dependence and loss aversion"
slug: loss-aversion
phase: 6
prereqs: [2]
difficulty: 2
duration_minutes: 30
math_level: light
domain: behavioral
tags: [loss-aversion, prospect-theory, reference-dependence, kahneman, tversky, behavioral-economics]
interests: [psychology, decision-making, marketing, investing, everyday-life]
description: >
  People don't evaluate outcomes in absolute terms. They evaluate them relative to a
  reference point, and losses loom larger than gains. Kahneman and Tversky's prospect
  theory overturned expected utility theory's dominance and won a Nobel Prize. This
  lesson builds the model and shows why it explains everything from why people hold
  losing stocks too long to why free trials convert so well.
learning_outcomes:
  - Explain reference dependence and how it differs from standard utility
  - Define loss aversion and cite the approximate 2:1 loss-gain ratio
  - Apply prospect theory to investment behavior, insurance, and marketing
  - Distinguish between risk aversion and loss aversion
real_world_hook: "Losing $100 feels worse than finding $100 feels good. That asymmetry explains an enormous amount of human behavior."
assessment_type: quiz
```

```yaml
id: 44
title: "Present bias and self-control"
slug: present-bias
phase: 6
prereqs: [2]
difficulty: 2
duration_minutes: 30
math_level: light
domain: behavioral
tags: [present-bias, hyperbolic-discounting, self-control, procrastination, savings, commitment, behavioral-economics]
interests: [personal-finance, habits, productivity, health, everyday-life]
description: >
  People systematically overvalue immediate rewards relative to future ones. This isn't
  just impatience (which standard economics handles fine). It's a specific pattern called
  present bias where your preferences reverse as the moment of action approaches. This
  lesson explains why you set an alarm to wake up early and then hit snooze, and what
  policy tools can help.
learning_outcomes:
  - Distinguish time-consistent discounting from present-biased (hyperbolic) discounting
  - Explain preference reversal and why it leads to procrastination and under-saving
  - Describe commitment devices and why people voluntarily restrict their future choices
  - Apply present bias to savings behavior, diet, exercise, and addiction
real_world_hook: "Last night you planned to go to the gym at 7am. At 7am you hit snooze. Your preferences literally reversed overnight. That's present bias."
assessment_type: reflection
```

```yaml
id: 45
title: "Biases in judgment"
slug: biases-in-judgment
phase: 6
prereqs: [25]
difficulty: 2
duration_minutes: 35
math_level: light
domain: behavioral
tags: [heuristics, biases, anchoring, overconfidence, base-rate-neglect, availability, representativeness, behavioral-economics]
interests: [psychology, decision-making, critical-thinking, media-literacy, investing]
description: >
  People use mental shortcuts (heuristics) that are usually helpful but systematically
  biased. Anchoring makes you influenced by irrelevant numbers. Availability makes you
  overweight vivid events. Overconfidence makes you think you know more than you do.
  This lesson catalogs the major biases, explains why they persist, and shows how
  they distort economic decisions.
learning_outcomes:
  - Define and illustrate anchoring, availability, representativeness, and overconfidence
  - Explain base-rate neglect and the prosecutor's fallacy
  - Show how judgment biases lead to systematic errors in markets and policy
  - Distinguish between biases that are harmless and those that are economically costly
real_world_hook: "A doctor tells you a test is 99% accurate. You test positive. What's the chance you actually have the disease? Most people, including doctors, get this wrong."
assessment_type: quiz
```

```yaml
id: 46
title: "Nudges and choice architecture"
slug: nudges-choice-architecture
phase: 6
prereqs: [43, 44, 45]
difficulty: 2
duration_minutes: 35
math_level: none
domain: behavioral
tags: [nudges, choice-architecture, defaults, libertarian-paternalism, thaler, sunstein, policy-design, behavioral-economics]
interests: [policy, product-design, ux, government, marketing, behavioral-change]
description: >
  If people are predictably irrational, then the way choices are presented matters
  enormously. Changing the default option, simplifying information, or reframing
  choices can dramatically change outcomes without restricting freedom. This lesson
  covers the nudge framework and its applications in savings, organ donation, energy
  use, and health.
learning_outcomes:
  - Define a nudge and distinguish it from a mandate or ban
  - Explain why default options are so powerful
  - Describe real-world nudge successes: auto-enrollment in 401(k), organ donation, energy labeling
  - Evaluate the ethical critiques of nudging (manipulation, autonomy, slippery slope)
real_world_hook: "One change to the employee retirement enrollment form increased savings rates from 40% to over 90%. Nobody's freedom was restricted. That's a nudge."
assessment_type: case_analysis
```

```yaml
id: 47
title: "When rationality assumptions break down"
slug: rationality-breaks-down
phase: 6
prereqs: [43, 44, 11]
difficulty: 3
duration_minutes: 35
math_level: light
domain: behavioral
tags: [behavioral-welfare, rationality, policy-implications, paternalism, welfare-economics, behavioral-economics]
interests: [philosophy, policy, theory, welfare, critical-thinking]
description: >
  You've now learned the standard model (rational, self-interested agents) and the
  behavioral departures from it. This lesson asks the hard question: if people aren't
  fully rational, what happens to welfare economics? Can we still say markets are
  efficient? Should the government intervene more? Less? It's the lesson that connects
  behavioral findings to the policy frameworks from earlier phases.
learning_outcomes:
  - Explain how behavioral biases undermine the First Welfare Theorem
  - Distinguish between experienced utility and decision utility
  - Evaluate the case for and against paternalistic policies
  - Articulate your own position on the limits of consumer sovereignty
real_world_hook: "If people consistently choose things that make them worse off (junk food, no savings, addictive apps), should the government step in? The answer depends on how you define 'worse off.'"
assessment_type: reflection
```

---

## PHASE 7: HEALTH ECONOMICS PRIMER

```yaml
id: 48
title: "Why healthcare markets are different"
slug: why-healthcare-is-different
phase: 7
prereqs: [12, 18, 19, 20]
difficulty: 3
duration_minutes: 35
math_level: light
domain: applied
tags: [healthcare, arrow, market-failure, uncertainty, agency, insurance, health-economics]
interests: [healthcare, policy, medicine, insurance, public-health]
description: >
  Kenneth Arrow's 1963 paper argued that healthcare markets are fundamentally different
  from normal markets. Uncertainty about when you'll need care and what care you'll need.
  Massive information asymmetry between doctors and patients. The doctor is simultaneously
  your advisor and your vendor. This lesson shows why healthcare can't just be left to
  the free market, and why every country in the world intervenes.
learning_outcomes:
  - Identify the key features that make healthcare markets distinctive
  - Explain the agency problem between doctors and patients
  - Show how uncertainty creates the demand for health insurance
  - Connect the market failures in healthcare to the policy responses they motivate
real_world_hook: "You don't comparison shop for an ambulance. That single fact tells you healthcare isn't a normal market."
assessment_type: case_analysis
```

```yaml
id: 49
title: "The demand for health insurance"
slug: demand-for-health-insurance
phase: 7
prereqs: [2, 20, 48]
difficulty: 3
duration_minutes: 35
math_level: moderate
domain: applied
tags: [health-insurance, risk-aversion, expected-utility, insurance-demand, risk-premium, health-economics]
interests: [healthcare, insurance, personal-finance, policy]
description: >
  Why do people buy health insurance? Because they're risk-averse: they'd rather pay
  a certain premium than face the uncertain possibility of a catastrophic medical bill.
  This lesson formalizes the demand for insurance using expected utility theory, derives
  how much people are willing to pay for coverage, and shows why healthier people
  rationally choose less insurance, creating the adverse selection problem.
learning_outcomes:
  - Model the demand for insurance using expected utility theory
  - Calculate the risk premium and relate it to risk aversion
  - Explain why the willingness to pay for insurance varies by health status
  - Connect individual insurance demand to market-level adverse selection
real_world_hook: "You pay $6,000 a year for health insurance. Expected medical costs: $3,000. Why would a rational person pay double? This lesson is the answer."
assessment_type: problem_set
```

```yaml
id: 50
title: "Moral hazard in health insurance: the RAND experiment"
slug: rand-health-insurance-experiment
phase: 7
prereqs: [19, 26, 49]
difficulty: 3
duration_minutes: 40
math_level: moderate
domain: applied
tags: [rand-experiment, moral-hazard, health-insurance, cost-sharing, healthcare-utilization, health-economics, rct]
interests: [healthcare, policy, research, insurance, empirical-evidence]
description: >
  The RAND Health Insurance Experiment (1971-1986) randomly assigned families to
  insurance plans with different cost-sharing levels. It remains the most important
  experiment in health economics. People with free care used 30% more healthcare
  than those with cost-sharing, but for most people, the additional care didn't
  improve health. This lesson walks through the design, findings, and the policy
  debate it ignited that continues today.
learning_outcomes:
  - Describe the experimental design and why randomization was essential
  - Summarize the key findings on utilization, spending, and health outcomes
  - Explain the moral hazard implications for insurance design
  - Evaluate how the RAND results inform current debates about deductibles and copays
real_world_hook: "When healthcare is free, people use 30% more of it. But are they healthier? The answer shaped every insurance policy you've ever had."
assessment_type: data_exercise
```

---

## ONBOARDING INTEREST TAGS (for personalized paths)

These are the `interests` values referenced above. During onboarding, the learner selects their interests and the platform uses them to recommend starting points, highlight relevant lessons, and sequence the curriculum.

```yaml
interest_tags:
  - id: fundamentals
    label: "Understanding how the economy works"
    maps_to_phases: [1, 2]
  - id: policy
    label: "Government, taxation, and public policy"
    maps_to_phases: [5, 7]
  - id: markets
    label: "How markets and businesses operate"
    maps_to_phases: [1, 2]
  - id: decision-making
    label: "How people make choices"
    maps_to_phases: [1, 6]
  - id: psychology
    label: "Psychology and irrational behavior"
    maps_to_phases: [6]
  - id: data
    label: "Data, evidence, and research methods"
    maps_to_phases: [4]
  - id: critical-thinking
    label: "Evaluating claims and spotting BS"
    maps_to_phases: [4, 6]
  - id: healthcare
    label: "Healthcare and health policy"
    maps_to_phases: [7]
  - id: inequality
    label: "Inequality, poverty, and redistribution"
    maps_to_phases: [5]
  - id: business
    label: "Business strategy and competition"
    maps_to_phases: [1, 2, 3]
  - id: entrepreneurship
    label: "Starting and running a business"
    maps_to_phases: [1, 3]
  - id: personal-finance
    label: "Personal money decisions"
    maps_to_phases: [1, 6]
  - id: current-events
    label: "Understanding the news through economics"
    maps_to_phases: [1, 5]
  - id: environment
    label: "Climate, environment, and sustainability"
    maps_to_phases: [1, 5]
  - id: international-relations
    label: "Global politics and cooperation"
    maps_to_phases: [2]
  - id: history
    label: "Economic history and how we got here"
    maps_to_phases: [0]
  - id: developing-world
    label: "Economics of developing countries"
    maps_to_phases: [0, 7]
  - id: strategy
    label: "Strategy, competition, and game theory"
    maps_to_phases: [2, 3]
  - id: negotiation
    label: "Negotiation and bargaining"
    maps_to_phases: [2]
  - id: investing
    label: "Investing and financial markets"
    maps_to_phases: [6]
  - id: tech
    label: "Technology, platforms, and digital markets"
    maps_to_phases: [2, 3]
  - id: media-literacy
    label: "Reading studies and evaluating evidence"
    maps_to_phases: [4]
  - id: research
    label: "Conducting or understanding academic research"
    maps_to_phases: [4]
```

## DIFFICULTY DISTRIBUTION

| Difficulty | Count | Description |
|---|---|---|
| 1 | 3 | Accessible to anyone, no background needed |
| 2 | 20 | Foundational, light math, most learners start here |
| 3 | 23 | Intermediate, requires prior lessons, moderate math |
| 4 | 4 | Advanced, significant prereq chain, heavier math |
| 5 | 0 | Reserved for future advanced courses |

## ASSESSMENT TYPE DISTRIBUTION

| Type | Count | Description |
|---|---|---|
| problem_set | 16 | Quantitative exercises with worked solutions |
| case_analysis | 16 | Apply frameworks to real-world scenarios |
| quiz | 7 | Conceptual comprehension checks |
| data_exercise | 6 | Interpret real data or replicate findings |
| reflection | 3 | Structured written response on contested questions |

## ENTRY POINTS BY INTEREST

For the onboarding flow, these are recommended starting lessons based on selected interests:

| If learner selects... | Start with... | Then... |
|---|---|---|
| "Understanding how the economy works" | Lesson 0 → 1 | Linear through Phase 1 |
| "Psychology and irrational behavior" | Lesson 0 → 43 | Phase 6, then back to Phase 1 |
| "Data, evidence, and research methods" | Lesson 25 | Linear through Phase 4 |
| "Government and public policy" | Lesson 0 → 1 | Phase 1 → Phase 5 (skip Phase 2-3 initially) |
| "Business strategy and competition" | Lesson 1 → 5 | Phase 1 producer theory → Phase 2 game theory |
| "Healthcare and health policy" | Lesson 0 → 1 | Phase 1 → Phase 3 (information) → Phase 7 |
| "Personal money decisions" | Lesson 0 → 43 → 44 | Phase 6 → Phase 1 consumer theory |
| "Evaluating claims and spotting BS" | Lesson 25 → 33 | Phase 4, then selectively into Phases 5-7 |
