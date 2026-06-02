"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LOBBY } from "./lobby-tokens";

const TICKER_ITEMS = [
  { label: "Latte", price: "$4.50", delta: -0.05, down: true },
  { label: "Cappuccino", price: "$4.20", delta: 0.1, down: false },
  { label: "Espresso", price: "$2.90", delta: 0.02, down: false },
  { label: "Cold brew", price: "$5.10", delta: -0.08, down: true },
  { label: "Mocha", price: "$5.40", delta: 0.12, down: false },
  { label: "Americano", price: "$3.20", delta: -0.03, down: true },
];

const FLOAT_TAGS = [
  { left: "12%", bottom: "38%", delay: "0s" },
  { left: "34%", bottom: "44%", delay: "2.4s" },
  { left: "58%", bottom: "36%", delay: "4.8s" },
];

function TickerStrip() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: `1px solid ${LOBBY.cardBorder}`,
        background: LOBBY.tickerBg,
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="cd-lobby-ticker" style={{ display: "flex", width: "max-content" }}>
        {doubled.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRight: "1px solid oklch(1 0 0 / 0.1)",
              fontSize: 12,
              color: "oklch(0.96 0.01 250)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 0.8 }}>{item.label}</span>
            <span className="num cd-lobby-ticker-price" style={{ fontWeight: 600 }}>
              {item.price}
            </span>
            <span
              className="num"
              style={{ color: item.down ? "#fecaca" : "#bbf7d0", fontSize: 11 }}
            >
              {item.down ? "▼" : "▲"} {Math.abs(item.delta).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SteamPuff({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <div
      className="cd-steam"
      style={{
        position: "absolute",
        left,
        top,
        opacity: 0.22,
        pointerEvents: "none",
        animationDelay: delay,
      }}
      aria-hidden
    >
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <path d="M 14 40 q 3 -8, 0 -16 q -3 -8, 0 -16" stroke="white" strokeWidth="2" />
        <path d="M 24 40 q 3 -8, 0 -16 q -3 -8, 0 -16" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function LobbyArenaHero({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState(["$4.50", "$3.80", "$5.20"]);

  useEffect(() => {
    const id = setInterval(() => {
      setTags((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = `$${(2.5 + Math.random() * 3.5).toFixed(2)}`;
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 22,
        border: `1px solid ${LOBBY.cardBorder}`,
        background: LOBBY.cardMuted,
        minHeight: 520,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-4%",
          filter: "saturate(0.8) brightness(1.03)",
        }}
      >
        <Image
          src="/pricewar/lobby-arena-hero.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          style={{ objectFit: "cover", objectPosition: "center 45%" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: LOBBY.heroOverlay,
        }}
      />

      <div className="cd-lobby-bokeh" aria-hidden />

      {FLOAT_TAGS.map((tag, i) => (
        <div
          key={tag.left}
          className="cd-lobby-price-tag"
          style={{
            position: "absolute",
            left: tag.left,
            bottom: tag.bottom,
            padding: "4px 10px",
            borderRadius: 6,
            background: LOBBY.heroGlass,
            border: `1px solid ${LOBBY.cardBorder}`,
            fontSize: 11,
            fontWeight: 600,
            color: LOBBY.heroInk,
            animationDelay: tag.delay,
            pointerEvents: "none",
            opacity: 0.85,
          }}
        >
          {tags[i]}
        </div>
      ))}

      <SteamPuff left="68%" top="32%" delay="0s" />
      <SteamPuff left="74%" top="28%" delay="1.1s" />
      <SteamPuff left="22%" top="40%" delay="0.6s" />

      <div style={{ position: "relative", zIndex: 1, flex: 1, padding: 24 }}>
        <div
          className="cd-lobby-hero-glass"
          style={{
            background: LOBBY.heroGlass,
            border: `1px solid ${LOBBY.heroGlassBorder}`,
            borderRadius: 18,
            padding: 24,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 8px 32px oklch(0.45 0.08 250 / 0.08)",
          }}
        >
          {children}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
        <TickerStrip />
      </div>
    </div>
  );
}
