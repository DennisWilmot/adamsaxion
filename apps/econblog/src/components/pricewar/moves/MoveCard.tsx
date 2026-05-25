"use client";

import type { MoveDefinition } from "@adamsaxion/pricewar-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MoveCard({
  move,
  disabled,
  onSelect,
}: {
  move: MoveDefinition;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const isPrivate = move.visibility === "private";

  return (
    <Card className="bg-surface-raised transition-shadow hover:shadow-md">
      <CardHeader className="pb-sm">
        <CardTitle className="flex items-center justify-between text-base">
          {move.name}
          {isPrivate && (
            <Badge variant="secondary" className="text-xs">
              Hidden
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        <p className="text-sm text-foreground-secondary">{move.description}</p>
        <div className="flex items-center gap-sm">
          <Button size="sm" disabled={disabled} onClick={onSelect}>
            Configure
          </Button>
          {move.detailedDescription && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {move.detailedDescription ?? move.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
