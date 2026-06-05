"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CD } from "./tokens";

/** Reference-aligned semantic tokens (margin-gamev2 `T`). */
export const MT = {
  paper: "#eef1f6",
  paper2: "#f7f9fc",
  card: "#ffffff",
  ink: CD.ink,
  ink2: CD.ink2,
  ink3: CD.ink3,
  ink4: CD.ink4,
  rule: "#e4e8ef",
  ruleSoft: "#eef2f7",
  blue: CD.primary,
  blueSoft: CD.primarySoft,
  blueLine: "#b6d0fb",
  green: CD.green,
  greenSoft: CD.greenSoft,
  red: CD.red,
  redSoft: CD.redSoft,
  coach: "#fdf4d0",
  coachLine: "#f0e0a0",
  coachInk: "#5c4d16",
  warnSoft: "#fdf0d8",
  warnLine: "#f0d99a",
  warnInk: "#9a6b12",
} as const;

export function Cash({
  v,
  sign = false,
  size = "inherit",
  color,
}: {
  v: number;
  sign?: boolean;
  size?: number | string;
  color?: string;
}) {
  const neg = v < 0;
  const text =
    (sign && v > 0 ? "+" : "") +
    (neg ? "−" : "") +
    "$" +
    Math.abs(v).toLocaleString();
  return (
    <span className="mono" style={{ fontSize: size, color: color ?? "inherit", fontWeight: 600 }}>
      {text}
    </span>
  );
}

export function Price({
  v,
  size = "inherit",
  color,
}: {
  v: number;
  size?: number | string;
  color?: string;
}) {
  return (
    <span className="mono" style={{ fontSize: size, color: color ?? "inherit", fontWeight: 600 }}>
      {v}¢
    </span>
  );
}

export function Eyebrow({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="tab"
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: MT.ink3,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MarginBtn({
  children,
  kind = "primary",
  size = "md",
  full,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  kind?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const sizes = {
    sm: { p: "7px 14px", f: 13 },
    md: { p: "11px 18px", f: 14 },
    lg: { p: "15px 22px", f: 16 },
  };
  const z = sizes[size];
  const styles =
    kind === "primary"
      ? {
          background: disabled ? MT.ink4 : MT.blue,
          color: "#fff",
          border: "1px solid transparent",
        }
      : kind === "danger"
        ? {
            background: "transparent",
            color: MT.red,
            border: `1px solid ${MT.redSoft}`,
          }
        : {
            background: "transparent",
            color: MT.blue,
            border: `1px solid ${MT.rule}`,
          };

  return (
    <button
      type={type}
      className={cn("mt-press", className)}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: z.p,
        fontSize: z.f,
        fontWeight: 600,
        borderRadius: 999,
        cursor: disabled ? "default" : "pointer",
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.55 : 1,
        ...styles,
      }}
    >
      {children}
    </button>
  );
}

export function StatusPill({
  tone = "ink",
  children,
}: {
  tone?: "ink" | "blue" | "green" | "red" | "warn";
  children: ReactNode;
}) {
  const map = {
    ink: { bg: MT.paper2, bd: MT.rule, fg: MT.ink2 },
    blue: { bg: MT.blueSoft, bd: MT.blueLine, fg: MT.blue },
    green: { bg: MT.greenSoft, bd: "#bfe6cc", fg: MT.green },
    red: { bg: MT.redSoft, bd: "#f3c0c0", fg: MT.red },
    warn: { bg: MT.warnSoft, bd: MT.warnLine, fg: MT.warnInk },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: map.bg,
        border: `1px solid ${map.bd}`,
        color: map.fg,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function StatusDot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 99,
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export function MarginPanel({
  children,
  pad = 18,
  style,
}: {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: MT.card,
        border: `1px solid ${MT.rule}`,
        borderRadius: 16,
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
