import type { CoachReportPayload } from "@adamsaxion/pricewar-engine";
import type { MatchFacts } from "@adamsaxion/pricewar-engine";
import type { PlayerSlot } from "@adamsaxion/pricewar-types";

export function buildCoachSystemPrompt(): string {
  return `You are an economics coach for "The Price War", a turn-based coffee shop strategy game.
Analyze the match facts and give concise, actionable feedback for the player whose slot is provided.
Respond ONLY with valid JSON matching this schema:
{
  "oneLinerVerdict": "string (80-120 chars)",
  "turningPoint": { "round": number, "explanation": "string" },
  "whatYouDidWell": ["1-3 strings"],
  "whatToImprove": ["1-3 strings"],
  "recommendedLessonSlugs": ["lesson-zero"]
}
Do not mention hidden opponent information the player could not know. Focus on pricing, marketing, procurement, and cash flow.`;
}

export function buildCoachUserPrompt(
  facts: MatchFacts,
  viewerSlot: PlayerSlot
): string {
  const opponentSlot = viewerSlot === "A" ? "B" : "A";
  return JSON.stringify(
    {
      viewerSlot,
      outcome: facts.outcome,
      finalCash: facts.finalCash,
      viewerCash: facts.finalCash[viewerSlot],
      opponentCash: facts.finalCash[opponentSlot],
      turningPoints: facts.turningPoints,
    },
    null,
    2
  );
}

export function parseCoachLlmOutput(raw: unknown): CoachReportPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const oneLinerVerdict =
    typeof o.oneLinerVerdict === "string" ? o.oneLinerVerdict.trim() : "";
  const turningPoint = o.turningPoint as Record<string, unknown> | undefined;
  const round =
    typeof turningPoint?.round === "number" ? turningPoint.round : null;
  const explanation =
    typeof turningPoint?.explanation === "string"
      ? turningPoint.explanation.trim()
      : "";

  if (!oneLinerVerdict || round === null || !explanation) return null;

  const whatYouDidWell = Array.isArray(o.whatYouDidWell)
    ? o.whatYouDidWell.filter((x): x is string => typeof x === "string").slice(0, 3)
    : [];
  const whatToImprove = Array.isArray(o.whatToImprove)
    ? o.whatToImprove.filter((x): x is string => typeof x === "string").slice(0, 3)
    : [];
  const recommendedLessonSlugs = Array.isArray(o.recommendedLessonSlugs)
    ? o.recommendedLessonSlugs
        .filter((x): x is string => typeof x === "string")
        .slice(0, 3)
    : ["lesson-zero"];

  if (whatYouDidWell.length === 0 || whatToImprove.length === 0) return null;

  return {
    oneLinerVerdict,
    turningPoint: { round, explanation },
    whatYouDidWell,
    whatToImprove,
    recommendedLessonSlugs:
      recommendedLessonSlugs.length > 0 ? recommendedLessonSlugs : ["lesson-zero"],
    generatedBy: "llm",
  };
}
