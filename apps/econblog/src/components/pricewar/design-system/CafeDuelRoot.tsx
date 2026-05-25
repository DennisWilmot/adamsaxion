"use client";

import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./cd-styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-cd-body",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-cd-serif",
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-cd-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export function CafeDuelRoot({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`cd ${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
