"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

/** Primary marker oval */
const CIRCLE_MAIN =
  "M 10,28 C 4,18 12,6 34,4 C 58,2 84,8 93,20 C 99,30 92,42 70,46 C 46,50 18,42 8,30 C 5,26 6,24 10,28";

/** Offset layer — uneven paint buildup */
const CIRCLE_LAYER =
  "M 12,27 C 6,17 14,7 36,5 C 60,3 86,9 95,21 C 101,31 94,43 72,47 C 48,51 20,43 10,31 C 7,27 8,25 12,27";

/** Wobbly outer ghost stroke */
const CIRCLE_GHOST =
  "M 8,29 C 2,17 10,5 32,3 C 56,1 86,7 95,19 C 101,31 94,44 68,48 C 44,52 16,44 6,32 C 3,28 4,26 8,29";

/** Dry brush flecks around the ring */
const DRY_FLECKS = [
  { cx: 8, cy: 26, rx: 1.4, ry: 0.55, opacity: 0.5, rotate: -20 },
  { cx: 22, cy: 5, rx: 1.1, ry: 0.45, opacity: 0.35, rotate: 12 },
  { cx: 58, cy: 3, rx: 1.3, ry: 0.5, opacity: 0.4, rotate: -8 },
  { cx: 92, cy: 18, rx: 1.2, ry: 0.48, opacity: 0.45, rotate: 25 },
  { cx: 96, cy: 34, rx: 1.0, ry: 0.42, opacity: 0.3, rotate: -15 },
  { cx: 74, cy: 47, rx: 1.5, ry: 0.55, opacity: 0.42, rotate: 18 },
  { cx: 38, cy: 49, rx: 1.1, ry: 0.46, opacity: 0.35, rotate: -22 },
  { cx: 14, cy: 38, rx: 0.9, ry: 0.38, opacity: 0.28, rotate: 10 },
];

const PATH_LENGTH = 180;

export function CircleHighlight({
  children,
  color = "#E6A800",
  animate = true,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  animate?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(!animate);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, [animate]);

  const filterId = `circle-grain-${id}`;

  const strokeStyle = {
    strokeDasharray: PATH_LENGTH,
    strokeDashoffset: visible ? 0 : PATH_LENGTH,
    transition:
      "stroke-dashoffset 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
  };

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <svg
        viewBox="0 0 100 50"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[168%] w-[118%] -translate-x-1/2 -translate-y-[48%] overflow-visible"
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-40%"
            width="140%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08 0.55"
              numOctaves={4}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          {/* Ghost outer stroke — dry edge */}
          <path
            d={CIRCLE_GHOST}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={PATH_LENGTH}
            opacity={visible ? 0.35 : 0}
            style={strokeStyle}
          />

          {/* Main body */}
          <path
            d={CIRCLE_MAIN}
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={PATH_LENGTH}
            opacity={visible ? 0.88 : 0}
            style={strokeStyle}
          />

          {/* Secondary layer — paint buildup */}
          <path
            d={CIRCLE_LAYER}
            fill="none"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={PATH_LENGTH}
            opacity={visible ? 0.5 : 0}
            style={{
              ...strokeStyle,
              transition:
                "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.04s, opacity 0.2s ease 0.04s",
            }}
          />
        </g>

        {/* Flecks sit outside filter for crisp specks */}
        {DRY_FLECKS.map((fleck, i) => (
          <ellipse
            key={i}
            cx={fleck.cx}
            cy={fleck.cy}
            rx={fleck.rx}
            ry={fleck.ry}
            fill={color}
            transform={`rotate(${fleck.rotate} ${fleck.cx} ${fleck.cy})`}
            style={{
              opacity: visible ? fleck.opacity : 0,
              transition: `opacity 0.25s ease ${0.35 + i * 0.03}s`,
            }}
          />
        ))}
      </svg>
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}
