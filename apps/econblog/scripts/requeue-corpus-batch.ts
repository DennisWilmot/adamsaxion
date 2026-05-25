/**
 * Re-create the 46-lesson corpus batch (skips titles that already exist).
 * Run: tsx scripts/requeue-corpus-batch.ts [--dry-run]
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { lessons } from "../src/db/schema";
import { queueLessonGenerationJob } from "../src/lib/admin/lesson-generation-runner";
import { resolveLessonMetadata } from "../src/lib/admin/infer-lesson-metadata";

const CORPUS_TITLES = [
  "Capital and Wealth Taxation: Power, Mobility, and the Limits of Redistribution",
  "Regression: What It Actually Does",
  "Regression Discontinuity: Causal Inference at the Threshold",
  "Deadweight Loss: The Hidden Cost of Taxes",
  "Profit Maximization: The Rule That Runs the World (and Its Limits)",
  "Repeated Games: How Cooperation Emerges from Self-Interest",
  "Perfect Competition: The Market Structure That Runs the World (and Exists Nowhere in It)",
  "The Demand for Health Insurance: Risk, Markets, and the Limits of Choice",
  "Demand: Where It Actually Comes From",
  "Production and Costs: From the Cane Field to the Refinery",
  "Supply and Demand in Equilibrium: How Markets Find Their Price",
  "Moral hazard in health insurance: the RAND experiment",
  "Redistribution: Cash vs. In-Kind Transfers",
  "The Prisoner's Dilemma: Why Smart People Make Bad Choices Together",
  "Elasticity: the most useful number in economics",
  "When markets fail: externalities and public goods",
  "Monopoly and Market Power: Who Sets the Price, and What Does It Cost?",
  "Screening: Sorting Without Seeing",
  "Signaling: Costly Proof and the Economics of Credibility",
  "Auctions and Bidding Strategy: The Economics of Competitive Price Discovery",
  "Public Goods and Free Riding: Why Markets Fail When Everyone Benefits",
  "Sequential Games and Credible Threats: The Strategic Logic of Commitment",
  "Optimal Income Taxation: The Mathematics of Fairness and Efficiency",
  "When Rationality Assumptions Break Down: Behavioral Economics and the Limits of Homo Economicus",
  "Why Healthcare Markets Are Different: Market Failures, Moral Hazard, and the Economics of Life and Death",
  "Information Asymmetry: The Lemons Problem",
  "Behavioral Responses to Taxation: How People Actually React When the Rules Change",
  "Adverse Selection: How Hidden Information Destroys Markets and What Can Be Done About It",
  "Moral Hazard: The Hidden Cost of Every Safety Net",
  "Mechanism Design: Engineering Outcomes",
  "Tax Incidence: Who Actually Pays",
  "Reference Dependence and Loss Aversion: Why Losses Hurt Twice as Much as Gains Feel Good",
  "Welfare, Surplus, and Efficiency: The Case For (and Against) Markets",
  "Principal-Agent Problems: When the People You Hire Stop Working for You",
  "Correlation vs. Causation (For Real This Time)",
  "Present Bias and Self-Control: Why Your Future Self Keeps Getting Betrayed",
  "Biases in Judgment: How Systematic Thinking Errors Shape Economic Decisions",
  "Randomized Experiments: The Gold Standard of Causal Inference",
  "Omitted Variable Bias: The Hidden Force Behind Misleading Evidence",
  "The Economics of Social Insurance: Risk, Markets, and the Limits of Individual Protection",
  "Difference-in-Differences: The Art of the Controlled Comparison",
  "Natural Experiments and Instrumental Variables: Finding Causation in a Messy World",
  "How to Read an Empirical Paper: A Critical Toolkit for Economists",
  "Statistical Significance and Its Discontents: What P-Values Can and Cannot Tell Us",
  "Social Security: Design, Debates, and the Politics of Risk",
  "Nudges and Choice Architecture: How the Design of Decisions Shapes What We Choose",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createUniqueSlug(baseTitle: string) {
  const base = slugify(baseTitle) || "lesson";
  let slug = base;
  let suffix = 2;
  while (true) {
    const [existing] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);
    if (!existing) return slug;
    slug = `${base.slice(0, Math.max(1, 76))}-${suffix}`;
    suffix += 1;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const existing = await db.select({ title: lessons.title }).from(lessons);
  const existingTitles = new Set(existing.map((r) => r.title.trim().toLowerCase()));

  const missing = CORPUS_TITLES.filter(
    (t) => !existingTitles.has(t.trim().toLowerCase())
  );

  console.log(`Corpus: ${CORPUS_TITLES.length}, existing: ${existing.length}, to create: ${missing.length}`);

  if (dryRun) {
    for (const title of missing) console.log(`  would create: ${title}`);
    return;
  }

  let created = 0;
  let queued = 0;
  for (const title of missing) {
    const { category, difficulty } = resolveLessonMetadata({ title, description: "" });
    const slug = await createUniqueSlug(title);
    const [lesson] = await db
      .insert(lessons)
      .values({
        slug,
        title,
        description: "",
        category,
        difficulty,
        status: "research",
        sections: [],
        contentProgress: { completedSections: [] },
        questionsProgress: { completedSections: [] },
      })
      .returning();
    created++;
    const result = await queueLessonGenerationJob(lesson.id);
    if (result.created) queued++;
    console.log(`Created & queued: ${title}`);
  }

  console.log(`\nDone. Created ${created}, queued ${queued}.`);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
