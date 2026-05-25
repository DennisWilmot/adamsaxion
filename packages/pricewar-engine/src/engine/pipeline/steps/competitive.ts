import type { PipelineContext } from "../context";
import { getSim, writeSim, moraleUnit, setMorale, COSTS } from "../../../simulation/player-sim";

/** Resolves competitive HR actions simultaneously against actionBaseline. */
export function stepCompetitive(ctx: PipelineContext): void {
  const { poachAttempt } = ctx.scratch;
  if (!poachAttempt.A && !poachAttempt.B) return;

  const staffBaseline = {
    A: ctx.state.playersPrivate.A.staffCount,
    B: ctx.state.playersPrivate.B.staffCount,
  };

  const attempt = (attacker: "A" | "B", defender: "B" | "A") => {
    if (!poachAttempt[attacker]) return;
    const atkPriv = ctx.state.playersPrivate[attacker];
    const defPriv = ctx.state.playersPrivate[defender];
    const defStaffBaseline = staffBaseline[defender];
    if (defStaffBaseline <= 1) return;
    if (atkPriv.cash < COSTS.poach + getSim(ctx.state, attacker).wagePerWorker) return;

    const success = ctx.rng.next() < 0.55;
    atkPriv.cash -= COSTS.poach;
    const atkSim = getSim(ctx.state, attacker);
    const defSim = getSim(ctx.state, defender);

    if (success) {
      atkPriv.staffCount += 1;
      defPriv.staffCount -= 1;
      atkSim.avgSkill = Math.min(1, atkSim.avgSkill + 0.08);
      defSim.avgSkill = Math.max(0.1, defSim.avgSkill - 0.06);
      setMorale(defPriv, moraleUnit(defPriv.morale) - 0.05);
      atkSim.cooldownUntilRound["hr.h07"] = ctx.round + 3;
      ctx.scratch.privateActionNotes[attacker].push("Poach succeeded — experienced hire joined your team.");
      ctx.scratch.privateActionNotes[defender].push("A competitor poached one of your baristas.");
    } else {
      ctx.scratch.privateActionNotes[attacker].push("Poach attempt failed — rival was alerted.");
    }
    writeSim(atkPriv, atkSim);
    writeSim(defPriv, defSim);
  };

  attempt("A", "B");
  attempt("B", "A");
}
