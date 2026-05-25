export type ReportConditionKind =
  | "always"
  | "profit_up"
  | "profit_down"
  | "profit_up_customers_up"
  | "profit_down_customers_down"
  | "profit_down_customers_up"
  | "customers_up"
  | "customers_down"
  | "customers_won_vs_opponent"
  | "customers_lost_vs_opponent"
  | "overtime"
  | "flash_sale"
  | "bankruptcy_risk"
  | "supply_shock"
  | "traffic_surge"
  | "traffic_drop"
  | "morale_low"
  | "morale_drop"
  | "review_high"
  | "review_low"
  | "capacity_capped"
  | "debt_pressure"
  | "loyalty_active"
  | "training_active"
  | "rd_active"
  | "premium_positioning"
  | "marketing_spend"
  | "poach_related"
  | "insurance_active"
  | "event_negative"
  | "event_positive";

export type ReportTemplate = {
  id: string;
  audience: "public" | "private";
  body: string;
  when?: {
    kind: ReportConditionKind;
    slot?: "A" | "B";
  };
  followUp?: ReportTemplate[];
};

/** Declarative report copy — aligned to spreadsheet / game-spec narrative chains. */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ── Public strip (market commentary) ─────────────────────────────────────
  {
    id: "RPT-P01",
    audience: "public",
    body: "Foot traffic surged on the block — both cafés felt the rush.",
    when: { kind: "traffic_surge" },
  },
  {
    id: "RPT-P02",
    audience: "public",
    body: "A quiet day downtown — walk-in traffic was softer than usual.",
    when: { kind: "traffic_drop" },
  },
  {
    id: "RPT-P03",
    audience: "public",
    body: "Both shops stayed busy — demand on the street was strong.",
    when: { kind: "customers_up" },
  },
  {
    id: "RPT-P04",
    audience: "public",
    body: "A market tailwind lifted the whole street this round.",
    when: { kind: "event_positive" },
  },
  {
    id: "RPT-P05",
    audience: "public",
    body: "Headwinds hit the block — weather or supply news dragged on traffic.",
    when: { kind: "event_negative" },
  },
  {
    id: "RPT-P06",
    audience: "public",
    body: "Customer counts were thin — pricing and capacity both mattered.",
    when: { kind: "customers_down" },
  },

  // ── Private narrative (per player) ───────────────────────────────────────
  {
    id: "RPT-02",
    audience: "private",
    body: "Strong round — profit up while you held the line on operations.",
    when: { kind: "profit_up" },
  },
  {
    id: "RPT-03",
    audience: "private",
    body: "Cash slipped this round; check wages, marketing burn, or price.",
    when: { kind: "profit_down" },
  },
  {
    id: "RPT-04",
    audience: "private",
    body: "You gained traffic but profit fell — margin or a cost shock likely ate the upside.",
    when: { kind: "profit_down_customers_up" },
    followUp: [
      {
        id: "RPT-04a",
        audience: "private",
        body: "Consider whether a flash promotion or overtime stretch caused the squeeze.",
        when: { kind: "profit_down_customers_up" },
      },
    ],
  },
  {
    id: "RPT-05",
    audience: "private",
    body: "Overtime kept the line moving but morale and wage costs deserve a look next round.",
    when: { kind: "overtime" },
  },
  {
    id: "RPT-06",
    audience: "private",
    body: "You won the round on both cash and customer count — pricing and capacity clicked.",
    when: { kind: "profit_up_customers_up" },
  },
  {
    id: "RPT-07",
    audience: "private",
    body: "Fewer customers and a cash hit — diagnose price, capacity, or input costs.",
    when: { kind: "profit_down_customers_down" },
  },
  {
    id: "RPT-08",
    audience: "private",
    body: "You took more customers than {opponent} this round.",
    when: { kind: "customers_won_vs_opponent" },
  },
  {
    id: "RPT-09",
    audience: "private",
    body: "{opponent} served more customers — your price or capacity may have lagged.",
    when: { kind: "customers_lost_vs_opponent" },
  },
  {
    id: "RPT-10",
    audience: "private",
    body: "You ran near full capacity — any demand spike would have overflowed.",
    when: { kind: "capacity_capped" },
  },
  {
    id: "RPT-11",
    audience: "private",
    body: "Supply costs spiked — margins squeezed unless buffer stock absorbed the shock.",
    when: { kind: "supply_shock" },
  },
  {
    id: "RPT-12",
    audience: "private",
    body: "Morale is fragile — another overtime stretch could backfire.",
    when: { kind: "morale_low" },
  },
  {
    id: "RPT-13",
    audience: "private",
    body: "Team morale dropped noticeably after this round's workload.",
    when: { kind: "morale_drop" },
  },
  {
    id: "RPT-14",
    audience: "private",
    body: "Review score sits at ${review} — guests are noticing quality and wait times.",
    when: { kind: "review_high" },
  },
  {
    id: "RPT-15",
    audience: "private",
    body: "Reviews softened (${review}) — service or quality may need attention.",
    when: { kind: "review_low" },
  },
  {
    id: "RPT-16",
    audience: "private",
    body: "Cash is thin — bankruptcy risk rises if losses repeat.",
    when: { kind: "bankruptcy_risk" },
  },
  {
    id: "RPT-17",
    audience: "private",
    body: "Flash promotion moved volume — check whether margin held.",
    when: { kind: "flash_sale" },
  },
  {
    id: "RPT-18",
    audience: "private",
    body: "Debt service is weighing on cash — interest adds up each round.",
    when: { kind: "debt_pressure" },
  },
  {
    id: "RPT-19",
    audience: "private",
    body: "Loyalty program is paying off — regulars are sticking around.",
    when: { kind: "loyalty_active" },
  },
  {
    id: "RPT-20",
    audience: "private",
    body: "Training spend is building skill — payoff compounds over the next few rounds.",
    when: { kind: "training_active" },
  },
  {
    id: "RPT-21",
    audience: "private",
    body: "R&D is underway — capacity is tight until the project completes.",
    when: { kind: "rd_active" },
  },
  {
    id: "RPT-22",
    audience: "private",
    body: "Premium positioning is active — you are trading volume for margin.",
    when: { kind: "premium_positioning" },
  },
  {
    id: "RPT-23",
    audience: "private",
    body: "Marketing spend is elevated — watch ROI on the next report.",
    when: { kind: "marketing_spend" },
  },
  {
    id: "RPT-24",
    audience: "private",
    body: "Insurance is active — financial shocks hit less hard this round.",
    when: { kind: "insurance_active" },
  },
  {
    id: "RPT-25",
    audience: "private",
    body: "Staffing drama this round — poaching or team conflict showed up in outcomes.",
    when: { kind: "poach_related" },
  },
];
