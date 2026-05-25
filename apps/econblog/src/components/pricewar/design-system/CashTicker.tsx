"use client";

import { useEffect, useRef } from "react";
import { CD } from "./tokens";

export interface CashTickerProps {
  value: number;
  prefix?: string;
  size?: number;
}

export function CashTicker({ value, prefix = "$", size = 22 }: CashTickerProps) {
  const prev = useRef(value);
  const dir = value > prev.current ? "up" : value < prev.current ? "down" : null;

  useEffect(() => {
    prev.current = value;
  }, [value]);

  return (
    <span
      className="num"
      style={{
        display: "inline-block",
        fontSize: size,
        color: CD.ink,
        fontWeight: 500,
        overflow: "hidden",
        verticalAlign: "middle",
      }}
    >
      {prefix}
      <span
        key={value}
        className={dir === "up" ? "cd-tick-up" : dir === "down" ? "cd-tick-down" : undefined}
      >
        {Math.round(value).toLocaleString()}
      </span>
    </span>
  );
}

export function CashTrend({ points = [], color = CD.ink }: { points?: number[]; color?: string }) {
  if (!points || points.length < 2) return null;
  const w = 56;
  const h = 14;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const r = Math.max(1, max - min);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / r) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }} aria-hidden>
      <path
        d={path}
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
