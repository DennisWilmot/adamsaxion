"use client";

import Image from "next/image";

export function MatchReviewIcon({
  src,
  alt,
  size = 28,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  const radius = Math.max(6, Math.round(size * 0.22));

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} style={{ objectFit: "cover" }} />
    </div>
  );
}
