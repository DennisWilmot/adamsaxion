"use client";

import { Eyebrow, MT } from "@/components/pricewar/design-system/margin-kit";

export function TrajChart({
  title,
  you,
  opp,
  fmt = (v) => String(v),
  sub,
}: {
  title: string;
  you: number[];
  opp: number[];
  fmt?: (v: number) => string;
  sub?: string;
}) {
  const W = 360;
  const H = 132;
  const pad = 30;
  const all = [...you, ...opp];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (W - pad - 12)) / Math.max(1, you.length - 1);
  const y = (v: number) => H - pad + 2 - ((v - min) / span) * (H - pad - 18);
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");

  return (
    <div
      style={{
        background: MT.card,
        border: `1px solid ${MT.rule}`,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <Eyebrow>{title}</Eyebrow>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", marginTop: 6 }}>
        <line
          x1={pad - 4}
          y1={H - pad + 2}
          x2={W - 6}
          y2={H - pad + 2}
          stroke={MT.rule}
          strokeWidth="1.2"
        />
        <path d={path(opp)} stroke={MT.ink3} strokeWidth="2" fill="none" strokeDasharray="4 3" />
        <path d={path(you)} stroke={MT.blue} strokeWidth="2.4" fill="none" />
        {you.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={MT.blue} />
        ))}
        {you.map((_, i) => (
          <text
            key={`r-${i}`}
            x={x(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize="9.5"
            fill={MT.ink3}
            fontFamily="JetBrains Mono, monospace"
          >
            R{i + 1}
          </text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12, color: MT.ink2 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 3, background: MT.blue }} /> You
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, borderTop: `2px dashed ${MT.ink3}` }} /> Opponent
        </span>
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: MT.ink3, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
      )}
    </div>
  );
}
