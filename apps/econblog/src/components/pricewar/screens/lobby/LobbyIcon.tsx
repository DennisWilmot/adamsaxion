"use client";

import Image from "next/image";

export function LobbyIcon({
  src,
  alt,
  size = 40,
  selected,
}: {
  src: string;
  alt: string;
  size?: number;
  selected?: boolean;
}) {
  const radius = Math.round(size * 0.28);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        flexShrink: 0,
        background: "oklch(0.97 0.01 250)",
        boxShadow: selected
          ? "0 0 0 2px oklch(0.55 0.14 250), 0 4px 14px oklch(0.45 0.08 250 / 0.18)"
          : "0 1px 4px oklch(0.45 0.06 250 / 0.08)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
    </div>
  );
}
