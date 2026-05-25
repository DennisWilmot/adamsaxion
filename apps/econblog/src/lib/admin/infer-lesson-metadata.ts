export const LESSON_CATEGORIES = [
  "Microeconomics",
  "Macroeconomics",
  "Trade",
  "Finance",
] as const;

export const LESSON_DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export type LessonCategory = (typeof LESSON_CATEGORIES)[number];
export type LessonDifficulty = (typeof LESSON_DIFFICULTIES)[number];

function isLessonCategory(value: string): value is LessonCategory {
  return (LESSON_CATEGORIES as readonly string[]).includes(value);
}

function isLessonDifficulty(value: string): value is LessonDifficulty {
  return (LESSON_DIFFICULTIES as readonly string[]).includes(value);
}

export function inferLessonCategory(
  title: string,
  description = ""
): LessonCategory {
  const haystack = `${title} ${description}`.toLowerCase();

  if (
    /(international trade|comparative advantage|\btariff\b|\bimport\b|\bexport\b|trade policy|globalization|\bwto\b|customs union|trade war|free trade)/.test(
      haystack
    )
  ) {
    return "Trade";
  }

  if (
    /(financial market|portfolio|derivatives|\bbond\b|stock market|asset pricing|investment bank|hedge fund|corporate finance|wall street)/.test(
      haystack
    )
  ) {
    return "Finance";
  }

  if (
    /(personal finance|banking|\bbank\b|lending|credit risk|capital structure|mortgage)/.test(
      haystack
    )
  ) {
    return "Finance";
  }

  if (
    /(macroeconomics|keynes|keynesian|\bgdp\b|inflation|unemployment|recession|monetary policy|fiscal policy|central bank|federal reserve|\bfed\b|stimulus|aggregate demand|business cycle|national income|hyperinflation|currency dies|deflation)/.test(
      haystack
    )
  ) {
    return "Macroeconomics";
  }

  return "Microeconomics";
}

export function inferLessonDifficulty(
  title: string,
  description = ""
): LessonDifficulty {
  const haystack = `${title} ${description}`.toLowerCase();

  if (
    /(advanced|graduate|phd|econometrics|general equilibrium|mechanism design|doctoral)/.test(
      haystack
    )
  ) {
    return "Advanced";
  }

  if (/\bintermediate\b/.test(haystack)) {
    return "Intermediate";
  }

  if (
    /(lesson zero|\bbeginner\b|fundamentals|intro to|introduction to|\b101\b|getting started|\bbasics\b)/.test(
      haystack
    )
  ) {
    return "Beginner";
  }

  return "Intermediate";
}

export function resolveLessonMetadata(input: {
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
}) {
  const title = input.title.trim();
  const explicitCategory = input.category?.trim() ?? "";
  const explicitDifficulty = input.difficulty?.trim() ?? "";

  const category = isLessonCategory(explicitCategory)
    ? explicitCategory
    : inferLessonCategory(title, input.description);

  const difficulty = isLessonDifficulty(explicitDifficulty)
    ? explicitDifficulty
    : inferLessonDifficulty(title, input.description);

  return { category, difficulty };
}
