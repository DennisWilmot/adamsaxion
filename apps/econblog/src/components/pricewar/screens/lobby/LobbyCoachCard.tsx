"use client";

import Link from "next/link";
import Image from "next/image";
import { BarChart3, Lightbulb } from "lucide-react";
import { PillBtn } from "../../design-system/controls";
import { CD } from "../../design-system/tokens";

export function LobbyCoachCard({
  headline,
  body,
  reviewHref,
}: {
  headline: string;
  body: string;
  reviewHref: string | null;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid #fde68a",
        background: `linear-gradient(135deg, ${CD.cream} 0%, #fffbeb 100%)`,
        padding: 18,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 72,
          height: 72,
          borderRadius: 14,
          overflow: "hidden",
          flexShrink: 0,
          border: `1px solid oklch(0.85 0.05 85)`,
        }}
      >
        <Image
          src="/pricewar/prof-aldo-coach.webp"
          alt="Prof. Aldo"
          fill
          sizes="72px"
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: CD.ink3,
          }}
        >
          <Lightbulb size={13} />
          {headline}
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: CD.ink2,
            margin: "8px 0 0",
          }}
        >
          {body}
        </p>
        {reviewHref && (
          <div style={{ marginTop: 12 }}>
            <Link href={reviewHref}>
              <PillBtn variant="solid" color={CD.ink} size="sm">
                <BarChart3 size={14} />
                Review last match
              </PillBtn>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
