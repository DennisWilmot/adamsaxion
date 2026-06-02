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
        reason: "You can only run one service mode per round.",
      });
    }
  }
  return out;
}

export const ACTION_CONFLICTS: ActionConflict[] = [
  ...modeConflicts(),
  { actionA: "sales.s04", actionB: "sales.s06", type: "hard", reason: "A flash sale clashes with premium positioning." },
  { actionA: "sales.s05", actionB: "sales.s06", type: "hard", reason: "Price matching conflicts with a premium price floor." },
  { actionA: "sales.s02", actionB: "sales.s06", type: "hard", reason: "Bulk discounts undercut a premium price floor." },
  { actionA: "sales.s04", actionB: "sales.s02", type: "hard", reason: "Flash sale and bulk discount both squeeze margins." },
  { actionA: "sales.s04", actionB: "sales.s05", type: "hard", reason: "Flash sale and price match send mixed pricing signals." },
  { actionA: "hr.h01", actionB: "hr.h02", type: "hard", reason: "You cannot hire and fire in the same round." },
  { actionA: "hr.h03", actionB: "hr.h04", type: "hard", reason: "You cannot raise and cut wages in the same round." },
  { actionA: "hr.h05", actionB: "hr.h06", type: "hard", reason: "You cannot start and stop training in the same round." },
  { actionA: "hr.h02", actionB: "hr.h08", type: "hard", reason: "You cannot fire workers and restructure the team in the same round." },
  { actionA: "procurement.p01", actionB: "procurement.p02", type: "hard", reason: "You cannot upgrade and downgrade your supplier in the same round." },
  { actionA: "procurement.p03", actionB: "procurement.p04", type: "hard", reason: "You cannot increase and reduce stock in the same round." },
  { actionA: "procurement.p01", actionB: "procurement.p07", type: "hard", reason: "You cannot change supplier tier and sourcing mode in the same round." },
  { actionA: "operations.o05", actionB: "operations.o07", type: "hard", reason: "You cannot start R&D while equipment is being upgraded." },
  { actionA: "operations.o05", actionB: "operations.o06", type: "hard", reason: "Equipment upgrade and maintenance compete for downtime." },
  { actionA: "marketing.m02", actionB: "marketing.m03", type: "hard", reason: "You cannot launch and shut down loyalty in the same round." },
  { actionA: "marketing.m02", actionB: "marketing.m07", type: "hard", reason: "Rebrand and loyalty launch split your marketing focus." },
  { actionA: "marketing.m04", actionB: "marketing.m07", type: "hard", reason: "You cannot run a targeted campaign and rebrand in the same round." },
  { actionA: "sales.s03", actionB: "sales.s06", type: "hard", reason: "Menu expansion and premium positioning strain the same brand story." },
  { actionA: "finance.f03", actionB: "finance.f04", type: "hard", reason: "You cannot enter and exit cash reserve mode in the same round." },
  { actionA: "sales.s01", actionB: "sales.s05", type: "soft", reason: "A manual price change may override price match next round." },
  { actionA: "sales.s01", actionB: "sales.s04", type: "soft", reason: "A manual price change may clash with flash sale timing." },
  { actionA: "sales.s07", actionB: "sales.s06", type: "soft", reason: "Reactive price matching undermines premium positioning." },
  { actionA: "marketing.m01", actionB: "marketing.m04", type: "soft", reason: "Budget marketing and a targeted campaign overlap spend." },
  { actionA: "marketing.m01", actionB: "marketing.m05", type: "soft", reason: "Budget marketing and counter-marketing overlap spend." },
  { actionA: "finance.f01", actionB: "finance.f02", type: "soft", reason: "Borrowing and repaying in the same round is unusual." },
  { actionA: "finance.f01", actionB: "finance.f06", type: "soft", reason: "Borrowing while paying dividends strains cash." },
  { actionA: "hr.h01", actionB: "hr.h03", type: "soft", reason: "Hiring and raising wages compounds labor cost." },
  { actionA: "hr.h03", actionB: "hr.h09", type: "soft", reason: "Raising wages and paying bonuses in the same round is costly." },
  { actionA: "hr.h04", actionB: "hr.h09", type: "soft", reason: "Cutting wages while paying bonuses sends mixed signals." },
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
