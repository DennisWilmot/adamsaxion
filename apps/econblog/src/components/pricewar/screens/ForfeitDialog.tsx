"use client";

import type { MouseEvent, ReactElement } from "react";
import { cloneElement, isValidElement, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CoachBubble } from "../design-system/CoachBubble";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { getMatchEndPath } from "@/client/pricewar/match-routing";
import { refreshMatchView, refreshPriceWarHistory } from "@/client/pricewar/match-view-cache";
import { priceWarPaths } from "@/lib/games/routes";
import { usePriceWarErrorOptional } from "@/components/pricewar/screens/PriceWarErrorModal";
import { ModalShell } from "./shared/ModalShell";

export function ForfeitDialog({
  matchId,
  triggerVariant = "ghost",
  triggerLabel = "Forfeit match",
  opponentName = "your opponent",
  eloPenalty,
  redirectOnSuccess = true,
  disabled,
  trigger,
}: {
  matchId: string;
  triggerVariant?: "ghost" | "outline";
  triggerLabel?: string;
  opponentName?: string;
  eloPenalty?: number | null;
  /** When false, refresh match view in place (game shell) instead of navigating away. */
  redirectOnSuccess?: boolean;
  disabled?: boolean;
  trigger?: ReactElement;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const errorModal = usePriceWarErrorOptional();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const armed = confirm === "FORFEIT";

  function openDialog() {
    if (disabled || loading) return;
    setConfirm("");
    setOpen(true);
  }

  function closeDialog() {
    if (loading) return;
    setOpen(false);
    setConfirm("");
  }

  async function confirmForfeit() {
    if (!armed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pricewar/match/${matchId}/forfeit`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        errorModal?.showApiError(data, "Could not forfeit match");
        return;
      }
      setOpen(false);
      setConfirm("");
      const freshView = await refreshMatchView(queryClient, matchId);
      await refreshPriceWarHistory(queryClient);
      if (redirectOnSuccess) {
        router.push(
          freshView ? getMatchEndPath(matchId, freshView) : priceWarPaths.match.postmatch(matchId)
        );
      } else if (freshView?.phase === "completed") {
        router.push(priceWarPaths.lobby);
      }
    } finally {
      setLoading(false);
    }
  }

  const triggerNode =
    trigger && isValidElement(trigger)
      ? cloneElement(
          trigger as ReactElement<{ onClick?: (event: MouseEvent) => void; disabled?: boolean }>,
          {
            onClick: (event: MouseEvent) => {
              const props = trigger.props as { onClick?: (event: MouseEvent) => void };
              props.onClick?.(event);
              if (!event.defaultPrevented) openDialog();
            },
            ...(disabled || loading || (trigger.props as { disabled?: boolean }).disabled
              ? { disabled: true }
              : {}),
          }
        )
      : (
          <PillBtn
            variant={triggerVariant}
            color={CD.ink3}
            size="sm"
            onClick={openDialog}
            disabled={disabled || loading}
          >
            {triggerLabel}
          </PillBtn>
        );

  return (
    <>
      {triggerNode}

      {open && (
        <ModalShell width={540} onScrimClick={closeDialog}>
          <div style={{ padding: "24px 26px 22px", borderBottom: `1px solid ${CD.rule}` }}>
            <div className="tab" style={{ color: CD.red }}>
              Forfeit · permanent
            </div>
            <h2 className="serif" style={{ fontSize: 30, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
              Walk away from this match?
            </h2>
            <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, lineHeight: 1.5 }}>
              {opponentName.split(" ")[0]} gets the win.
              {eloPenalty != null && (
                <>
                  {" "}
                  You lose{" "}
                  <span className="num" style={{ color: CD.red, fontWeight: 600 }}>
                    {eloPenalty} rating points
                  </span>
                </>
              )}{" "}
              This cannot be undone.
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
                autoFocus
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
            <PillBtn variant="ghost" color={CD.ink3} onClick={closeDialog} disabled={loading}>
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
