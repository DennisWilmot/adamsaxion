"use client";

import Image from "next/image";
import { REVIEW } from "./match-review-tokens";
import { MATCH_REVIEW_ASSETS } from "./match-review-icons";

export function ReviewViewportFrame({
  children,
  embedded = false,
}: {
  children: React.ReactNode;
  embedded?: boolean;
}) {
  return (
    <div className={embedded ? "cd-review-viewport cd-review-viewport-embedded" : "cd-review-viewport"}>
      {children}
    </div>
  );
}

export function ReviewShell({
  left,
  right,
  faintArt = MATCH_REVIEW_ASSETS.almostThere,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  faintArt?: string | false;
}) {
  return (
    <div
      className="cd-review-shell cd-review-shell-split"
      style={{
        background: REVIEW.shellBg,
        border: `1px solid ${REVIEW.shellBorder}`,
        borderRadius: REVIEW.shellRadius,
        boxShadow: REVIEW.shellShadow,
      }}
    >
      {faintArt ? (
        <div className="cd-review-shell-faint-art" aria-hidden>
          <Image src={faintArt} alt="" fill sizes="400px" style={{ objectFit: "contain" }} />
        </div>
      ) : null}

      <div className="cd-review-shell-split-grid">
        <div className="cd-review-shell-left">{left}</div>
        <div className="cd-review-shell-right">{right}</div>
      </div>
    </div>
  );
}

/** Waiting / locked screen — keeps header + body + aside pattern. */
export function ReviewShellStacked({
  header,
  body,
  aside,
  footer,
}: {
  header: React.ReactNode;
  body: React.ReactNode;
  aside: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="cd-review-shell"
      style={{
        background: REVIEW.shellBg,
        border: `1px solid ${REVIEW.shellBorder}`,
        borderRadius: REVIEW.shellRadius,
        boxShadow: REVIEW.shellShadow,
      }}
    >
      <header className="cd-review-shell-header">{header}</header>
      <div className="cd-review-shell-body-row">
        <div className="cd-review-shell-main">{body}</div>
        <aside className="cd-review-aside cd-review-shell-aside">{aside}</aside>
      </div>
      <footer className="cd-review-shell-footer">{footer}</footer>
    </div>
  );
}
