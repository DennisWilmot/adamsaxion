/** Hard/soft action conflicts — data-driven validation. */
export type ActionConflict = {
  actionA: string;
  actionB: string;
  type: "hard" | "soft";
  reason: string;
};

const DEPLOYMENT_MODES = [
  "operations.o01",
  "operations.o02",
  "operations.o03",
  "operations.o04",
] as const;

function modeConflicts(): ActionConflict[] {
  const out: ActionConflict[] = [];
  for (let i = 0; i < DEPLOYMENT_MODES.length; i++) {
    for (let j = i + 1; j < DEPLOYMENT_MODES.length; j++) {
      out.push({
        actionA: DEPLOYMENT_MODES[i]!,
        actionB: DEPLOYMENT_MODES[j]!,
        type: "hard",
        reason: "Only one deployment mode can be active per round.",
      });
    }
  }
  return out;
}

export const ACTION_CONFLICTS: ActionConflict[] = [
  ...modeConflicts(),
  { actionA: "sales.s04", actionB: "sales.s06", type: "hard", reason: "Flash sale conflicts with premium positioning." },
  { actionA: "sales.s05", actionB: "sales.s06", type: "hard", reason: "Price match conflicts with premium floor." },
  { actionA: "sales.s02", actionB: "sales.s06", type: "hard", reason: "Bulk discount undercuts a premium price floor." },
  { actionA: "sales.s04", actionB: "sales.s02", type: "hard", reason: "Flash sale and bulk discount stack margin pressure." },
  { actionA: "sales.s04", actionB: "sales.s05", type: "hard", reason: "Flash sale and price match send mixed pricing signals." },
  { actionA: "hr.h01", actionB: "hr.h02", type: "hard", reason: "Cannot hire and fire in the same round." },
  { actionA: "hr.h03", actionB: "hr.h04", type: "hard", reason: "Cannot raise and cut wages same round." },
  { actionA: "hr.h05", actionB: "hr.h06", type: "hard", reason: "Cannot invest in training and stop training same round." },
  { actionA: "hr.h02", actionB: "hr.h08", type: "hard", reason: "Cannot fire workers and restructure the team same round." },
  { actionA: "procurement.p01", actionB: "procurement.p02", type: "hard", reason: "Cannot upgrade and downgrade supplier same round." },
  { actionA: "procurement.p03", actionB: "procurement.p04", type: "hard", reason: "Cannot increase and reduce buffer same round." },
  { actionA: "procurement.p01", actionB: "procurement.p07", type: "hard", reason: "Cannot switch supplier tier and sourcing mode same round." },
  { actionA: "operations.o05", actionB: "operations.o07", type: "hard", reason: "Cannot start R&D while equipment upgrade is installing." },
  { actionA: "operations.o05", actionB: "operations.o06", type: "hard", reason: "Equipment upgrade and maintenance compete for downtime." },
  { actionA: "marketing.m02", actionB: "marketing.m03", type: "hard", reason: "Cannot launch and deactivate loyalty same round." },
  { actionA: "marketing.m02", actionB: "marketing.m07", type: "hard", reason: "Rebrand and loyalty launch split marketing focus." },
  { actionA: "marketing.m04", actionB: "marketing.m07", type: "hard", reason: "Targeted campaign and rebrand cannot both launch same round." },
  { actionA: "sales.s03", actionB: "sales.s06", type: "hard", reason: "Menu expansion and premium positioning strain the same brand story." },
  { actionA: "finance.f03", actionB: "finance.f04", type: "hard", reason: "Cannot enter and exit cash reserve mode same round." },
  { actionA: "sales.s01", actionB: "sales.s05", type: "soft", reason: "Manual price change may override price-match next round." },
  { actionA: "sales.s01", actionB: "sales.s04", type: "soft", reason: "Manual price change may clash with flash sale timing." },
  { actionA: "sales.s07", actionB: "sales.s06", type: "soft", reason: "Reactive price match undermines premium positioning." },
  { actionA: "marketing.m01", actionB: "marketing.m04", type: "soft", reason: "Budget and targeted campaign overlap spend." },
  { actionA: "marketing.m01", actionB: "marketing.m05", type: "soft", reason: "Budget marketing and counter-marketing overlap." },
  { actionA: "finance.f01", actionB: "finance.f02", type: "soft", reason: "Borrowing and repaying same round is unusual." },
  { actionA: "finance.f01", actionB: "finance.f06", type: "soft", reason: "Borrowing while paying dividends strains cash." },
  { actionA: "hr.h01", actionB: "hr.h03", type: "soft", reason: "Hiring and raising wages compounds labor cost." },
  { actionA: "hr.h03", actionB: "hr.h09", type: "soft", reason: "Raise wages and pay bonuses in the same round is costly." },
  { actionA: "hr.h04", actionB: "hr.h09", type: "soft", reason: "Cut wages while paying bonuses sends mixed signals." },
  { actionA: "operations.o08", actionB: "operations.o06", type: "soft", reason: "Overtime plus maintenance stretches the team thin." },
];

export function findConflicts(moveIds: string[]): ActionConflict[] {
  const set = new Set(moveIds);
  const hits: ActionConflict[] = [];
  for (const c of ACTION_CONFLICTS) {
    if (set.has(c.actionA) && set.has(c.actionB) && c.actionA !== c.actionB) {
      hits.push(c);
    }
  }
  return hits;
}

export function hardConflicts(): ActionConflict[] {
  return ACTION_CONFLICTS.filter((c) => c.type === "hard");
}
