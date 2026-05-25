"use client";

import { cn } from "@/lib/utils";
import type { ActivityDay } from "@/lib/learning/profile-progress";

interface ProfileActivityHeatmapProps {
  days: ActivityDay[];
}

function intensityClass(count: number) {
  if (count === 0) return "bg-surface-sunken";
  if (count === 1) return "bg-primary/30";
  if (count <= 3) return "bg-primary/50";
  if (count <= 5) return "bg-primary/70";
  return "bg-primary";
}

const HEATMAP_ROWS = 4;

export function ProfileActivityHeatmap({ days }: ProfileActivityHeatmapProps) {
  const columns: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += HEATMAP_ROWS) {
    columns.push(days.slice(i, i + HEATMAP_ROWS));
  }

  return (
    <div
      className="grid w-full gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="grid grid-rows-4 gap-[2px]">
          {Array.from({ length: HEATMAP_ROWS }).map((_, rowIndex) => {
            const day = column[rowIndex];
            if (!day) {
              return (
                <span
                  key={`pad-${columnIndex}-${rowIndex}`}
                  className="aspect-square w-full min-w-0"
                  aria-hidden
                />
              );
            }
            return (
              <span
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
                className={cn(
                  "aspect-square w-full min-w-0 rounded-[2px]",
                  intensityClass(day.count)
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
