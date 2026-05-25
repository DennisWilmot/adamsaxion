"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

/** Tapered closed path — thick center, pointed ends */
const BRUSH_MAIN =
  "M 2,20 C 18,19.5 42,11 88,10 C 136,9 178,9.5 220,10 C 268,10.5 312,11.5 352,14 C 382,16.5 396,18.5 399,20 C 396,21.5 382,23.5 352,26 C 312,28.5 268,30 220,30 C 178,30.5 136,30 88,29 C 42,28 18,20.5 2,20 Z";

/** Offset layer for depth and irregularity */
const BRUSH_LAYER =
  "M 6,20 C 24,18 52,12 96,11.5 C 148,10.5 192,11 234,11.5 C 278,12 318,13.5 356,16 C 384,18 394,19.5 396,20 C 388,22 368,25 328,27.5 C 284,29.5 238,29.5 194,29 C 148,28.5 98,27 54,24.5 C 28,22.5 10,21 6,20 Z";

/** Dry brush flecks at tapered ends */
const DRY_FLECKS = [
  { cx: 6, cy: 19.5, rx: 1.8, ry: 0.6, opacity: 0.45 },
  { cx: 12, cy: 20.8, rx: 1.2, ry: 0.5, opacity: 0.3 },
  { cx: 18, cy: 18.8, rx: 0.9, ry: 0.4, opacity: 0.25 },
  { cx: 382, cy: 19.2, rx: 1.5, ry: 0.55, opacity: 0.4 },
  { cx: 390, cy: 20.5, rx: 1.1, ry: 0.45, opacity: 0.3 },
  { cx: 396, cy: 19.8, rx: 0.8, ry: 0.35, opacity: 0.2 },
];

export function BrushUnderline({
  children,
  color = "#2563EB",
  thickness = 14,
  animate = true,
  offset = 4,
}: {
  children: ReactNode;
  color?: string;
  thickness?: number;
  animate?: boolean;
  offset?: number;
}) {
  const [visible, setVisible] = useState(!animate);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, [animate]);

  const filterId = `brush-grain-${id}`;
  const clipId = `brush-clip-${id}`;
  const height = thickness + 12;

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-[1]">{children}</span>
      <svg
        viewBox="0 0 400 40"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute left-[-6%] z-0 overflow-visible"
        style={{
          bottom: `-${offset}px`,
          width: "112%",
          height: `${height}px`,
        }}
      >
        <defs>
          <filter
            id={filterId}
            x="-15%"
            y="-80%"
            width="130%"
            height="260%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.65"
              numOctaves={4}
              seed={3}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <clipPath id={clipId}>
            <rect x="0" y="0" width="400" height="40" />
          </clipPath>
        </defs>

        <g
          clipPath={`url(#${clipId})`}
          filter={`url(#${filterId})`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left center",
            transformBox: "fill-box",
            transition:
              "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
          }}
        >
          {/* Main body — full opacity tapered fill */}
          <path d={BRUSH_MAIN} fill={color} opacity={0.82} />

          {/* Secondary layer — adds uneven paint buildup */}
          <path d={BRUSH_LAYER} fill={color} opacity={0.45} />

          {/* Dry brush specks at the tapered tips */}
          {DRY_FLECKS.map((fleck, i) => (
            <ellipse
              key={i}
              cx={fleck.cx}
              cy={fleck.cy}
              rx={fleck.rx}
              ry={fleck.ry}
              fill={color}
              opacity={fleck.opacity}
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
