"use client";

import Image from "next/image";

/** Soft blurred café photo plate behind mid-match screens. */
export function MatchSceneBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      <Image
        src="/pricewar/lobby-arena-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: "cover",
          filter: "blur(26px) saturate(1.08)",
          transform: "scale(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, oklch(0.98 0.015 250 / 0.75) 0%, oklch(0.96 0.02 250 / 0.82) 100%)",
        }}
      />
    </div>
  );
}
