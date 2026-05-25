"use client";

import { CD } from "../../design-system/tokens";

export function CashLine({ you, opp }: { you: number[]; opp: number[] }) {
  const W = 600;
  const H = 100;
  const pad = 4;
  const all = [...you, ...opp];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = pad + (i / Math.max(arr.length - 1, 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <path d={toPath(opp)} stroke={CD.primary} strokeWidth="1.8" fill="none" />
      <path d={toPath(you)} stroke={CD.ink} strokeWidth="2" fill="none" />
      {you.map((v, i) => {
        const x = pad + (i / Math.max(you.length - 1, 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={`y-${i}`} cx={x} cy={y} r="2.5" fill={CD.ink} />;
      })}
      {opp.map((v, i) => {
        const x = pad + (i / Math.max(opp.length - 1, 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={`o-${i}`} cx={x} cy={y} r="2.5" fill={CD.primary} />;
      })}
    </svg>
  );
}
