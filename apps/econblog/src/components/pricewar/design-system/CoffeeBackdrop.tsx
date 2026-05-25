import { CD } from "./tokens";

export function CoffeeBackdrop({
  opacity = 0.06,
  width = "100%",
  height = 130,
}: {
  opacity?: number;
  width?: string | number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 140"
      preserveAspectRatio="xMidYMid slice"
      width={width}
      height={height}
      aria-hidden
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}
    >
      <g stroke={CD.ink} strokeWidth="1.2" fill="none">
        <path d="M 0 18 Q 30 36, 60 18 Q 90 36, 120 18 Q 150 36, 180 18 Q 210 36, 240 18 Q 270 36, 300 18 Q 330 36, 360 18 Q 390 36, 420 18 Q 450 36, 480 18 Q 510 36, 540 18 Q 570 36, 600 18 Q 630 36, 660 18 Q 690 36, 720 18 Q 750 36, 780 18 Q 810 36, 840 18 Q 870 36, 900 18 Q 930 36, 960 18 Q 990 36, 1020 18 Q 1050 36, 1080 18 Q 1110 36, 1140 18 Q 1170 36, 1200 18" />
        <path d="M 0 18 L 1200 18" />
      </g>
      <g fill={CD.ink}>
        <rect x="120" y="62" width="120" height="60" rx="3" />
        <rect x="140" y="50" width="80" height="14" rx="2" />
        <rect x="156" y="42" width="6" height="10" />
        <rect x="178" y="42" width="6" height="10" />
        <circle cx="160" cy="95" r="5" fill={CD.paper} />
        <circle cx="180" cy="95" r="5" fill={CD.paper} />
        <rect x="155" y="100" width="10" height="20" />
        <rect x="175" y="100" width="10" height="20" />
      </g>
      <g fill={CD.ink}>
        <path d="M 880 100 L 920 100 L 916 128 L 884 128 Z" />
        <path d="M 920 106 Q 932 110, 930 122 L 924 122 Q 925 114, 918 112 Z" />
      </g>
      <g className="cd-steam" stroke={CD.ink} strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 890 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
        <path d="M 900 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
        <path d="M 910 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
      </g>
      <g stroke={CD.ink} fill={CD.ink} strokeWidth="1">
        <line x1="420" y1="18" x2="420" y2="46" />
        <circle cx="420" cy="50" r="4" />
        <line x1="540" y1="18" x2="540" y2="54" />
        <circle cx="540" cy="58" r="4" />
        <line x1="660" y1="18" x2="660" y2="42" />
        <circle cx="660" cy="46" r="4" />
        <line x1="780" y1="18" x2="780" y2="52" />
        <circle cx="780" cy="56" r="4" />
      </g>
      <g stroke={CD.ink} strokeWidth="1" fill="none">
        <rect x="1000" y="56" width="140" height="60" rx="4" />
        <line x1="1014" y1="74" x2="1126" y2="74" />
        <line x1="1014" y1="88" x2="1100" y2="88" />
        <line x1="1014" y1="102" x2="1080" y2="102" />
      </g>
      <g stroke={CD.primary} strokeWidth="1" fill="none" opacity="0.7">
        <circle cx="320" cy="118" r="14" />
        <circle cx="320" cy="118" r="11" />
        <circle cx="720" cy="124" r="10" />
      </g>
    </svg>
  );
}
