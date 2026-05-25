"use client";

import { useEffect, useState } from "react";

const ICONS = [
  "📈", "📉", "💰", "🏦", "📊", "💹", "🪙", "💵",
  "🏛️", "⚖️", "🌍", "📐", "🧮", "💎", "🏷️", "📋",
];

interface FloatingItem {
  id: number;
  icon: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

function generateItems(count: number): FloatingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    icon: ICONS[i % ICONS.length] ?? ICONS[0] ?? "📈",
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 18 + Math.random() * 20,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * -30,
    driftX: -15 + Math.random() * 30,
    driftY: -20 + Math.random() * 15,
    opacity: 0.06 + Math.random() * 0.08,
  }));
}

interface FloatingIconsProps {
  count?: number;
  className?: string;
}

export function FloatingIcons({ count = 20, className = "" }: FloatingIconsProps) {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    setItems(generateItems(count));
  }, [count]);

  if (items.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden ${className}`}
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            animation: `float-drift ${item.duration}s ease-in-out ${item.delay}s infinite`,
            ["--drift-x" as string]: `${item.driftX}px`,
            ["--drift-y" as string]: `${item.driftY}px`,
          }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );
}
