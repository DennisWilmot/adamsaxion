import type { PipelineContext } from "../context";

export function stepTriggers(ctx: PipelineContext): void {
  const scenario = ctx.scenario;
  const streakRequired = scenario.balancing.bankruptcyConsecutiveRounds ?? 2;
  const threshold = scenario.balancing.bankruptcyCashThreshold ?? 0;

  for (const slot of ["A", "B"] as const) {
    const priv = ctx.state.playersPrivate[slot];
    const otherConditions = priv.activeConditions.filter((c) => c.kind !== "bankruptcy_streak");
    const prior = priv.activeConditions.find((c) => c.kind === "bankruptcy_streak");
    if (priv.cash <= threshold) {
      const rounds = ((prior?.payload as { rounds?: number })?.rounds ?? 0) + 1;
      priv.activeConditions = [
        ...otherConditions,
        { kind: "bankruptcy_streak", payload: { rounds } },
      ];
    } else {
      priv.activeConditions = otherConditions;
    }
  }

  let endedByBankruptcy = false;
  for (const slot of ["A", "B"] as const) {
    const streakCond = ctx.state.playersPrivate[slot].activeConditions.find(
      (c) => c.kind === "bankruptcy_streak"
    );
    const rounds = (streakCond?.payload as { rounds?: number })?.rounds ?? 0;
    if (rounds >= streakRequired) {
      ctx.state.outcome = {
        kind: "win",
        winner: slot === "A" ? "B" : "A",
        reason: "bankruptcy",
      };
      ctx.state.phase = "completed";
      endedByBankruptcy = true;
      break;
    }
  }

  const round = ctx.round;
  const isFinalRound = !endedByBankruptcy && round >= scenario.totalRounds;

  if (endedByBankruptcy) {
    // completed
  } else if (isFinalRound) {
    const cashA = ctx.state.playersPrivate.A.cash;
    const cashB = ctx.state.playersPrivate.B.cash;
    if (cashA === cashB) {
      ctx.state.outcome = { kind: "draw" };
    } else {
      ctx.state.outcome = {
        kind: "win",
        winner: cashA > cashB ? "A" : "B",
        reason: "victory_points",
      };
    }
    ctx.state.phase = "completed";
  } else {
    ctx.state.market.lastResolvedRound = round;
    ctx.state.phase = "report";
  }

  ctx.events.push({ t: ctx.nextEventT(), type: "round_resolved", round });
}
