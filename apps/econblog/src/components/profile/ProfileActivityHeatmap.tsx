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

export function ProfileActivityHeatmap({ days }: ProfileActivityHeatmapProps) {
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div
      className="grid w-full gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
      }}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-rows-7 gap-[2px]">
          {Array.from({ length: 7 }).map((_, rowIndex) => {
            const day = week[rowIndex];
            if (!day) {
              return (
                <span
                  key={`pad-${weekIndex}-${rowIndex}`}
                  className="h-2.5 w-full"
                  aria-hidden
                />
              );
            }
            return (
              <span
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
                className={cn(
                  "h-2.5 w-full rounded-[2px]",
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
