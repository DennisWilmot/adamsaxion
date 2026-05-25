// Café Duel — atoms and characters
// Palette, type, avatars, scenario backdrop, domain glyphs, move card.

// ----- Shared types (used across files; Babel strips, real handoff puts these in a shared types.ts) -----

type Domain = 'sales' | 'procurement' | 'operations' | 'hr' | 'marketing' | 'finance';
type WeatherKind = 'sun' | 'cloud' | 'rain' | 'wind' | 'snow';
type AvatarKind = 'player' | 'opponent' | 'coach';
type ScenarioKind = 'coffee' | 'foodtruck' | 'bookshop' | 'tech';

interface DomainSpec { c: string; soft: string; glyph: string; }

interface Player { name: string; cash: number; trend?: number[]; }
interface Opponent { name: string; elo: number; price: number; locked: boolean; }

interface PickValue { domain: Domain; title: string; value: string; }

interface SliderKnobDef {
  kind: 'slider';
  key: string;
  min: number; max: number; step: number;
  defaults: Record<string, number>;
  label: string;
  format?: (v: number) => string | number;
  suffix?: string;
  effect?: (v: number) => string;
  hint?: (v: number) => string;
}
interface StepperKnobDef {
  kind: 'stepper';
  key: string;
  min: number; max: number;
  defaults: Record<string, number>;
  label: string;
  suffix?: string;
  effect?: (v: number) => string;
  hint?: (v: number) => string;
}
interface SegmentedKnobDef {
  kind: 'segmented';
  key: string;
  options: { value: string; label: string }[];
  defaults: Record<string, string>;
  label: string;
  effect?: (v: string) => string;
  hint?: (v: string) => string;
}
type KnobDef = SliderKnobDef | StepperKnobDef | SegmentedKnobDef;

interface CardDef {
  domain: Domain;
  title: string;
  kicker: string;
  knob: KnobDef;
  cost: (v: any) => number;
}

const CD = {
  // Surfaces — cool neutrals (Adam's Axioms brand)
  paper:      '#f5f6f8',
  paperDeep:  '#eceef3',
  cardstock:  '#ffffff',
  cardstockHi:'#fafbfd',
  ink:        '#0a0a0a',
  ink2:       '#4b5563',
  ink3:       '#6b7280',
  ink4:       '#d1d5db',
  rule:       '#e5e7eb',
  // Primary (brand blue) — formerly terracotta. Name kept for stability across files.
  terracotta: '#0a52c4',
  terraSoft:  '#e6efff',
  cream:      '#fef3c7',   // soft yellow highlight (XP / win moments)
  yellow:     '#eab308',   // strong yellow accent
  green:      '#16a34a',
  greenSoft:  '#dcfce7',
  red:        '#dc2626',
  redSoft:    '#fee2e2',
  // Domain hues — modern flat, distinct
  d: {
    sales:       { c: '#dc2626', soft: '#fee2e2', glyph: '⌖' },
    procurement: { c: '#15803d', soft: '#dcfce7', glyph: '⏃' },
    operations:  { c: '#0a52c4', soft: '#e6efff', glyph: '◐' },
    hr:          { c: '#b45309', soft: '#fef3c7', glyph: '☼' },
    marketing:   { c: '#a21caf', soft: '#fae8ff', glyph: '✺' },
    finance:     { c: '#1f2937', soft: '#e5e7eb', glyph: '$' },
  },
};

// Inject font + base styles once.
if (typeof document !== 'undefined' && !document.getElementById('cd-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'cd-styles';
  s.textContent = `
    .cd { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: ${CD.ink}; }
    .cd .serif { font-family: 'Source Serif 4', 'Source Serif Pro', Georgia, serif; font-weight: 600; letter-spacing: -0.015em; }
    .cd .mono  { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    .cd h1, .cd h2, .cd h3 { margin: 0; font-weight: 400; }
    .cd .tab { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: ${CD.ink3}; font-weight: 500; }
    .cd .num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    .cd button { font-family: inherit; }

    /* Card hover */
    .cd-move { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
    .cd-move:hover { transform: translateY(-1px); box-shadow: 0 8px 24px -12px oklch(0.22 0.025 55 / 0.18); }

    /* Pulse for opponent lock */
    @keyframes cd-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: .7; transform: scale(1.04); }
    }
    .cd-pulse { animation: cd-pulse 2.4s ease-in-out infinite; }

    /* Subtle steam wisp */
    @keyframes cd-steam {
      0%   { transform: translateY(0) translateX(0);   opacity: 0; }
      30%  { opacity: 0.5; }
      100% { transform: translateY(-14px) translateX(2px); opacity: 0; }
    }
    .cd-steam path { animation: cd-steam 3.2s ease-out infinite; transform-origin: center bottom; }
    .cd-steam path:nth-child(2) { animation-delay: 1.1s; }
    .cd-steam path:nth-child(3) { animation-delay: 2.0s; }

    /* Reveal motion */
    @keyframes cd-slide-in-l { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
    @keyframes cd-slide-in-r { from { opacity: 0; transform: translateX( 24px); } to { opacity: 1; transform: none; } }
    @keyframes cd-pop-in     { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: none; } }
    @keyframes cd-fade-up    { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .cd-slide-in-l { animation: cd-slide-in-l .55s cubic-bezier(.2,.7,.3,1) both; }
    .cd-slide-in-r { animation: cd-slide-in-r .55s cubic-bezier(.2,.7,.3,1) both; }
    .cd-pop-in     { animation: cd-pop-in .25s cubic-bezier(.2,.7,.3,1) both; }
    .cd-fade-up    { animation: cd-fade-up .45s ease-out both; }
    .cd-d-100 { animation-delay: 100ms; } .cd-d-200 { animation-delay: 200ms; }
    .cd-d-300 { animation-delay: 300ms; } .cd-d-400 { animation-delay: 400ms; }

    /* Slot-in (card → pick rail) — applied to PickSlot when its content becomes non-empty */
    @keyframes cd-slot-in { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
    .cd-slot-in > * { animation: cd-slot-in .35s cubic-bezier(.2,.7,.3,1) both; }

    /* Number ticker roll — for CashTicker */
    @keyframes cd-num-up   { 0% { transform: translateY( 60%); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes cd-num-down { 0% { transform: translateY(-60%); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
    .cd-tick-up   { display: inline-block; animation: cd-num-up   .5s cubic-bezier(.2,.7,.3,1) both; }
    .cd-tick-down { display: inline-block; animation: cd-num-down .5s cubic-bezier(.2,.7,.3,1) both; }

    /* Streak chip pop */
    @keyframes cd-chip-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .cd-chip-pop > * { animation: cd-chip-pop .35s cubic-bezier(.5,1.6,.5,1) both; }
  `;
  document.head.appendChild(s);
}

// ----- Avatars (flat SVG placeholders — character placeholders, swap later) -----

const AvatarPlayer = ({ size = 56, ring }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', borderRadius: 12, boxShadow: ring ? `0 0 0 2px ${ring}` : 'none' }}>
    <rect width="100" height="100" rx="14" fill="oklch(0.88 0.07 80)" />
    {/* body */}
    <path d="M 18 96 C 22 70, 78 70, 82 96 L 82 100 L 18 100 Z" fill="oklch(0.42 0.08 30)" />
    <path d="M 30 92 L 50 78 L 70 92 Z" fill="oklch(0.93 0.04 80)" opacity="0.5" />
    {/* neck */}
    <rect x="44" y="58" width="12" height="14" fill="oklch(0.78 0.07 55)" />
    {/* head */}
    <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.78 0.07 55)" />
    {/* hair */}
    <path d="M 30 40 C 30 22, 70 22, 70 40 C 70 33, 62 28, 50 28 C 38 28, 30 33, 30 40 Z" fill="oklch(0.22 0.03 50)" />
    {/* headphones */}
    <path d="M 26 44 C 26 26, 74 26, 74 44" fill="none" stroke="oklch(0.28 0.03 50)" strokeWidth="3" strokeLinecap="round" />
    <rect x="22" y="42" width="8" height="12" rx="3" fill="oklch(0.28 0.03 50)" />
    <rect x="70" y="42" width="8" height="12" rx="3" fill="oklch(0.28 0.03 50)" />
    {/* eyes */}
    <circle cx="43" cy="48" r="1.6" fill={CD.ink} />
    <circle cx="57" cy="48" r="1.6" fill={CD.ink} />
    {/* smile */}
    <path d="M 44 56 Q 50 60, 56 56" fill="none" stroke={CD.ink} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const AvatarOpponent = ({ size = 56, ring }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', borderRadius: 12, boxShadow: ring ? `0 0 0 2px ${ring}` : 'none' }}>
    <rect width="100" height="100" rx="14" fill="oklch(0.66 0.09 235)" />
    {/* body / jacket */}
    <path d="M 18 96 C 22 72, 78 72, 82 96 L 82 100 L 18 100 Z" fill="oklch(0.30 0.06 240)" />
    <path d="M 45 76 L 50 92 L 55 76 Z" fill="oklch(0.92 0.02 230)" />
    {/* neck */}
    <rect x="44" y="58" width="12" height="14" fill="oklch(0.74 0.06 50)" />
    {/* head */}
    <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.74 0.06 50)" />
    {/* cap */}
    <path d="M 30 36 C 30 22, 70 22, 70 36 L 70 40 L 30 40 Z" fill="oklch(0.22 0.04 240)" />
    <path d="M 22 40 L 60 40 L 60 44 L 22 44 Z" fill="oklch(0.22 0.04 240)" />
    {/* brow + eyes (slightly stern) */}
    <rect x="38" y="44" width="8" height="1.6" fill={CD.ink} />
    <rect x="54" y="44" width="8" height="1.6" fill={CD.ink} />
    <circle cx="43" cy="48" r="1.6" fill={CD.ink} />
    <circle cx="57" cy="48" r="1.6" fill={CD.ink} />
    {/* flat mouth */}
    <path d="M 44 58 L 56 58" stroke={CD.ink} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const AvatarCoach = ({ size = 48, ring }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', borderRadius: 12, boxShadow: ring ? `0 0 0 2px ${ring}` : 'none' }}>
    <rect width="100" height="100" rx="14" fill="oklch(0.72 0.06 165)" />
    {/* tweed */}
    <path d="M 18 96 C 22 72, 78 72, 82 96 L 82 100 L 18 100 Z" fill="oklch(0.40 0.04 60)" />
    <path d="M 18 84 Q 50 90, 82 84" stroke="oklch(0.30 0.04 60)" strokeWidth="1" fill="none" opacity="0.6" />
    {/* bowtie */}
    <path d="M 40 72 L 50 78 L 40 84 Z M 60 72 L 50 78 L 60 84 Z" fill={CD.terracotta} />
    <rect x="48" y="74" width="4" height="8" rx="1" fill="oklch(0.45 0.13 35)" />
    {/* neck */}
    <rect x="44" y="60" width="12" height="14" fill="oklch(0.78 0.05 55)" />
    {/* head */}
    <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(0.78 0.05 55)" />
    {/* bald top + side hair */}
    <path d="M 30 42 C 30 36, 36 32, 42 32 L 58 32 C 64 32, 70 36, 70 42 C 66 38, 60 36, 50 36 C 40 36, 34 38, 30 42 Z" fill="oklch(0.78 0.05 55)" />
    <path d="M 28 50 C 28 38, 34 32, 38 32 L 38 36 C 33 38, 30 44, 30 52 Z" fill="oklch(0.88 0.01 55)" />
    <path d="M 72 50 C 72 38, 66 32, 62 32 L 62 36 C 67 38, 70 44, 70 52 Z" fill="oklch(0.88 0.01 55)" />
    {/* glasses */}
    <circle cx="40" cy="50" r="5" fill="none" stroke={CD.ink} strokeWidth="1.4" />
    <circle cx="60" cy="50" r="5" fill="none" stroke={CD.ink} strokeWidth="1.4" />
    <path d="M 45 50 L 55 50" stroke={CD.ink} strokeWidth="1.4" />
    {/* eyes */}
    <circle cx="40" cy="50" r="1.4" fill={CD.ink} />
    <circle cx="60" cy="50" r="1.4" fill={CD.ink} />
    {/* moustache */}
    <path d="M 40 60 Q 50 64, 60 60 Q 56 58, 50 58 Q 44 58, 40 60 Z" fill="oklch(0.88 0.01 55)" />
    {/* smile */}
    <path d="M 44 66 Q 50 68, 56 66" fill="none" stroke={CD.ink} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ----- Scenario backdrop (Coffee Shop) — used as a low-opacity decorative band -----

const CoffeeBackdrop = ({ opacity = 0.06, width = '100%', height = 130 }) => (
  <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMid slice" width={width} height={height}
       style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
    {/* awning scallops */}
    <g stroke={CD.ink} strokeWidth="1.2" fill="none">
      <path d="M 0 18 Q 30 36, 60 18 Q 90 36, 120 18 Q 150 36, 180 18 Q 210 36, 240 18 Q 270 36, 300 18 Q 330 36, 360 18 Q 390 36, 420 18 Q 450 36, 480 18 Q 510 36, 540 18 Q 570 36, 600 18 Q 630 36, 660 18 Q 690 36, 720 18 Q 750 36, 780 18 Q 810 36, 840 18 Q 870 36, 900 18 Q 930 36, 960 18 Q 990 36, 1020 18 Q 1050 36, 1080 18 Q 1110 36, 1140 18 Q 1170 36, 1200 18" />
      <path d="M 0 18 L 1200 18" />
    </g>
    {/* espresso machine silhouette */}
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
    {/* mug + steam */}
    <g fill={CD.ink}>
      <path d="M 880 100 L 920 100 L 916 128 L 884 128 Z" />
      <path d="M 920 106 Q 932 110, 930 122 L 924 122 Q 925 114, 918 112 Z" />
    </g>
    <g className="cd-steam" stroke={CD.ink} strokeWidth="1.2" fill="none" strokeLinecap="round">
      <path d="M 890 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
      <path d="M 900 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
      <path d="M 910 96 q 4 -8, 0 -16 q -4 -8, 0 -16" />
    </g>
    {/* hanging bulbs */}
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
    {/* signage suggestion */}
    <g stroke={CD.ink} strokeWidth="1" fill="none">
      <rect x="1000" y="56" width="140" height="60" rx="4" />
      <line x1="1014" y1="74" x2="1126" y2="74" />
      <line x1="1014" y1="88" x2="1100" y2="88" />
      <line x1="1014" y1="102" x2="1080" y2="102" />
    </g>
    {/* mug rings (paper-stain feel) */}
    <g stroke={CD.terracotta} strokeWidth="1" fill="none" opacity="0.7">
      <circle cx="320" cy="118" r="14" />
      <circle cx="320" cy="118" r="11" />
      <circle cx="720" cy="124" r="10" />
    </g>
  </svg>
);

// ----- Domain glyph chip -----

const DomainStripe = ({ domain }) => (
  <div style={{
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
    background: CD.d[domain].c, borderRadius: '14px 0 0 14px',
  }} />
);

const DomainGlyph = ({ domain, size = 28 }) => {
  const g = CD.d[domain];
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: g.soft, color: g.c,
      display: 'grid', placeItems: 'center',
      fontFamily: "'Instrument Serif', serif", fontSize: size * 0.7, lineHeight: 1,
      fontStyle: 'italic',
    }}>{g.glyph}</div>
  );
};

const DomainTag = ({ domain }) => {
  const g = CD.d[domain];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px 3px 6px',
      background: g.soft, color: g.c,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      borderRadius: 999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: g.c }} />
      {domain === 'hr' ? 'HR' : domain[0].toUpperCase() + domain.slice(1)}
    </span>
  );
};

// ----- Move card -----

const MoveCard = ({ domain, title, kicker, effect, cost, selected, locked, badge }) => {
  const g = CD.d[domain];
  return (
    <div className="cd-move" style={{
      position: 'relative',
      background: selected ? CD.cardstockHi : CD.cardstock,
      border: `1px solid ${selected ? g.c : CD.rule}`,
      borderRadius: 14,
      padding: '16px 18px 16px 22px',
      cursor: 'pointer',
      boxShadow: selected ? `0 0 0 3px ${g.soft}` : `0 1px 0 ${CD.rule}`,
    }}>
      <DomainStripe domain={domain} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <DomainGlyph domain={domain} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <h3 className="serif" style={{ fontSize: 24, lineHeight: 1.05, color: CD.ink }}>{title}</h3>
            {badge && (
              <span style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{badge}</span>
            )}
          </div>
          {kicker && (
            <div style={{ fontSize: 13.5, color: CD.ink2, marginTop: 4, lineHeight: 1.45 }}>{kicker}</div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
            paddingTop: 10, borderTop: `1px dashed ${CD.rule}`,
          }}>
            <DomainTag domain={domain} />
            {effect && (
              <span style={{ fontSize: 12.5, color: CD.ink2 }}>
                <span style={{ color: CD.ink3 }}>effect</span> <span className="num">{effect}</span>
              </span>
            )}
            {cost && (
              <span style={{ fontSize: 12.5, color: CD.ink2, marginLeft: 'auto' }}>
                <span style={{ color: CD.ink3 }}>cost</span> <span className="num" style={{ color: CD.ink }}>{cost}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      {locked && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: CD.ink3, background: CD.paperDeep, padding: '2px 6px', borderRadius: 4,
        }}>Hidden</div>
      )}
    </div>
  );
};

// ----- Round dots -----

const RoundDots = ({ total = 8, current = 3 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    {Array.from({ length: total }, (_, i) => {
      const idx = i + 1;
      const past = idx < current;
      const now = idx === current;
      return (
        <div key={i} style={{
          width: now ? 10 : 7, height: now ? 10 : 7, borderRadius: 999,
          background: past ? CD.ink : now ? CD.terracotta : 'transparent',
          border: `1.4px solid ${past ? CD.ink : now ? CD.terracotta : CD.ink4}`,
        }} />
      );
    })}
  </div>
);

// ----- Match bar -----

const MatchBar = ({ scenario = 'Coffee Shop · Downtown', round = 3, total = 8, timer = '0:42', you, opp }) => (
  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: CD.paperDeep, border: `1px solid ${CD.rule}` }}>
    <CoffeeBackdrop opacity={0.07} height={140} />
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, padding: '18px 22px', alignItems: 'center' }}>
      {/* You */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <AvatarPlayer size={64} ring={CD.terracotta} />
        <div>
          <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>You</div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, color: CD.ink }}>{you.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <CashTicker value={you.cash} />
            <CashTrend points={you.trend} color={CD.ink} />
          </div>
        </div>
      </div>

      {/* Center */}
      <div style={{ textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{scenario}</div>
        <div className="serif" style={{ fontSize: 32, color: CD.ink, lineHeight: 1, marginTop: 2 }}>
          Round <span className="num" style={{ fontSize: 30 }}>{round}</span>
          <span style={{ color: CD.ink3 }}> / {total}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <RoundDots total={total} current={round} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                      padding: '3px 10px', borderRadius: 999, background: CD.paper, border: `1px solid ${CD.rule}` }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: CD.terracotta }} className="cd-pulse" />
          <span className="mono" style={{ fontSize: 12, color: CD.ink2 }}>{timer}</span>
          <span style={{ fontSize: 11, color: CD.ink3 }}>until reveal</span>
        </div>
      </div>

      {/* Opponent (mirrored) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Opponent · Elo {opp.elo}</div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, color: CD.ink }}>{opp.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: CD.ink3 }}>their menu</span>
            <span className="num" style={{ fontSize: 22, color: CD.ink, fontWeight: 500 }}>{opp.price}¢</span>
            {opp.locked && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px',
                             borderRadius: 999, background: CD.ink, color: CD.paper, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: CD.terracotta }} className="cd-pulse" />
                Locked
              </span>
            )}
          </div>
        </div>
        <AvatarOpponent size={64} ring={CD.ink4} />
      </div>
    </div>
  </div>
);

// Animated number — tick-rolls up or down when value changes.
interface CashTickerProps { value: number; prefix?: string; size?: number; }
const CashTicker = ({ value, prefix = '$', size = 22 }: CashTickerProps) => {
  const prev = React.useRef<number>(value);
  const dir = value > prev.current ? 'up' : value < prev.current ? 'down' : null;
  React.useEffect(() => { prev.current = value; }, [value]);
  return (
    <span className="num" style={{ display: 'inline-block', fontSize: size, color: CD.ink, fontWeight: 500, overflow: 'hidden', verticalAlign: 'middle' }}>
      {prefix}
      <span
        key={value}
        className={dir === 'up' ? 'cd-tick-up' : dir === 'down' ? 'cd-tick-down' : undefined}
      >
        {Math.round(value).toLocaleString()}
      </span>
    </span>
  );
};

// Tiny sparkline for cash trend
const CashTrend = ({ points = [], color = CD.ink }) => {
  if (!points || points.length < 2) return null;
  const w = 56, h = 14;
  const min = Math.min(...points), max = Math.max(...points);
  const r = Math.max(1, max - min);
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / r) * h;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={path} stroke={color} strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
};

// ----- Coach speech strip -----

const CoachBubble = ({ children, label = 'Prof. Aldo · Coach', tone = 'tip' }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 16px 12px 12px',
    background: tone === 'warn' ? CD.terraSoft : CD.cream,
    border: `1px solid ${tone === 'warn' ? CD.terracotta : '#fde68a'}`,
    borderRadius: 14, position: 'relative',
  }}>
    <AvatarCoach size={44} />
    <div style={{ flex: 1, paddingTop: 2 }}>
      <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
      <div className="serif" style={{ fontSize: 19, lineHeight: 1.3, color: CD.ink, marginTop: 2, fontStyle: 'italic' }}>
        “{children}”
      </div>
    </div>
  </div>
);

// ----- Tabs (domain) -----

const DomainTabs = ({ active, onPick }) => {
  const items = [
    { k: 'sales', label: 'Sales' },
    { k: 'procurement', label: 'Procurement' },
    { k: 'operations', label: 'Operations' },
    { k: 'hr', label: 'HR' },
    { k: 'marketing', label: 'Marketing' },
    { k: 'finance', label: 'Finance' },
  ];
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 4, borderRadius: 12,
      background: CD.paperDeep, border: `1px solid ${CD.rule}`,
    }}>
      {items.map(it => {
        const isActive = it.k === active;
        const g = CD.d[it.k];
        return (
          <button key={it.k} onClick={() => onPick && onPick(it.k)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: isActive ? CD.paper : 'transparent',
            color: isActive ? CD.ink : CD.ink3,
            fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
            boxShadow: isActive ? `inset 0 0 0 1px ${CD.rule}` : 'none',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: g.c, opacity: isActive ? 1 : 0.5 }} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
};

// ----- Pick slot -----

interface PickSlotProps { idx: number; pick?: PickValue | null; }
const PickSlot = ({ idx, pick }: PickSlotProps) => (
  <div className={pick ? 'cd-slot-in' : ''} style={{
    border: `1px ${pick ? 'solid' : 'dashed'} ${pick ? CD.d[pick.domain].c : CD.ink4}`,
    background: pick ? CD.cardstock : 'transparent',
    borderRadius: 12, padding: pick ? '12px 14px' : '14px',
    minHeight: 64,
    transition: 'background .2s, border-color .2s',
  }}>
    {pick ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DomainGlyph domain={pick.domain} size={24} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: CD.ink, lineHeight: 1.2 }}>{pick.title}</div>
          <div style={{ fontSize: 12, color: CD.ink3, marginTop: 2 }}>{pick.value}</div>
        </div>
        <button style={{
          border: 'none', background: 'transparent', color: CD.ink3,
          cursor: 'pointer', fontSize: 16, padding: 4,
        }}>×</button>
      </div>
    ) : (
      <div style={{ fontSize: 12, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Slot {idx} · empty
      </div>
    )}
  </div>
);

// ----- Weather icons (compact, 20px default) -----

const Weather = ({ kind = 'rain', size = 20, color = CD.ink2 }) => {
  const s = { display: 'block' };
  switch (kind) {
    case 'sun': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={s}>
        <circle cx="12" cy="12" r="4" fill={color} />
        <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.5" y1="4.5" x2="6.6" y2="6.6" />
          <line x1="17.4" y1="17.4" x2="19.5" y2="19.5" />
          <line x1="4.5" y1="19.5" x2="6.6" y2="17.4" />
          <line x1="17.4" y1="6.6" x2="19.5" y2="4.5" />
        </g>
      </svg>
    );
    case 'cloud': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={s}>
        <path d="M7 17 a 4 4 0 0 1 0.5 -7.96 a 5 5 0 0 1 9.5 1.46 a 3.5 3.5 0 0 1 0 6.5 Z" fill={color} />
      </svg>
    );
    case 'rain': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={s}>
        <path d="M6 13 a 4 4 0 0 1 0.5 -7.96 a 5 5 0 0 1 9.5 1.46 a 3.5 3.5 0 0 1 0 6.5 Z" fill={color} />
        <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <line x1="8"  y1="17" x2="7"  y2="20" />
          <line x1="13" y1="17" x2="12" y2="20" />
          <line x1="17" y1="17" x2="16" y2="20" />
        </g>
      </svg>
    );
    case 'wind': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={s} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M3 8 H 14 A 3 3 0 1 0 11 5" />
        <path d="M3 13 H 18 A 3 3 0 1 1 15 16" />
        <path d="M3 18 H 9" />
      </svg>
    );
    case 'snow': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={s} stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
      </svg>
    );
    default: return null;
  }
};

const WeatherChip = ({ kind = 'rain', label, delta }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999,
    background: CD.paper, border: `1px solid ${CD.rule}`,
  }}>
    <Weather kind={kind} size={14} />
    <span style={{ fontSize: 12, color: CD.ink2 }}>{label}</span>
    {delta != null && (
      <span style={{ fontSize: 11, color: delta < 0 ? CD.red : CD.green }} className="num">
        {delta > 0 ? '+' : ''}{delta}
      </span>
    )}
  </span>
);

// ----- Slider — value-bubble scrubs along the track -----

const Slider = ({ value, min = 0, max = 100, step = 1, format = (v) => v, suffix = '', color, onChange, label, hint }) => {
  const c = color || CD.terracotta;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            {label}
          </span>
          <span className="num serif" style={{ fontSize: 26, color: CD.ink, lineHeight: 1 }}>
            {format(value)}<span style={{ color: CD.ink3, fontSize: 18 }}>{suffix}</span>
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
        {/* Track */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999,
          background: CD.paperDeep, border: `1px solid ${CD.rule}`,
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute', left: 0, height: 6, borderRadius: 999,
          width: `${pct}%`, background: c, opacity: 0.85,
        }} />
        {/* Ticks (4 evenly spaced minor marks) */}
        {[20, 40, 60, 80].map(t => (
          <div key={t} style={{
            position: 'absolute', left: `${t}%`, top: '50%',
            width: 1, height: 8, transform: 'translate(-50%, -50%)',
            background: CD.ink4, opacity: 0.6,
          }} />
        ))}
        {/* Thumb */}
        <div style={{
          position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
          width: 18, height: 18, borderRadius: 999,
          background: CD.paper, border: `2px solid ${c}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }} />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0,
          }}
        />
      </div>
      {hint && (
        <div style={{ fontSize: 11.5, color: CD.ink3, marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
};

// ----- Stepper (small integer) -----

const Stepper = ({ value, min = 0, max = 99, onChange, label, suffix = '' }) => (
  <div>
    {label && (
      <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{label}</div>
    )}
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 10 }}>
      <button onClick={() => onChange && onChange(Math.max(min, value - 1))}
              style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: CD.ink, fontSize: 18 }}>−</button>
      <div className="num serif" style={{ minWidth: 56, textAlign: 'center', fontSize: 22, color: CD.ink }}>
        {value}<span style={{ color: CD.ink3, fontSize: 14 }}>{suffix}</span>
      </div>
      <button onClick={() => onChange && onChange(Math.min(max, value + 1))}
              style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: CD.ink, fontSize: 18 }}>+</button>
    </div>
  </div>
);

// ----- Segmented toggle (2–3 options) -----

const Segmented = ({ value, options = [], onChange, label, color }) => {
  const c = color || CD.terracotta;
  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      )}
      <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 10 }}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button key={o.value} onClick={() => onChange && onChange(o.value)}
                    style={{
                      padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                      background: active ? CD.paper : 'transparent',
                      color: active ? CD.ink : CD.ink2,
                      fontSize: 13, fontWeight: 600,
                      boxShadow: active ? `inset 0 0 0 1px ${c}55` : 'none',
                    }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
};

// ----- Pill button (small CTA) -----

const PillBtn = ({ children, variant = 'solid', color, onClick, size = 'md', icon, full }) => {
  const c = color || CD.ink;
  const sizes = {
    sm: { pad: '6px 12px', fs: 12 },
    md: { pad: '10px 18px', fs: 13.5 },
    lg: { pad: '14px 22px', fs: 15 },
  };
  const sz = sizes[size];
  const styles = {
    solid:   { background: c, color: CD.paper, border: `1px solid ${c}` },
    outline: { background: 'transparent', color: c, border: `1px solid ${CD.rule}` },
    ghost:   { background: 'transparent', color: c, border: '1px solid transparent' },
  }[variant];
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: sz.pad, borderRadius: 999, cursor: 'pointer', fontWeight: 600,
      fontSize: sz.fs, width: full ? '100%' : undefined,
      ...styles,
    }}>
      {children}
      {icon}
    </button>
  );
};

// Export
Object.assign(window, {
  CD,
  AvatarPlayer, AvatarOpponent, AvatarCoach,
  CoffeeBackdrop,
  DomainStripe, DomainGlyph, DomainTag,
  MoveCard, RoundDots, MatchBar, CashTrend, CashTicker,
  CoachBubble, DomainTabs, PickSlot,
  Weather, WeatherChip,
  Slider, Stepper, Segmented, PillBtn,
});
