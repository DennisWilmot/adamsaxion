"use client";

import { CD } from "../../design-system/tokens";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: CD.ink3,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, color: CD.ink, marginTop: 2, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}
