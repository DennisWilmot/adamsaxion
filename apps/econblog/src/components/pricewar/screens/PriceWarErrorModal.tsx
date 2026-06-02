"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { ModalShell } from "./shared/ModalShell";

export interface PriceWarApiErrorBody {
  code?: string;
  message?: string;
}

export interface PriceWarErrorState {
  title: string;
  message: string;
  eyebrow?: string;
  upgradeHref?: string;
  continueHref?: string;
}

export function parsePriceWarApiError(
  body: PriceWarApiErrorBody,
  fallbackMessage: string
): PriceWarErrorState {
  const message = body.message ?? fallbackMessage;
  const code = body.code;
  const lower = message.toLowerCase();

  const atMatchLimit =
    lower.includes("match in progress") ||
    lower.includes("matches in progress") ||
    lower.includes("match running") ||
    lower.includes("maximum for your plan");

  const needsUpgrade =
    lower.includes("upgrade") ||
    lower.includes("paid account") ||
    lower.includes("subscribe") ||
    (code === "FORBIDDEN" && lower.includes("rapid"));

  let title = "Something went wrong";
  let parsedMessage = message;

  if (atMatchLimit && needsUpgrade) {
    title = "Can't start another match rn";
    parsedMessage = "You're already in a game. Upgrade if you want more than one at a time.";
  } else if (atMatchLimit) {
    title = "At your match limit";
    parsedMessage = message.replace(
      /^You have (\d+) matches in progress, the maximum for your plan\.$/i,
      "You've got $1 games going — that's the max on your plan."
    );
  } else if (code === "FORBIDDEN") {
    title = "Not available rn";
    if (needsUpgrade) {
      parsedMessage = "That needs a paid account. Upgrade to unlock it.";
    }
  } else if (code === "RATE_LIMITED") title = "Slow down a sec";
  else if (code === "ALREADY_SUBMITTED") title = "You already locked in this round";
  else if (code === "INSUFFICIENT_RESOURCES") title = "Not enough cash for that move";
  else if (code === "CLOCK_EXPIRED") title = "Time ran out";
  else if (code === "MATCH_COMPLETED") title = "Match finished";
  else if (code === "INVALID_SUBMIT") title = "Invalid move";
  else if (code === "NOT_YOUR_TURN") title = "Not your turn";

  const result: PriceWarErrorState = {
    eyebrow: "Oops!",
    title,
    message: parsedMessage,
  };
  if (needsUpgrade) result.upgradeHref = "/subscribe";
  if (atMatchLimit) result.continueHref = priceWarPaths.history;
  return result;
}

interface PriceWarErrorContextValue {
  showError: (error: PriceWarErrorState | string) => void;
  showApiError: (body: PriceWarApiErrorBody, fallbackMessage: string) => void;
  dismissError: () => void;
}

const PriceWarErrorContext = createContext<PriceWarErrorContextValue | null>(null);

function PriceWarErrorModalView({
  error,
  onDismiss,
}: {
  error: PriceWarErrorState;
  onDismiss: () => void;
}) {
  return (
    <ModalShell width={480} onScrimClick={onDismiss}>
      <div style={{ padding: "24px 26px 22px", borderBottom: `1px solid ${CD.rule}` }}>
        <div className="tab" style={{ color: CD.ink3 }}>
          {error.eyebrow ?? "Oops!"}
        </div>
        <h2 className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 6, lineHeight: 1.15 }}>
          {error.title}
        </h2>
        <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, lineHeight: 1.55 }}>{error.message}</p>
      </div>
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {error.continueHref && (
          <Link href={error.continueHref} onClick={onDismiss}>
            <PillBtn variant="outline" color={CD.ink}>
              View active match
            </PillBtn>
          </Link>
        )}
        {error.upgradeHref && (
          <Link href={error.upgradeHref} onClick={onDismiss}>
            <PillBtn variant="outline" color={CD.primary}>
              Upgrade
            </PillBtn>
          </Link>
        )}
        <PillBtn variant="solid" color={CD.ink} onClick={onDismiss}>
          OK
        </PillBtn>
      </div>
    </ModalShell>
  );
}

export function PriceWarErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<PriceWarErrorState | null>(null);

  const dismissError = useCallback(() => setError(null), []);

  const showError = useCallback((next: PriceWarErrorState | string) => {
    setError(
      typeof next === "string"
        ? { eyebrow: "Oops!", title: "Something went wrong", message: next }
        : { eyebrow: "Oops!", ...next }
    );
  }, []);

  const showApiError = useCallback(
    (body: PriceWarApiErrorBody, fallbackMessage: string) => {
      showError(parsePriceWarApiError(body, fallbackMessage));
    },
    [showError]
  );

  const value = useMemo(
    () => ({ showError, showApiError, dismissError }),
    [showError, showApiError, dismissError]
  );

  return (
    <PriceWarErrorContext.Provider value={value}>
      {children}
      {error && <PriceWarErrorModalView error={error} onDismiss={dismissError} />}
    </PriceWarErrorContext.Provider>
  );
}

export function usePriceWarError() {
  const ctx = useContext(PriceWarErrorContext);
  if (!ctx) {
    throw new Error("usePriceWarError must be used within PriceWarErrorProvider");
  }
  return ctx;
}

/** Safe for components that may render outside the provider (no-op). */
export function usePriceWarErrorOptional() {
  return useContext(PriceWarErrorContext);
}
