import { CD } from "./tokens";

export function AvatarPlayer({ size = 56, ring }: { size?: number; ring?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{
        display: "block",
        borderRadius: 12,
        boxShadow: ring ? `0 0 0 2px ${ring}` : "none",
      }}
    >
      <rect width="100" height="100" rx="14" fill="oklch(0.88 0.07 80)" />
      <path
        d="M 18 96 C 22 70, 78 70, 82 96 L 82 100 L 18 100 Z"
        fill="oklch(0.42 0.08 30)"
      />
      <path d="M 30 92 L 50 78 L 70 92 Z" fill="oklch(0.93 0.04 80)" opacity="0.5" />
      <rect x="44" y="58" width="12" height="14" fill="oklch(0.78 0.07 55)" />
      <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.78 0.07 55)" />
      <path
        d="M 30 40 C 30 22, 70 22, 70 40 C 70 33, 62 28, 50 28 C 38 28, 30 33, 30 40 Z"
        fill="oklch(0.22 0.03 50)"
      />
      <path
        d="M 26 44 C 26 26, 74 26, 74 44"
        fill="none"
        stroke="oklch(0.28 0.03 50)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="22" y="42" width="8" height="12" rx="3" fill="oklch(0.28 0.03 50)" />
      <rect x="70" y="42" width="8" height="12" rx="3" fill="oklch(0.28 0.03 50)" />
      <circle cx="43" cy="48" r="1.6" fill={CD.ink} />
      <circle cx="57" cy="48" r="1.6" fill={CD.ink} />
      <path
        d="M 44 56 Q 50 60, 56 56"
        fill="none"
        stroke={CD.ink}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AvatarOpponent({ size = 56, ring }: { size?: number; ring?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{
        display: "block",
        borderRadius: 12,
        boxShadow: ring ? `0 0 0 2px ${ring}` : "none",
      }}
    >
      <rect width="100" height="100" rx="14" fill="oklch(0.66 0.09 235)" />
      <path
        d="M 18 96 C 22 72, 78 72, 82 96 L 82 100 L 18 100 Z"
        fill="oklch(0.30 0.06 240)"
      />
      <path d="M 45 76 L 50 92 L 55 76 Z" fill="oklch(0.92 0.02 230)" />
      <rect x="44" y="58" width="12" height="14" fill="oklch(0.74 0.06 50)" />
      <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.74 0.06 50)" />
      <path
        d="M 30 36 C 30 22, 70 22, 70 36 L 70 40 L 30 40 Z"
        fill="oklch(0.22 0.04 240)"
      />
      <path d="M 22 40 L 60 40 L 60 44 L 22 44 Z" fill="oklch(0.22 0.04 240)" />
      <rect x="38" y="44" width="8" height="1.6" fill={CD.ink} />
      <rect x="54" y="44" width="8" height="1.6" fill={CD.ink} />
      <circle cx="43" cy="48" r="1.6" fill={CD.ink} />
      <circle cx="57" cy="48" r="1.6" fill={CD.ink} />
      <path d="M 44 58 L 56 58" stroke={CD.ink} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AvatarCoach({ size = 48, ring }: { size?: number; ring?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{
        display: "block",
        borderRadius: 12,
        boxShadow: ring ? `0 0 0 2px ${ring}` : "none",
      }}
    >
      <rect width="100" height="100" rx="14" fill="oklch(0.72 0.06 165)" />
      <path
        d="M 18 96 C 22 72, 78 72, 82 96 L 82 100 L 18 100 Z"
        fill="oklch(0.40 0.04 60)"
      />
      <path
        d="M 18 84 Q 50 90, 82 84"
        stroke="oklch(0.30 0.04 60)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path d="M 40 72 L 50 78 L 40 84 Z M 60 72 L 50 78 L 60 84 Z" fill={CD.primary} />
      <rect x="48" y="74" width="4" height="8" rx="1" fill="oklch(0.45 0.13 35)" />
      <rect x="44" y="60" width="12" height="14" fill="oklch(0.78 0.05 55)" />
      <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.78 0.05 55)" />
      <path
        d="M 30 42 C 30 36, 36 32, 42 32 L 58 32 C 64 32, 70 36, 70 42 C 66 38, 60 36, 50 36 C 40 36, 34 38, 30 42 Z"
        fill="oklch(0.78 0.05 55)"
      />
      <path
        d="M 28 50 C 28 38, 34 32, 38 32 L 38 36 C 33 38, 30 44, 30 52 Z"
        fill="oklch(0.88 0.01 55)"
      />
      <path
        d="M 72 50 C 72 38, 66 32, 62 32 L 62 36 C 67 38, 70 44, 70 52 Z"
        fill="oklch(0.88 0.01 55)"
      />
      <circle cx="40" cy="50" r="5" fill="none" stroke={CD.ink} strokeWidth="1.4" />
      <circle cx="60" cy="50" r="5" fill="none" stroke={CD.ink} strokeWidth="1.4" />
      <path d="M 45 50 L 55 50" stroke={CD.ink} strokeWidth="1.4" />
      <circle cx="40" cy="50" r="1.4" fill={CD.ink} />
      <circle cx="60" cy="50" r="1.4" fill={CD.ink} />
      <path
        d="M 40 60 Q 50 64, 60 60 Q 56 58, 50 58 Q 44 58, 40 60 Z"
        fill="oklch(0.88 0.01 55)"
      />
      <path
        d="M 44 66 Q 50 68, 56 66"
        fill="none"
        stroke={CD.ink}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
