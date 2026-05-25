"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="mx-auto mt-2xl max-w-lg bg-surface-raised">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <p className="text-sm text-foreground-secondary">
              The game hit an unexpected error. Your match state is saved on the server — try
              refreshing or return to the lobby.
            </p>
            <div className="flex gap-md">
              <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
              <Button asChild variant="outline">
                <Link href="/play">Back to lobby</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
