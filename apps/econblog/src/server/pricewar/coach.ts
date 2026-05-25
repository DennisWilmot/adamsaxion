import type { MatchId, PlayerSlot, EngineEvent } from "@adamsaxion/pricewar-types";
import {
  extractFacts,
  renderTemplateCoach,
  type CoachReportPayload,
} from "@adamsaxion/pricewar-engine";
import { chatJSON, OpenRouterApiError } from "@/lib/openrouter";
import {
  buildCoachSystemPrompt,
  buildCoachUserPrompt,
  parseCoachLlmOutput,
} from "@/server/pricewar/coach-prompts";
import {
  getPlayerSlot,
  loadAllMatchEvents,
  loadCoachReport,
  loadMatch,
  saveCoachReport,
  getUserDailyCoachSpend,
  getGlobalDailyCoachSpend,
  recordLlmSpend,
} from "@/server/pricewar/repository";

const COACH_MODEL = process.env.PRICEWAR_COACH_MODEL ?? "openai/gpt-4o-mini";
const USER_DAILY_CAP = Number(process.env.PRICEWAR_COACH_USER_DAILY_USD ?? "5");
const GLOBAL_DAILY_CAP = Number(process.env.PRICEWAR_COACH_GLOBAL_DAILY_USD ?? "200");

function estimateCostUsd(): string {
  return "0.002";
}

async function generateLlmCoachReport(args: {
  facts: ReturnType<typeof extractFacts>;
  slot: PlayerSlot;
  userId: string;
  matchId: MatchId;
}): Promise<{ payload: CoachReportPayload; costUsd: string; model: string } | null> {
  if (!process.env.OPENROUTER_API_KEY) return null;

  const [userSpend, globalSpend] = await Promise.all([
    getUserDailyCoachSpend(args.userId),
    getGlobalDailyCoachSpend(),
  ]);

  if (userSpend >= USER_DAILY_CAP || globalSpend >= GLOBAL_DAILY_CAP) {
    return null;
  }

  try {
    const raw = await chatJSON<unknown>(
      [
        { role: "system", content: buildCoachSystemPrompt() },
        {
          role: "user",
          content: `Player slot: ${args.slot}\n\nMatch facts:\n${buildCoachUserPrompt(args.facts, args.slot)}`,
        },
      ],
      { temperature: 0.4, maxTokens: 800 }
    );

    const parsed = parseCoachLlmOutput(raw);
    if (!parsed) return null;

    const costUsd = estimateCostUsd();
    return { payload: parsed, costUsd, model: COACH_MODEL };
  } catch (err) {
    if (err instanceof OpenRouterApiError) {
      console.warn("[pricewar/coach] OpenRouter error:", err.message);
    }
    return null;
  }
}

export async function generateCoachReport(args: {
  matchId: MatchId;
  userId: string;
  tier: "free" | "paid";
}) {
  const cached = await loadCoachReport(args.matchId, args.userId);
  if (cached) {
    return {
      report: cached.payload,
      generatedBy: cached.generatedBy,
      upgradePrompt: args.tier === "free",
    };
  }

  const state = await loadMatch(args.matchId);
  if (!state || state.phase !== "completed") {
    return null;
  }

  const slot = await getPlayerSlot(args.matchId, args.userId);
  if (!slot) return null;

  const events = (await loadAllMatchEvents(args.matchId)) as EngineEvent[];
  const facts = extractFacts(state, events);

  let payload: CoachReportPayload;
  let generatedBy: "template" | "llm" = "template";
  let costUsd = "0";
  let model: string | undefined;

  if (args.tier === "paid") {
    const llm = await generateLlmCoachReport({
      facts,
      slot: slot as PlayerSlot,
      userId: args.userId,
      matchId: args.matchId,
    });
    if (llm) {
      payload = llm.payload;
      generatedBy = "llm";
      costUsd = llm.costUsd;
      model = llm.model;
    } else {
      payload = renderTemplateCoach(facts, slot as PlayerSlot);
    }
  } else {
    payload = renderTemplateCoach(facts, slot as PlayerSlot);
  }

  await saveCoachReport({
    matchId: args.matchId,
    userId: args.userId,
    payload,
    generatedBy,
    costUsd,
    ...(model !== undefined ? { model } : {}),
  });

  if (generatedBy === "llm") {
    await recordLlmSpend({
      userId: args.userId,
      feature: "coach",
      matchId: args.matchId,
      model: model ?? COACH_MODEL,
      costUsd,
    });
  }

  return {
    report: payload,
    generatedBy,
    upgradePrompt: args.tier === "free",
  };
}
