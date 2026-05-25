"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Full burst — for standalone phrases in large display type */
const RAYS_FULL: [number, number, number, number][] = [
  [75, 36, 68, 8],
  [90, 36, 85, 4],
  [100, 36, 100, 2],
  [110, 36, 115, 6],
  [125, 36, 132, 10],
  [160, 36, 175, 12],
  [162, 38, 182, 22],
  [164, 45, 188, 34],
  [164, 50, 192, 46],
  [164, 55, 195, 55],
  [164, 62, 190, 68],
  [162, 72, 184, 82],
  [160, 74, 178, 92],
  [155, 74, 168, 96],
  [125, 74, 130, 98],
  [110, 74, 112, 102],
  [100, 74, 100, 105],
  [90, 74, 88, 100],
  [75, 74, 70, 96],
  [42, 74, 28, 90],
  [40, 72, 18, 82],
  [38, 68, 12, 76],
  [36, 62, 8, 66],
  [36, 55, 5, 55],
  [36, 48, 6, 42],
  [38, 40, 14, 24],
  [40, 38, 22, 16],
  [45, 36, 30, 10],
];

/** Compact burst — short rays for inline words */
const RAYS_INLINE: [number, number, number, number][] = [
  [100, 50, 100, 10],
  [100, 50, 114, 14],
  [100, 50, 122, 26],
  [100, 50, 126, 40],
  [100, 50, 86, 14],
  [100, 50, 78, 26],
  [100, 50, 74, 40],
  [100, 50, 100, 88],
  [100, 50, 112, 82],
  [100, 50, 122, 72],
  [100, 50, 88, 82],
  [100, 50, 78, 72],
  [100, 50, 132, 50],
  [100, 50, 68, 50],
  [100, 50, 116, 32],
  [100, 50, 84, 32],
];

const DOTS_FULL: [number, number][] = [
  [60, 6],
  [98, 0],
  [140, 8],
  [185, 18],
  [195, 50],
  [186, 80],
  [160, 100],
  [100, 108],
  [65, 100],
  [15, 82],
  [4, 50],
  [12, 20],
];

const DOTS_INLINE: [number, number][] = [
  [100, 8],
  [128, 24],
  [72, 24],
  [136, 50],
  [64, 50],
  [124, 76],
  [76, 76],
  [100, 92],
];

/** Word at start of line — fan left/up/down, minimal right spill */
const RAYS_INLINE_START: [number, number, number, number][] = [
  [100, 50, 100, 8],
  [100, 50, 86, 12],
  [100, 50, 74, 22],
  [100, 50, 66, 36],
  [100, 50, 62, 50],
  [100, 50, 66, 64],
  [100, 50, 74, 76],
  [100, 50, 86, 84],
  [100, 50, 100, 90],
  [100, 50, 114, 84],
  [100, 50, 122, 74],
  [100, 50, 118, 58],
  [100, 50, 112, 42],
  [100, 50, 94, 34],
  [100, 50, 52, 50],
  [100, 50, 44, 62],
  [100, 50, 48, 38],
  [100, 50, 108, 68],
];

export function BurstHighlight({
  children,
  color = "#2563EB",
  animate = true,
  variant = "full",
  placement = "middle",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  animate?: boolean;
  variant?: "full" | "inline";
  placement?: "start" | "middle";
  className?: string;
}) {
  const [visible, setVisible] = useState(!animate);
  const isInline = variant === "inline";
  const rays = isInline
    ? placement === "start"
      ? RAYS_INLINE_START
      : RAYS_INLINE
    : RAYS_FULL;
  const dots = isInline ? DOTS_INLINE : DOTS_FULL;

  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, [animate]);

  const rayOpacity = isInline ? 0.82 : 0.55;
  const dotOpacity = isInline ? 0.7 : 0.4;
  const strokeWidth = (i: number) =>
    isInline ? 5 + (i % 3) * 1.5 : 1.5 + (i % 3) * 0.6;

  const svg = (
    <svg
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={`pointer-events-none absolute overflow-visible ${
        isInline
          ? "left-1/2 top-1/2 z-[2] h-[240%] w-[220%] -translate-x-1/2 -translate-y-1/2"
          : "left-1/2 top-1/2 z-0 h-[240%] w-[140%] -translate-x-1/2 -translate-y-1/2"
      }`}
    >
      {rays.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={visible ? x2 : x1}
          y2={visible ? y2 : y1}
          stroke={color}
          strokeWidth={strokeWidth(i)}
          strokeLinecap="round"
          style={{
            opacity: visible ? rayOpacity + (i % 3) * 0.04 : 0,
            transition: `all 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.02}s`,
          }}
        />
      ))}
      {dots.map(([cx, cy], i) => (
        <circle
          key={`d-${i}`}
          cx={cx}
          cy={cy}
          r={isInline ? 2 + (i % 2) * 0.8 : 1.2 + (i % 3) * 0.5}
          fill={color}
          style={{
            opacity: visible ? dotOpacity + (i % 2) * 0.06 : 0,
            transition: `opacity 0.3s ease ${0.35 + i * 0.04}s`,
          }}
        />
      ))}
    </svg>
  );

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {isInline ? (
        <>
          <span className="relative z-[1]">{children}</span>
          {svg}
        </>
      ) : (
        <>
          {svg}
          <span className="relative z-[1]">{children}</span>
        </>
      )}
    </span>
  );
}
