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

/** Declarative report copy — player-facing narrative. */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "RPT-P01",
    audience: "public",
    body: "It was a busy day. Both cafés saw more customers than usual.",
    when: { kind: "traffic_surge" },
  },
  {
    id: "RPT-P02",
    audience: "public",
    body: "A slow day downtown. Fewer people walked in than usual.",
    when: { kind: "traffic_drop" },
  },
  {
    id: "RPT-P03",
    audience: "public",
    body: "Both shops had a solid day. Plenty of customers to go around.",
    when: { kind: "customers_up" },
  },
  {
    id: "RPT-P04",
    audience: "public",
    body: "Good news lifted the whole block this round.",
    when: { kind: "event_positive" },
  },
  {
    id: "RPT-P05",
    audience: "public",
    body: "Tough news hit the block. Weather or costs made the day harder.",
    when: { kind: "event_negative" },
  },
  {
    id: "RPT-P06",
    audience: "public",
    body: "Customer counts were low. Price and how much you could serve both mattered.",
    when: { kind: "customers_down" },
  },

  {
    id: "RPT-02",
    audience: "private",
    body: "Good round. You made more money and kept the shop running smoothly.",
    when: { kind: "profit_up" },
  },
  {
    id: "RPT-03",
    audience: "private",
    body: "You lost money this round. Look at wages, ads, or your price.",
    when: { kind: "profit_down" },
  },
  {
    id: "RPT-04",
    audience: "private",
    body: "More customers came in, but profit still fell. Costs or thin margins may be why.",
    when: { kind: "profit_down_customers_up" },
    followUp: [
      {
        id: "RPT-04a",
        audience: "private",
        body: "Check whether a flash sale or overtime stretch caused the squeeze.",
        when: { kind: "profit_down_customers_up" },
      },
    ],
  },
  {
    id: "RPT-05",
    audience: "private",
    body: "Overtime kept orders flowing, but staff costs and morale need watching.",
    when: { kind: "overtime" },
  },
  {
    id: "RPT-06",
    audience: "private",
    body: "You won the round on both money and customers. Price and capacity worked together.",
    when: { kind: "profit_up_customers_up" },
  },
  {
    id: "RPT-07",
    audience: "private",
    body: "Fewer customers and less cash. Check your price, how much you could serve, or ingredient costs.",
    when: { kind: "profit_down_customers_down" },
  },
  {
    id: "RPT-08",
    audience: "private",
    body: "You served more customers than {opponent} this round.",
    when: { kind: "customers_won_vs_opponent" },
  },
  {
    id: "RPT-09",
    audience: "private",
    body: "{opponent} served more customers. Your price or capacity may have lagged.",
    when: { kind: "customers_lost_vs_opponent" },
  },
  {
    id: "RPT-10",
    audience: "private",
    body: "You were nearly maxed out. A rush of customers would have left some waiting.",
    when: { kind: "capacity_capped" },
  },
  {
    id: "RPT-11",
    audience: "private",
    body: "Ingredient costs spiked. Extra stock helped if you had it.",
    when: { kind: "supply_shock" },
  },
  {
    id: "RPT-12",
    audience: "private",
    body: "Team morale is fragile. Another stretch of overtime could backfire.",
    when: { kind: "morale_low" },
  },
  {
    id: "RPT-13",
    audience: "private",
    body: "Team morale dropped after this round's workload.",
    when: { kind: "morale_drop" },
  },
  {
    id: "RPT-14",
    audience: "private",
    body: "Guest rating sits at ${review} stars. Customers are noticing quality and wait times.",
    when: { kind: "review_high" },
  },
  {
    id: "RPT-15",
    audience: "private",
    body: "Reviews softened (${review} stars). Service or quality may need attention.",
    when: { kind: "review_low" },
  },
  {
    id: "RPT-16",
    audience: "private",
    body: "Cash is running low. Another bad round could put you out of business.",
    when: { kind: "bankruptcy_risk" },
  },
  {
    id: "RPT-17",
    audience: "private",
    body: "Your sale brought in customers. Check whether you still made money per cup.",
    when: { kind: "flash_sale" },
  },
  {
    id: "RPT-18",
    audience: "private",
    body: "Debt payments are weighing on cash. Interest adds up each round.",
    when: { kind: "debt_pressure" },
  },
  {
    id: "RPT-19",
    audience: "private",
    body: "Your loyalty program is paying off. Regulars are sticking around.",
    when: { kind: "loyalty_active" },
  },
  {
    id: "RPT-20",
    audience: "private",
    body: "Training spend is building skill. Payoff grows over the next few rounds.",
    when: { kind: "training_active" },
  },
  {
    id: "RPT-21",
    audience: "private",
    body: "R&D is underway. Capacity stays tight until the project finishes.",
    when: { kind: "rd_active" },
  },
  {
    id: "RPT-22",
    audience: "private",
    body: "You are charging more and aiming for fewer, higher-value customers.",
    when: { kind: "premium_positioning" },
  },
  {
    id: "RPT-23",
    audience: "private",
    body: "Marketing spend is elevated. Watch whether it pays off next round.",
    when: { kind: "marketing_spend" },
  },
  {
    id: "RPT-24",
    audience: "private",
    body: "Insurance is active. Financial shocks hit less hard this round.",
    when: { kind: "insurance_active" },
  },
  {
    id: "RPT-25",
    audience: "private",
    body: "Staffing drama this round. Poaching or team conflict showed up in outcomes.",
    when: { kind: "poach_related" },
  },
];
