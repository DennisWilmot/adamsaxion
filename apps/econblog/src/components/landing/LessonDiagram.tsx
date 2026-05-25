type WingDecoration = {
  top: string;
  inset: string;
  animation: string;
  content: React.ReactNode;
};

const LEFT_ITEMS: WingDecoration[] = [
  {
    top: "6%",
    inset: "18%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.3s_forwards,landing-bg-drift-alt_7.5s_ease-in-out_2.5s_infinite]",
    content: (
      <svg width="88" height="78" viewBox="0 0 100 90">
        <line x1="12" y1="5" x2="12" y2="78" stroke="#ddd" strokeWidth="0.8" />
        <line x1="12" y1="78" x2="92" y2="78" stroke="#ddd" strokeWidth="0.8" />
        <path d="M15 10 Q48 8 65 32 Q78 52 88 74" fill="none" stroke="#ccc" strokeWidth="1.1" />
      </svg>
    ),
  },
  {
    top: "20%",
    inset: "62%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.5s_forwards,landing-bg-drift-alt_6s_ease-in-out_3s_infinite]",
    content: (
      <span className="font-display italic text-sm text-foreground-muted/30 whitespace-nowrap">
        MRS = P<sub>x</sub> / P<sub>y</sub>
      </span>
    ),
  },
  {
    top: "36%",
    inset: "8%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.7s_forwards,landing-bg-drift-alt_8s_ease-in-out_3.2s_infinite]",
    content: (
      <svg width="64" height="50" viewBox="0 0 72 56">
        <line x1="6" y1="48" x2="66" y2="48" stroke="#ddd" strokeWidth="0.8" />
        <rect x="14" y="28" width="10" height="20" fill="#ddd" opacity="0.5" rx="1" />
        <rect x="30" y="18" width="10" height="30" fill="#ccc" opacity="0.45" rx="1" />
        <rect x="46" y="24" width="10" height="24" fill="#ddd" opacity="0.5" rx="1" />
      </svg>
    ),
  },
  {
    top: "52%",
    inset: "55%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.9s_forwards,landing-bg-drift-alt_7s_ease-in-out_2.8s_infinite]",
    content: (
      <svg width="76" height="62" viewBox="0 0 88 72">
        <line x1="8" y1="6" x2="8" y2="64" stroke="#ddd" strokeWidth="0.8" />
        <line x1="8" y1="64" x2="80" y2="64" stroke="#ddd" strokeWidth="0.8" />
        <line x1="14" y1="12" x2="74" y2="58" stroke="#ccc" strokeWidth="1" />
        <circle cx="44" cy="35" r="2" fill="#ccc" opacity="0.5" />
      </svg>
    ),
  },
  {
    top: "68%",
    inset: "22%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_1.1s_forwards,landing-bg-drift_9s_ease-in-out_3.5s_infinite]",
    content: (
      <span className="font-display italic text-[12px] text-foreground-muted/28 whitespace-nowrap">
        P = MC
      </span>
    ),
  },
  {
    top: "82%",
    inset: "48%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_1.3s_forwards,landing-bg-drift-alt_7.5s_ease-in-out_4s_infinite]",
    content: (
      <svg width="64" height="50" viewBox="0 0 72 56">
        <rect x="8" y="8" width="56" height="40" fill="none" stroke="#ddd" strokeWidth="0.8" rx="2" />
        <line x1="36" y1="8" x2="36" y2="48" stroke="#ddd" strokeWidth="0.8" />
        <line x1="8" y1="28" x2="64" y2="28" stroke="#ddd" strokeWidth="0.8" />
      </svg>
    ),
  },
];

const RIGHT_ITEMS: WingDecoration[] = [
  {
    top: "8%",
    inset: "15%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.3s_forwards,landing-bg-drift_6.5s_ease-in-out_2s_infinite]",
    content: (
      <svg width="100" height="84" viewBox="0 0 120 100">
        <line x1="15" y1="8" x2="15" y2="90" stroke="#ddd" strokeWidth="0.8" />
        <line x1="15" y1="90" x2="110" y2="90" stroke="#ddd" strokeWidth="0.8" />
        <path d="M22 15 Q50 40 105 82" fill="none" stroke="#ccc" strokeWidth="1.1" />
        <path d="M22 82 Q60 50 105 15" fill="none" stroke="#d4dce8" strokeWidth="1.1" />
        <circle cx="63" cy="49" r="2" fill="#ccc" opacity="0.6" />
      </svg>
    ),
  },
  {
    top: "22%",
    inset: "58%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.5s_forwards,landing-bg-drift_8s_ease-in-out_3.8s_infinite]",
    content: (
      <span className="font-display italic text-[12px] text-foreground-muted/28 whitespace-nowrap">
        ε = %ΔQ / %ΔP
      </span>
    ),
  },
  {
    top: "38%",
    inset: "10%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.7s_forwards,landing-bg-drift_7s_ease-in-out_2.2s_infinite]",
    content: (
      <svg width="76" height="62" viewBox="0 0 88 72">
        <line x1="8" y1="6" x2="8" y2="64" stroke="#ddd" strokeWidth="0.8" />
        <line x1="8" y1="64" x2="80" y2="64" stroke="#ddd" strokeWidth="0.8" />
        <path d="M14 58 Q30 20 74 18" fill="none" stroke="#ccc" strokeWidth="1" />
        <path d="M14 58 L74 18" fill="none" stroke="#d4dce8" strokeWidth="1" />
        <circle cx="48" cy="32" r="2" fill="#ccc" opacity="0.55" />
      </svg>
    ),
  },
  {
    top: "54%",
    inset: "52%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_0.9s_forwards,landing-bg-drift_6.5s_ease-in-out_3.5s_infinite]",
    content: (
      <span className="font-display italic text-[13px] text-foreground-muted/30 whitespace-nowrap">
        Y = AK<sup>α</sup>L<sup>β</sup>
      </span>
    ),
  },
  {
    top: "70%",
    inset: "20%",
    animation:
      "opacity-0 animate-[landing-bg-float_1.5s_ease-out_1.1s_forwards,landing-bg-drift_8.5s_ease-in-out_3s_infinite]",
    content: (
      <svg width="84" height="66" viewBox="0 0 100 80">
        <path d="M10 15 Q35 22 48 38 Q58 52 88 62" fill="none" stroke="#ccc" strokeWidth="1" />
        <path d="M10 28 Q38 34 52 48 Q64 62 92 72" fill="none" stroke="#ccc" strokeWidth="1" opacity="0.65" />
      </svg>
    ),
  },
];

function WingDecorations({
  items,
  side,
}: {
  items: WingDecoration[];
  side: "left" | "right";
}) {
  return (
    <div className="relative h-full w-full min-h-[420px]">
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.animation}`}
          style={{
            top: item.top,
            ...(side === "left" ? { left: item.inset } : { right: item.inset }),
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export function HeroBackgroundDiagrams() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden md:flex px-xl opacity-[0.42]"
    >
      <div className="relative min-w-0 flex-1">
        <WingDecorations items={LEFT_ITEMS} side="left" />
      </div>
      <div className="w-full max-w-[640px] shrink-0" />
      <div className="relative min-w-0 flex-1">
        <WingDecorations items={RIGHT_ITEMS} side="right" />
      </div>
    </div>
  );
}
