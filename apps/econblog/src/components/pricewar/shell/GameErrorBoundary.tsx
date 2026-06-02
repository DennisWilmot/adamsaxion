"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { CD } from "@/components/pricewar/design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { SquareBtn } from "@/components/pricewar/shell/PriceWarShellChrome";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class GameErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error("[pricewar] UI error:", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: 480,
            margin: "48px auto",
            background: CD.cardstock,
            border: `1px solid ${CD.rule}`,
            borderRadius: 14,
            padding: 28,
          }}
        >
          <div className="tab">Margin</div>
          <h1 className="serif" style={{ fontSize: 28, color: CD.ink, margin: "6px 0 10px", lineHeight: 1.1 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: CD.ink2, lineHeight: 1.5, margin: "0 0 18px" }}>
            Something broke, but your match is saved. Refresh the page or go back to the lobby.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SquareBtn variant="solid" color={CD.primary} onClick={() => this.setState({ hasError: false })}>
              Try again
            </SquareBtn>
            <Link href={priceWarPaths.lobby} style={{ textDecoration: "none" }}>
              <SquareBtn variant="outline" color={CD.ink}>
                Back to lobby
              </SquareBtn>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
