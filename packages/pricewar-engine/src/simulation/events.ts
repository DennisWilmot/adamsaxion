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

/** Prefix for player-facing event copy in reports and UI. */
export const NEWS_ALERT_PREFIX = "News alert:";

function newsAlert(body: string): string {
  return `${NEWS_ALERT_PREFIX} ${body}`;
}

function bumpFootTraffic(ctx: PipelineContext, factor: number, alertBody: string): void {
  ctx.scratch.footTrafficMultiplier *= factor;
  ctx.scratch.activeEventLabel = newsAlert(alertBody);
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
    description: newsAlert(
      "Health inspectors visited the block. Clean, well-run shops got a boost."
    ),
    impact: "neutral",
    weight: 12,
    apply(ctx) {
      for (const slot of ["A", "B"] as const) {
        const sim = ctx.state.playersPrivate[slot];
        if (sim.reputation > 60) {
          ctx.scratch.privateActionNotes[slot].push(
            "The health inspection went well. Quality standards paid off."
          );
        }
      }
      ctx.scratch.activeEventLabel = newsAlert(
        "Health inspectors visited the block. Clean, well-run shops got a boost."
      );
    },
  },
  {
    id: "event.heavy_rain",
    label: "Heavy rain",
    description: newsAlert(
      "Heavy rain kept people indoors. Fewer customers walked in today."
    ),
    impact: "negative",
    weight: 20,
    apply(ctx) {
      bumpFootTraffic(
        ctx,
        0.6,
        "Heavy rain kept people indoors. Fewer customers walked in today."
      );
    },
  },
  {
    id: "event.supply_disruption",
    label: "Supply disruption",
    description: newsAlert(
      "Coffee bean supply hit a snag. Ingredient costs went up for everyone."
    ),
    impact: "negative",
    weight: 8,
    apply(ctx) {
      bumpInputCost(ctx, 1.4);
      ctx.scratch.activeEventLabel = newsAlert(
        "Coffee bean supply hit a snag. Ingredient costs went up for everyone."
      );
    },
  },
  {
    id: "event.traffic_jam",
    label: "Traffic jam",
    description: newsAlert(
      "A road closure slowed downtown traffic. Walk-in customers dropped."
    ),
    impact: "negative",
    weight: 12,
    apply(ctx) {
      bumpFootTraffic(
        ctx,
        0.75,
        "A road closure slowed downtown traffic. Walk-in customers dropped."
      );
    },
  },
  {
    id: "event.utility_spike",
    label: "Utility spike",
    description: newsAlert(
      "Energy prices jumped. Running costs rose for both cafés."
    ),
    impact: "negative",
    weight: 10,
    apply(ctx) {
      ctx.scratch.overheadMultiplier = (ctx.scratch.overheadMultiplier ?? 1) * 1.15;
      ctx.scratch.activeEventLabel = newsAlert(
        "Energy prices jumped. Running costs rose for both cafés."
      );
    },
  },
  {
    id: "event.staff_conflict",
    label: "Staff conflict",
    description: newsAlert(
      "Tension on the team spilled into service. Morale took a hit at both shops."
    ),
    impact: "negative",
    weight: 6,
    apply(ctx) {
      for (const slot of ["A", "B"] as const) {
        ctx.scratch.moraleShock[slot] = (ctx.scratch.moraleShock[slot] ?? 0) - 0.06;
        ctx.scratch.privateActionNotes[slot].push(
          "Team conflict hurt morale this round."
        );
      }
      ctx.scratch.activeEventLabel = newsAlert(
        "Tension on the team spilled into service. Morale took a hit at both shops."
      );
    },
  },
  {
    id: "event.bulk_catering",
    label: "Bulk catering request",
    description: newsAlert(
      "A big office order is up for grabs. Extra cash if you have capacity."
    ),
    impact: "positive",
    weight: 6,
    apply(ctx) {
      ctx.scratch.bulkOrderBonus = 150;
      ctx.scratch.activeEventLabel = newsAlert(
        "A big office order is up for grabs. Extra cash if you have capacity."
      );
    },
  },
  {
    id: "event.competitor_promotion",
    label: "Competitor promotion",
    description: newsAlert(
      "A rival café is running a loud promo nearby. Some customers may drift away."
    ),
    impact: "negative",
    weight: 10,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost -= 0.05;
      ctx.scratch.activeEventLabel = newsAlert(
        "A rival café is running a loud promo nearby. Some customers may drift away."
      );
    },
  },
  {
    id: "event.festival",
    label: "Local festival",
    description: newsAlert(
      "A downtown festival brought crowds. More foot traffic on the block."
    ),
    impact: "positive",
    weight: 8,
    apply(ctx) {
      bumpFootTraffic(
        ctx,
        1.8,
        "A downtown festival brought crowds. More foot traffic on the block."
      );
    },
  },
  {
    id: "event.viral_positive",
    label: "Viral review (positive)",
    description: newsAlert(
      "A glowing review went viral. New customers are checking out both cafés."
    ),
    impact: "positive",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost += 0.2;
      ctx.scratch.activeEventLabel = newsAlert(
        "A glowing review went viral. New customers are checking out both cafés."
      );
    },
  },
  {
    id: "event.viral_negative",
    label: "Viral review (negative)",
    description: newsAlert(
      "A harsh review spread online. New customers are hesitating."
    ),
    impact: "negative",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost -= 0.15;
      ctx.scratch.activeEventLabel = newsAlert(
        "A harsh review spread online. New customers are hesitating."
      );
    },
  },
  {
    id: "event.social_trend",
    label: "Social media trend",
    description: newsAlert(
      "Coffee is trending online. More people are in the mood for a cup."
    ),
    impact: "positive",
    weight: 4,
    apply(ctx) {
      bumpFootTraffic(
        ctx,
        1.25,
        "Coffee is trending online. More people are in the mood for a cup."
      );
    },
  },
  {
    id: "event.landlord_rent",
    label: "Landlord raises rent",
    description: newsAlert(
      "Rent went up downtown. Fixed costs rose for both shops."
    ),
    impact: "negative",
    weight: 8,
    apply(ctx) {
      ctx.scratch.rentSurcharge = (ctx.scratch.rentSurcharge ?? 0) + 20;
      ctx.scratch.activeEventLabel = newsAlert(
        "Rent went up downtown. Fixed costs rose for both shops."
      );
    },
  },
  {
    id: "event.favorable_press",
    label: "Favorable press",
    description: newsAlert(
      "Local press spotlighted the coffee scene. Good shops got extra buzz."
    ),
    impact: "positive",
    weight: 3,
    apply(ctx) {
      ctx.scratch.streetTrafficBoost += 0.15;
      ctx.scratch.activeEventLabel = newsAlert(
        "Local press spotlighted the coffee scene. Good shops got extra buzz."
      );
    },
  },
  {
    id: "event.power_outage",
    label: "Power outage",
    description: newsAlert(
      "A power outage hit the block. Both shops ran at reduced capacity."
    ),
    impact: "negative",
    weight: 3,
    apply(ctx) {
      ctx.scratch.footTrafficMultiplier *= 0.5;
      ctx.scratch.activeEventLabel = newsAlert(
        "A power outage hit the block. Both shops ran at reduced capacity."
      );
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
