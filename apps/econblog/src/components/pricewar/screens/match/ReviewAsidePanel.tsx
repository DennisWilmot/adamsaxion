"use client";

import Image from "next/image";
import { CD } from "../../design-system/tokens";
import { MATCH_REVIEW_ASSETS } from "./match-review-icons";
import { MatchReviewIcon } from "./MatchReviewIcon";

export function ReviewAsidePanel({
  title = "Almost there!",
  body = "Review your moves and lock in before the reveal.",
  footnote = "Moves stay hidden until both players reveal.",
  imageSrc = MATCH_REVIEW_ASSETS.almostThere,
  actions,
  compact,
}: {
  title?: string;
  body?: string;
  footnote?: string;
  imageSrc?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const heroSize = compact ? 88 : 112;

  return (
    <div className="cd-review-aside-inner">
      <div
        style={{
          position: "relative",
          width: heroSize,
          height: heroSize,
          borderRadius: 999,
          overflow: "hidden",
          flexShrink: 0,
          margin: "0 auto",
        }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes={`${heroSize}px`}
          style={{ objectFit: "cover" }}
        />
      </div>

      <h2
        className="serif"
        style={{
          fontSize: compact ? 20 : 22,
          color: CD.ink,
          marginTop: 12,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 12,
          color: CD.ink2,
          marginTop: 6,
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        {body}
      </p>

      {actions ? (
        <div className="cd-review-aside-actions">{actions}</div>
      ) : null}

      <div className="cd-review-aside-footnote">
        <MatchReviewIcon src={MATCH_REVIEW_ASSETS.forecastLock} alt="" size={26} />
        <p>{footnote}</p>
      </div>
    </div>
  );
}
