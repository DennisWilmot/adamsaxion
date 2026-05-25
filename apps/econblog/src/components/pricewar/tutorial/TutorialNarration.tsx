"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TutorialNarrationStep } from "@adamsaxion/pricewar-engine";

export function TutorialNarrationCard({
  step,
  variant = "decide",
}: {
  step: TutorialNarrationStep;
  variant?: "decide" | "report";
}) {
  return (
    <Card className="mb-xl border-primary/30 bg-primary/5">
      <CardHeader className="pb-md">
        <div className="flex items-center gap-sm">
          <Badge variant="secondary">Tutorial</Badge>
          <CardTitle className="text-lg">{step.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-md text-sm text-foreground-secondary">
        <p>{step.body}</p>
        {variant === "decide" && step.hint && (
          <p className="text-foreground-muted">
            <strong className="text-foreground">Tip:</strong> {step.hint}
          </p>
        )}
        {step.suggestedMoveIds && step.suggestedMoveIds.length > 0 && variant === "decide" && (
          <p className="text-xs text-foreground-muted">
            Suggested domains: {step.suggestedMoveIds.map((id) => id.split(".")[0]).join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
