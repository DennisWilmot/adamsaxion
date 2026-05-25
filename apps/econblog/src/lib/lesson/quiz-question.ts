/**
 * Detects quiz questions that embed a list of choices in the question text
 * (e.g. "three options: A, B, or C") and splits them for clearer layout.
 */
export function parseEmbeddedQuizOptions(question: string): {
  stem: string;
  contextOptions: string[];
} | null {
  const match = question.match(
    /^(.*?)(?:,\s*)?(?:and\s+)?(?:(?:\d+|three|two|four|five)\s+)?options?\s*:\s*(.+?)\.\s+(.*)$/i
  );
  if (!match) return null;

  const [, prefix, optionsText, suffix] = match;
  const contextOptions = optionsText
    .split(/,\s*(?:or\s+)?|,\s*or\s+/i)
    .map((item) => item.trim())
    .filter(Boolean);

  if (contextOptions.length < 2) return null;

  const stem = `${prefix.trim()}. ${suffix.trim()}`.replace(/\.\s*\./g, ".");
  return { stem, contextOptions };
}
