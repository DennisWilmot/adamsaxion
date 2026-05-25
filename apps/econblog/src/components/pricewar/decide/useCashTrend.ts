"use client";

import { useEffect, useState } from "react";

const STORAGE_PREFIX = "pricewar:cash-trend:";

export function useCashTrend(matchId: string, cash: number): number[] {
  const [trend, setTrend] = useState<number[]>(() => [cash]);

  useEffect(() => {
    const key = `${STORAGE_PREFIX}${matchId}`;
    let points: number[] = [];
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) points = JSON.parse(raw) as number[];
    } catch {
      points = [];
    }

    if (points.length === 0 || points[points.length - 1] !== cash) {
      points = [...points, cash].slice(-8);
      sessionStorage.setItem(key, JSON.stringify(points));
    }

    setTrend(points);
  }, [matchId, cash]);

  return trend;
}
