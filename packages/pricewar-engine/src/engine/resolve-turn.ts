import type {
  MatchState,
  PlayerSlot,
  SubmittedMove,
  ScenarioConfig,
  EngineEvent,
  RoundReport,
  GameError,
} from "@adamsaxion/pricewar-types";
import { MOVE_BY_ID } from "../moves/catalog";
import { createRng, roundRngSeed } from "../rng/seeded";

export interface ResolveTurnInput {
  state: MatchState;
  submittedA: SubmittedMove[];
  submittedB: SubmittedMove[];
  scenario: ScenarioConfig;
}

export interface ResolveTurnOutput {
  nextState: MatchState;
  events: EngineEvent[];
  report: RoundReport;
}

export function validateMoves(
  state: MatchState,
  slot: PlayerSlot,
  moves: SubmittedMove[]
): GameError | null {
  if (moves.length > 3) {
    return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
  }

  const playerCash = state.playersPrivate[slot].cash;

  for (const move of moves) {
    const def = MOVE_BY_ID.get(move.moveId);
    if (!def) {
      return { code: "MOVE_NOT_ALLOWED", message: "Move rejected." };
    }
    if (def.input.kind === "amount") {
      const amount = (move.input as { amount?: number })?.amount ?? 0;
      if (amount > playerCash) {
        return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
      }
    }
    if (def.id === "procurement.buy_beans") {
      const units = (move.input as { units?: number })?.units ?? 0;
      if (units * 3 > playerCash) {
        return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
      }
    }
    if (def.id === "procurement.hire_barista") {
      const count = (move.input as { units?: number })?.units ?? 1;
      if (count * 400 > playerCash) {
        return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
      }
    }
    if (def.id === "procurement.bulk_beans") {
      const units = (move.input as { units?: number })?.units ?? 0;
      if (units * 2 > playerCash) {
        return { code: "INSUFFICIENT_RESOURCES", message: "Move rejected." };
      }
    }
  }

  return null;
}

export function resolveTurn(input: ResolveTurnInput): ResolveTurnOutput {
  const { state, submittedA, submittedB, scenario } = input;
  const round = state.market.currentRound;
  const events: EngineEvent[] = [];
  let t = 0;

  events.push({ t: t++, type: "round_started", round });

  for (const [slot, submitted] of [
    ["A", submittedA],
    ["B", submittedB],
  ] as const) {
    events.push({
      t: t++,
      type: "move_submitted",
      player: slot,
      moves: submitted.map((m) => ({ moveId: m.moveId, input: m.input })),
    });
  }

  const rng = createRng(roundRngSeed(state.matchId, round));
  const weatherShift = Math.round((rng.next() - 0.5) * 20);
  const demandTotal = (scenario.balancing.marketTotalDemandBase ?? 400) + weatherShift;

  events.push({
    t: t++,
    type: "demand_calculated",
    total: demandTotal,
    allocated: {
      A: Math.floor(demandTotal * 0.5),
      B: Math.floor(demandTotal * 0.5),
    },
  });

  const nextState: MatchState = structuredClone(state);
  nextState.updatedAt = new Date(0).toISOString();

  for (const slot of ["A", "B"] as const) {
    const submitted = slot === "A" ? submittedA : submittedB;
    for (const move of submitted) {
      if (move.moveId === "sales.set_price") {
        const newPrice = (move.input as { newPrice?: number })?.newPrice;
        if (typeof newPrice === "number") {
          nextState.playersPublic[slot].currentPrice = newPrice;
          events.push({
            t: t++,
            type: "move_resolved",
            player: slot,
            moveId: move.moveId,
            deltas: { currentPrice: newPrice - state.playersPublic[slot].currentPrice },
          });
        }
      }
      if (move.moveId === "sales.flash_sale") {
        const pctOff = (move.input as { newPrice?: number })?.newPrice ?? 10;
        const current = nextState.playersPublic[slot].currentPrice;
        const discounted = Math.max(100, Math.round(current * (1 - pctOff / 100)));
        nextState.playersPublic[slot].currentPrice = discounted;
        nextState.playersPrivate[slot].reputation += 1;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { currentPrice: discounted - current, reputation: 1 },
        });
      }
      if (
        move.moveId === "marketing.run_ad_campaign" ||
        move.moveId === "marketing.social_post" ||
        move.moveId === "marketing.loyalty_cards"
      ) {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        const repGain =
          move.moveId === "marketing.social_post"
            ? Math.floor(amount / 75)
            : move.moveId === "marketing.loyalty_cards"
              ? Math.floor(amount / 40)
              : Math.floor(amount / 50);
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += repGain;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: repGain },
        });
      }
      if (move.moveId === "procurement.buy_beans") {
        const units = (move.input as { units?: number })?.units ?? 0;
        const beanCost = scenario.balancing.beanCostPerUnit ?? 3;
        const cost = units * beanCost;
        nextState.playersPrivate[slot].cash -= cost;
        nextState.playersPrivate[slot].inventory += units;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -cost, inventory: units },
        });
      }
      if (move.moveId === "procurement.hire_barista") {
        const count = (move.input as { units?: number })?.units ?? 1;
        const cost = count * 400;
        nextState.playersPrivate[slot].cash -= cost;
        nextState.playersPrivate[slot].staffCount += count;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -cost, staffCount: count },
        });
      }
      if (move.moveId === "operations.deep_clean") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].morale += 2;
        nextState.playersPrivate[slot].reputation += 1;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, morale: 2, reputation: 1 },
        });
      }
      if (move.moveId === "operations.extend_hours") {
        const enabled = (move.input as { enabled?: boolean })?.enabled ?? true;
        if (enabled) {
          nextState.playersPrivate[slot].cash -= 150;
          nextState.playersPrivate[slot].morale -= 1;
          events.push({
            t: t++,
            type: "move_resolved",
            player: slot,
            moveId: move.moveId,
            deltas: { cash: -150, morale: -1 },
          });
        }
      }
      if (move.moveId === "finance.emergency_loan") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash += amount;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: amount },
        });
      }
      if (move.moveId === "finance.pay_suppliers") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += 2;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: 2 },
        });
      }
      if (move.moveId === "sales.premium_blend") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPublic[slot].currentPrice += 50;
        nextState.playersPrivate[slot].reputation += 3;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, currentPrice: 50, reputation: 3 },
        });
      }
      if (move.moveId === "procurement.bulk_beans") {
        const units = (move.input as { units?: number })?.units ?? 0;
        const cost = units * 2;
        nextState.playersPrivate[slot].cash -= cost;
        nextState.playersPrivate[slot].inventory += units;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -cost, inventory: units },
        });
      }
      if (move.moveId === "hr.cross_train") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].morale += 3;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, morale: 3 },
        });
      }
      if (move.moveId === "hr.raise_wages") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].morale += 5;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, morale: 5 },
        });
      }
      if (move.moveId === "marketing.local_partnership") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += Math.floor(amount / 60);
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: Math.floor(amount / 60) },
        });
      }
      if (move.moveId === "operations.menu_refresh") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += 2;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: 2 },
        });
      }
      if (move.moveId === "sales.competitive_match") {
        const newPrice = (move.input as { newPrice?: number })?.newPrice;
        if (typeof newPrice === "number") {
          nextState.playersPublic[slot].currentPrice = newPrice;
          events.push({
            t: t++,
            type: "move_resolved",
            player: slot,
            moveId: move.moveId,
            deltas: { currentPrice: newPrice - state.playersPublic[slot].currentPrice },
          });
        }
      }
      if (move.moveId === "sales.bundle_deal") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += 2;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: 2 },
        });
      }
      if (move.moveId === "marketing.influencer") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += Math.floor(amount / 45);
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: Math.floor(amount / 45) },
        });
      }
      if (move.moveId === "marketing.free_samples") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += Math.floor(amount / 35);
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: Math.floor(amount / 35) },
        });
      }
      if (move.moveId === "procurement.equipment_lease") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].reputation += 2;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, reputation: 2 },
        });
      }
      if (move.moveId === "operations.peak_staffing") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].morale += 2;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, morale: 2 },
        });
      }
      if (move.moveId === "hr.hire_manager") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        nextState.playersPrivate[slot].morale += 4;
        nextState.playersPrivate[slot].staffCount += 1;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount, morale: 4, staffCount: 1 },
        });
      }
      if (move.moveId === "finance.cash_reserve") {
        const amount = (move.input as { amount?: number })?.amount ?? 0;
        nextState.playersPrivate[slot].cash -= amount;
        events.push({
          t: t++,
          type: "move_resolved",
          player: slot,
          moveId: move.moveId,
          deltas: { cash: -amount },
        });
      }
    }

    const baseCost = scenario.balancing.basePerRoundCost ?? 200;
    nextState.playersPrivate[slot].cash -= baseCost;
    events.push({
      t: t++,
      type: "finance_settled",
      player: slot,
      cashAfter: nextState.playersPrivate[slot].cash,
    });

    const threshold = scenario.balancing.bankruptcyCashThreshold ?? 0;
    const cash = nextState.playersPrivate[slot].cash;
    const otherConditions = nextState.playersPrivate[slot].activeConditions.filter(
      (c) => c.kind !== "bankruptcy_streak"
    );
    const prior = nextState.playersPrivate[slot].activeConditions.find(
      (c) => c.kind === "bankruptcy_streak"
    );
    if (cash <= threshold) {
      const rounds = ((prior?.payload as { rounds?: number })?.rounds ?? 0) + 1;
      nextState.playersPrivate[slot].activeConditions = [
        ...otherConditions,
        { kind: "bankruptcy_streak", payload: { rounds } },
      ];
    } else {
      nextState.playersPrivate[slot].activeConditions = otherConditions;
    }
  }

  const streakRequired = scenario.balancing.bankruptcyConsecutiveRounds ?? 2;
  let endedByBankruptcy = false;
  for (const slot of ["A", "B"] as const) {
    const streakCond = nextState.playersPrivate[slot].activeConditions.find(
      (c) => c.kind === "bankruptcy_streak"
    );
    const rounds = (streakCond?.payload as { rounds?: number })?.rounds ?? 0;
    if (rounds >= streakRequired) {
      nextState.outcome = {
        kind: "win",
        winner: slot === "A" ? "B" : "A",
        reason: "bankruptcy",
      };
      nextState.phase = "completed";
      endedByBankruptcy = true;
      break;
    }
  }

  const isFinalRound = !endedByBankruptcy && round >= scenario.totalRounds;
  if (endedByBankruptcy) {
    // match already completed
  } else if (isFinalRound) {
    const cashA = nextState.playersPrivate.A.cash;
    const cashB = nextState.playersPrivate.B.cash;
    if (cashA === cashB) {
      nextState.outcome = { kind: "draw" };
    } else {
      nextState.outcome = {
        kind: "win",
        winner: cashA > cashB ? "A" : "B",
        reason: "victory_points",
      };
    }
    nextState.phase = "completed";
  } else {
    nextState.market.currentRound = round + 1;
    nextState.phase = "decide";
  }

  events.push({ t: t++, type: "round_resolved", round });

  const report: RoundReport = {
    round,
    publicSummary: `Round ${round} resolved. Market demand was ${demandTotal} units.`,
    publicEvents: [
      {
        description: `Weather shifted demand by ${weatherShift} units.`,
        impact: weatherShift >= 0 ? "positive" : "negative",
      },
    ],
    privateSummary: {
      A: `You spent moves and settled finances. Cash: $${nextState.playersPrivate.A.cash}.`,
      B: `You spent moves and settled finances. Cash: $${nextState.playersPrivate.B.cash}.`,
    },
    deltas: {
      A: {
        cashDelta: nextState.playersPrivate.A.cash - state.playersPrivate.A.cash,
        demandSatisfied: Math.floor(demandTotal * 0.5),
        reputationDelta: nextState.playersPrivate.A.reputation - state.playersPrivate.A.reputation,
        moraleDelta: 0,
      },
      B: {
        cashDelta: nextState.playersPrivate.B.cash - state.playersPrivate.B.cash,
        demandSatisfied: Math.floor(demandTotal * 0.5),
        reputationDelta: nextState.playersPrivate.B.reputation - state.playersPrivate.B.reputation,
        moraleDelta: 0,
      },
    },
  };

  return { nextState, events, report };
}
