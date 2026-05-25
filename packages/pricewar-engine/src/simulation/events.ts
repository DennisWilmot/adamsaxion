import type { PipelineContext } from "../engine/pipeline/context";

export type CoffeeShopEventImpact = "neutral" | "positive" | "negative";

export type CoffeeShopEventDef = {
  id: string;
  label: string;
  description: string;
  impact: CoffeeShopEventImpact;
  /** Relative weight — not a literal probability. */
  weight: number;
  apply: (ctx: PipelineContext) => void;
};

function bumpFootTraffic(ctx: PipelineContext, factor: number, label: string): void {
  ctx.scratch.footTrafficMultiplier *= factor;
  ctx.scratch.activeEventLabel = label;
}

function bumpInputCost(ctx: PipelineContext, factor: number): void {
  for (const slot of ["A", "B"] as const) {
    ctx.scratch.inputCostMultiplier[slot] *= factor;
  }
}

/** Downtown coffee high-frequency table — weights from spreadsheet Stochastic Events sheet. */
export const COFFEE_SHOP_EVENTS: CoffeeShopEventDef[] = [
  {
    id: "event.health_inspection",
    label: "Health inspection",
    description: "Inspector visit — quality shops gain reputation; weak quality risks a fine.",
    impact: "neutral",
    weight: 12,
    apply(ctx) {
      for (const slot of ["A", "B"] as const) {
        const sim = ctx.state.playersPrivate[slot];
        if (sim.reputation > 60) {
          ctx.scratch.privateActionNotes[slot].push("Health inspection passed with praise.");
        }
      }
      ctx.scratch.activeEventLabel = "Health inspection on the block";
    },
  },
  {
    id: "event.heavy_rain",
    label: "Heavy rain",
    description: "Foot traffic drops sharply as customers stay indoors.",
    impact: "negative",
    weight: 20,
    apply(ctx) {
      bumpFootTraffic(ctx, 0.6, "Heavy rain · foot traffic down");
    },
  },
  {
    id: "event.supply_disruption",
    label: "Supply disruption",
    description: "Input costs spike; inventory buffer absorbs part of the shock.",
    impact: "negative",
    weight: 8,
    apply(ctx) {
      bumpInputCost(ctx, 1.4);
      ctx.scratch.activeEventLabel = "Supply disruption · bean costs up";
    },
  },
  {
    id: "event.traffic_jam",
    label: "Traffic jam",
    description: "Road closure deters walk-in customers for the round.",
    impact: "negative",
    weight: 12,
    apply(ctx) {
      bumpFootTraffic(ctx, 0.75, "Traffic jam · fewer walk-ins");
    },
  },
  {
    id: "event.utility_spike",
    label: "Utility spike",
    description: "Energy prices jump — overhead costs rise for both cafés.",
    impact: "negative",
    weight: 10,
    apply(ctx) {
      ctx.scratch.overheadMultiplier = (ctx.scratch.overheadMultiplier ?? 1) * 1.15;
      ctx.scratch.activeEventLabel = "Utility spike · overhead up";
    },
  },
  {
    id: "event.staff_conflict",
    label: "Staff conflict",
    description: "Team dispute hurts morale and service quality.",
    impact: "negative",
    weight: 6,
    apply(ctx) {
      for (const slot of ["A", "B"] as const) {
        ctx.scratch.moraleShock[slot] = (ctx.scratch.moraleShock[slot] ?? 0) - 0.06;
        ctx.scratch.privateActionNotes[slot].push("Staff conflict hurt morale this round.");
      }
      ctx.scratch.activeEventLabel = "Staff conflict · service strained";
    },
  },
  {
    id: "event.bulk_catering",
    label: "Bulk catering request",
    description: "A large one-time order is available if you have spare capacity.",
    impact: "positive",
    weight: 6,
    apply(ctx) {
      ctx.scratch.bulkOrderBonus = 150;
      ctx.scratch.activeEventLabel = "Bulk catering order available";
    },
  },
  {
    id: "event.competitor_promotion",
    label: "Competitor promotion",
    description: "Organic competitor buzz shifts share toward the rival for the round.",
    impact: "negative",
    weight: 10,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost -= 0.05;
      ctx.scratch.activeEventLabel = "Competitor promotion on the street";
    },
  },
  {
    id: "event.festival",
    label: "Local festival",
    description: "Foot traffic surges from an external downtown event.",
    impact: "positive",
    weight: 8,
    apply(ctx) {
      bumpFootTraffic(ctx, 1.8, "Local festival · foot traffic up");
    },
  },
  {
    id: "event.viral_positive",
    label: "Viral review (positive)",
    description: "A glowing review drives new customers to both shops.",
    impact: "positive",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost += 0.2;
      ctx.scratch.activeEventLabel = "Viral positive review · buzz up";
    },
  },
  {
    id: "event.viral_negative",
    label: "Viral review (negative)",
    description: "A harsh review tempers new customer traffic.",
    impact: "negative",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost -= 0.15;
      ctx.scratch.activeEventLabel = "Viral negative review · trust down";
    },
  },
  {
    id: "event.social_trend",
    label: "Social media trend",
    description: "Coffee culture trends online — industry-wide traffic lift.",
    impact: "positive",
    weight: 4,
    apply(ctx) {
      bumpFootTraffic(ctx, 1.25, "Social trend · coffee buzz");
    },
  },
  {
    id: "event.landlord_rent",
    label: "Landlord raises rent",
    description: "Fixed downtown rent increases permanently.",
    impact: "negative",
    weight: 8,
    apply(ctx) {
      ctx.scratch.rentSurcharge = (ctx.scratch.rentSurcharge ?? 0) + 20;
      ctx.scratch.activeEventLabel = "Landlord raised rent · overhead up";
    },
  },
  {
    id: "event.favorable_press",
    label: "Favorable press",
    description: "Local media spotlight lifts reputation for quality operators.",
    impact: "positive",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost += 0.15;
      ctx.scratch.activeEventLabel = "Favorable press coverage";
    },
  },
  {
    id: "event.power_outage",
    label: "Power outage",
    description: "Electricity failure — production severely constrained.",
    impact: "negative",
    weight: 3,
    apply(ctx) {
      ctx.scratch.footTrafficMultiplier *= 0.5;
      ctx.scratch.activeEventLabel = "Power outage · limited service";
    },
  },
];

export type DrawnEvent = {
  id: string;
  label: string;
  description: string;
  impact: CoffeeShopEventImpact;
};

export function drawCoffeeShopEvent(
  rng: { next: () => number },
  events = COFFEE_SHOP_EVENTS
): CoffeeShopEventDef {
  const total = events.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng.next() * total;
  for (const event of events) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return events[events.length - 1]!;
}
