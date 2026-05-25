import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SubmittedMove } from "@adamsaxion/pricewar-types";

export function DraftSlot({
  move,
  index,
  onRemove,
}: {
  move?: SubmittedMove | undefined;
  index: number;
  onRemove: (index: number) => void;
}) {
  return (
    <Card className="bg-surface-sunken">
      <CardContent className="py-md">
        {move ? (
          <div className="flex items-center justify-between gap-sm">
            <div>
              <p className="text-sm font-medium">{move.moveId}</p>
              <p className="text-xs text-foreground-muted">
                {JSON.stringify(move.input)}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onRemove(index)}>
              Remove
            </Button>
          </div>
        ) : (
          <span className="text-sm text-foreground-muted">Empty slot {index + 1}</span>
        )}
      </CardContent>
    </Card>
  );
}
