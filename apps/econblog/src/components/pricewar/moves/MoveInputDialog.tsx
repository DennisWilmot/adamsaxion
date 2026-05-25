"use client";

import { useState } from "react";
import type { MoveDefinition, MoveInputSpec } from "@adamsaxion/pricewar-types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function defaultInput(spec: MoveInputSpec, fallback?: number): unknown {
  switch (spec.kind) {
    case "slider":
      return { newPrice: fallback ?? spec.default ?? spec.min };
    case "amount":
      return { amount: fallback ?? spec.min };
    case "stepper":
      return { units: spec.default ?? spec.min };
    case "toggle":
      return { enabled: spec.default ?? false };
    default:
      return {};
  }
}

export function MoveInputDialog({
  move,
  open,
  onOpenChange,
  onConfirm,
  currentPrice,
}: {
  move: MoveDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: unknown) => void;
  currentPrice?: number;
}) {
  const [input, setInput] = useState<unknown>(null);

  if (!move) return null;

  const spec = move.input;

  function handleOpen(next: boolean) {
    if (next) {
      setInput(defaultInput(spec, currentPrice));
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{move.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground-secondary">{move.description}</p>

        {spec.kind === "slider" && (
          <div className="space-y-sm">
            <Label htmlFor="price">Price ({spec.unit ?? "¢"})</Label>
            <Input
              id="price"
              type="number"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={(input as { newPrice?: number })?.newPrice ?? spec.min}
              onChange={(e) =>
                setInput({ newPrice: Number(e.target.value) })
              }
            />
          </div>
        )}

        {spec.kind === "amount" && (
          <div className="space-y-sm">
            <Label htmlFor="amount">Spend ({spec.currency ?? "$"})</Label>
            <Input
              id="amount"
              type="number"
              min={spec.min}
              max={spec.max}
              value={(input as { amount?: number })?.amount ?? spec.min}
              onChange={(e) =>
                setInput({ amount: Number(e.target.value) })
              }
            />
          </div>
        )}

        {spec.kind === "stepper" && (
          <div className="space-y-sm">
            <Label htmlFor="units">Units</Label>
            <Input
              id="units"
              type="number"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={(input as { units?: number })?.units ?? spec.min}
              onChange={(e) =>
                setInput({ units: Number(e.target.value) })
              }
            />
          </div>
        )}

        {spec.kind === "toggle" && (
          <div className="flex items-center gap-md">
            <input
              id="toggle"
              type="checkbox"
              checked={(input as { enabled?: boolean })?.enabled ?? spec.default ?? false}
              onChange={(e) => setInput({ enabled: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="toggle">Enable this round</Label>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(input ?? defaultInput(spec, currentPrice))}>
            Add to draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
