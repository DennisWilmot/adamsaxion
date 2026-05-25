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
  upgradeHref?: string;
  continueHref?: string;
}

export function parsePriceWarApiError(
  body: PriceWarApiErrorBody,
  fallbackMessage: string
): PriceWarErrorState {
  const message = body.message ?? fallbackMessage;
  const code = body.code;

  let title = "Something went wrong";
  if (code === "FORBIDDEN") title = "Can't do that";
  else if (code === "RATE_LIMITED") title = "Slow down";
  else if (code === "ALREADY_SUBMITTED") title = "Already locked in";
  else if (code === "INSUFFICIENT_RESOURCES") title = "Not enough cash";
  else if (code === "CLOCK_EXPIRED") title = "Clock expired";
  else if (code === "MATCH_COMPLETED") title = "Match finished";
  else if (code === "INVALID_SUBMIT") title = "Invalid move";
  else if (code === "NOT_YOUR_TURN") title = "Not your turn";

  const lower = message.toLowerCase();
  const showUpgrade =
    lower.includes("upgrade") ||
    lower.includes("paid account") ||
    lower.includes("subscribe") ||
    (code === "FORBIDDEN" && lower.includes("rapid"));

  const showContinue =
    lower.includes("match in progress") || lower.includes("matches in progress");

  const result: PriceWarErrorState = {
    title: showContinue ? "Match in progress" : title,
    message,
  };
  if (showUpgrade) result.upgradeHref = "/subscribe";
  if (showContinue) result.continueHref = priceWarPaths.history;
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
        <div className="tab" style={{ color: CD.red }}>
          {error.continueHref ? "Match in progress" : "Error"}
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
    setError(typeof next === "string" ? { title: "Something went wrong", message: next } : next);
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
