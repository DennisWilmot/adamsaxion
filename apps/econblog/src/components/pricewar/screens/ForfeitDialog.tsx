"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { usePriceWarError } from "@/components/pricewar/screens/PriceWarErrorModal";
import { ModalShell } from "./shared/ModalShell";

export function ForfeitDialog({
  matchId,
  triggerVariant = "ghost",
  opponentName = "your opponent",
  eloPenalty,
}: {
  matchId: string;
  triggerVariant?: "ghost" | "outline";
  opponentName?: string;
  eloPenalty?: number | null;
}) {
  const router = useRouter();
  const { showApiError } = usePriceWarError();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const armed = confirm === "FORFEIT";

  async function confirmForfeit() {
    if (!armed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pricewar/match/${matchId}/forfeit`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        showApiError(data, "Could not forfeit match");
        return;
      }
      setOpen(false);
      router.push(priceWarPaths.match.postmatch(matchId));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PillBtn variant={triggerVariant} color={CD.ink3} size="sm" onClick={() => setOpen(true)}>
        Forfeit match
      </PillBtn>

      {open && (
        <ModalShell width={540} onScrimClick={() => !loading && setOpen(false)}>
          <div style={{ padding: "24px 26px 22px", borderBottom: `1px solid ${CD.rule}` }}>
            <div className="tab" style={{ color: CD.red }}>
              Forfeit · permanent
            </div>
            <h2 className="serif" style={{ fontSize: 30, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
              Walk away from this match?
            </h2>
            <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, lineHeight: 1.5 }}>
              {opponentName.split(" ")[0]} takes the win.
              {eloPenalty != null && (
                <>
                  {" "}
                  You lose{" "}
                  <span className="num" style={{ color: CD.red, fontWeight: 600 }}>
                    {eloPenalty} Elo
                  </span>
                </>
              )}{" "}
              There&apos;s no undo.
            </p>
          </div>

          <div style={{ padding: "18px 26px 20px", background: CD.paperDeep }}>
            <CoachBubble label="Prof. Aldo · Wait">
              Down isn&apos;t out. If you&apos;re set on this, type FORFEIT below.
            </CoachBubble>
            <div style={{ marginTop: 16 }}>
              <div className="tab" style={{ marginBottom: 6 }}>
                Type FORFEIT to confirm
              </div>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.toUpperCase())}
                placeholder="FORFEIT"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontFamily: "var(--font-cd-mono), monospace",
                  fontSize: 16,
                  letterSpacing: "0.08em",
                  background: CD.paper,
                  color: CD.ink,
                  border: `1px solid ${armed ? CD.red : CD.rule}`,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <PillBtn variant="ghost" color={CD.ink3} onClick={() => setOpen(false)} disabled={loading}>
              Stay in the match
            </PillBtn>
            <PillBtn
              variant="solid"
              color={armed ? CD.red : CD.ink3}
              onClick={() => void confirmForfeit()}
              disabled={!armed || loading}
            >
              Confirm forfeit
            </PillBtn>
          </div>
        </ModalShell>
      )}
    </>
  );
}
