// Margin — tightened UI kit
// Enforces the system the audit called for:
//   · type ROLES: serif = display only, sans = body/labels, mono = every compared quantity
//   · money written ONE way per concept ($cash mono / ¢price mono), identically everywhere
//   · flat domain glyph chips replace the glossy emoji (one tint + one monoline glyph + one dot)
//   · ONE primary button family (brand blue, pill), red = destructive, ghost = secondary
//   · blue-outline means exactly one thing: "this is you"

const T = {
  // cool neutral paper (brand)
  paper:   '#eef1f6',
  paper2:  '#f7f9fc',
  card:    '#ffffff',
  ink:     '#0b1220',
  ink2:    '#46505f',
  ink3:    '#8a93a2',
  ink4:    '#c4cbd6',
  rule:    '#e4e8ef',
  ruleSoft:'#eef2f7',
  // brand + semantics (locked, small budget)
  blue:    '#0a52c4',
  blueSoft:'#e8f0ff',
  blueLine:'#b6d0fb',
  green:   '#15803d',
  greenSoft:'#e6f5ec',
  red:     '#dc2626',
  redSoft: '#fdeaea',
  coach:   '#fdf4d0',
  coachLine:'#f0e0a0',
  coachInk:'#5c4d16',
  // domain hues — used ONLY for the 6 categories, never for status
  d: {
    sales:   { c: '#c2410c', soft: '#fbeadf', name: 'Sales',    glyph: 'price' },
    product: { c: '#15803d', soft: '#e6f5ec', name: 'Product',  glyph: 'menu'  },
    ops:     { c: '#0a52c4', soft: '#e8f0ff', name: 'Ops',      glyph: 'gear'  },
    people:  { c: '#b45309', soft: '#f8eed8', name: 'People',   glyph: 'team'  },
    promo:   { c: '#9333ea', soft: '#f3e8ff', name: 'Promo',    glyph: 'promo' },
    finance: { c: '#334155', soft: '#e7ebf1', name: 'Finance',  glyph: 'coin'  },
  },
};

// one-time styles: fonts + the three role classes + a couple primitives
if (typeof document !== 'undefined' && !document.getElementById('mt-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,500;1,8..60,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'mt-styles';
  s.textContent = `
    .mt { font-family: 'Inter', system-ui, sans-serif; color: ${T.ink}; -webkit-font-smoothing: antialiased; }
    .mt *, .mt *::before, .mt *::after { box-sizing: border-box; }
    .mt .serif { font-family: 'Source Serif 4', Georgia, serif; letter-spacing: -0.015em; }
    .mt .mono  { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
    /* the ONE consistent thing already in the product: uppercase tracked grey label */
    .mt .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.ink3}; white-space: nowrap; }
    .mt h1,.mt h2,.mt h3,.mt h4 { margin: 0; font-weight: 600; }
    .mt button { font-family: inherit; }
    .mt-tile { transition: border-color .14s, box-shadow .14s, background .14s; }
    .mt-tile:hover { border-color: ${T.ink4}; }
    .mt-press { transition: transform .1s ease; }
    .mt-press:active { transform: translateY(1px); }
  `;
  document.head.appendChild(s);
}

// ── money: written one way, mono, everywhere ──────────────────────────────
const Cash = ({ v, sign = false, size = 'inherit', color }) => {
  const neg = v < 0;
  const s = (sign && v > 0 ? '+' : '') + (neg ? '−' : '') + '$' + Math.abs(v).toLocaleString();
  return <span className="mono" style={{ fontSize: size, color: color || 'inherit', fontWeight: 600 }}>{s}</span>;
};
const Price = ({ v, size = 'inherit', color }) => (
  <span className="mono" style={{ fontSize: size, color: color || 'inherit', fontWeight: 600 }}>{v}¢</span>
);

// ── domain glyph (flat monoline, drawn in the domain color) ───────────────
const Glyph = ({ kind, c, size = 18 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block' } };
  switch (kind) {
    case 'price': return (<svg {...p}><path d="M12 3v18"/><path d="M16.5 7.5C16.5 5.6 14.5 4.5 12 4.5S7.5 5.6 7.5 7.5 9.5 10.5 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.1-4.5-3"/></svg>);
    case 'menu':  return (<svg {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>);
    case 'gear':  return (<svg {...p}><circle cx="12" cy="12" r="3.2"/><path d="M12 4.5V3M12 21v-1.5M5.6 5.6 4.5 4.5M19.5 19.5l-1.1-1.1M4.5 12H3M21 12h-1.5M5.6 18.4 4.5 19.5M19.5 4.5l-1.1 1.1"/></svg>);
    case 'team':  return (<svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.6-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14c2.3.5 4 2.4 4 5"/></svg>);
    case 'promo': return (<svg {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M17.5 6.5a7 7 0 0 1 0 11"/></svg>);
    case 'coin':  return (<svg {...p}><ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>);
    default: return null;
  }
};

const DomainChip = ({ dk, size = 40, selected }) => {
  const d = T.d[dk];
  return (
    <div className="mt-tile mt-press" style={{
      width: size, height: size, borderRadius: 11,
      background: selected ? d.soft : T.paper2,
      border: `1.5px solid ${selected ? d.c : T.rule}`,
      boxShadow: selected ? `0 0 0 3px ${d.soft}` : 'none',
      display: 'grid', placeItems: 'center', cursor: 'pointer', flex: '0 0 auto',
    }}>
      <Glyph kind={d.glyph} c={selected ? d.c : T.ink3} size={size * 0.5} />
    </div>
  );
};

// row of all six
const DomainRow = ({ active = 'ops' }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {Object.keys(T.d).map(k => <DomainChip key={k} dk={k} selected={k === active} />)}
  </div>
);

// small inline domain tag (dot + name)
const DomainTag = ({ dk }) => {
  const d = T.d[dk];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: d.c }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: d.c }} />{d.name}
    </span>
  );
};

// ── one button family ─────────────────────────────────────────────────────
const Btn = ({ children, kind = 'primary', size = 'md', full, onClick, disabled }) => {
  const sizes = { sm: { p: '7px 14px', f: 13 }, md: { p: '11px 18px', f: 14 }, lg: { p: '15px 22px', f: 16 } };
  const z = sizes[size];
  const styles = {
    primary:  { background: disabled ? T.ink4 : T.blue, color: '#fff', border: '1px solid transparent' },
    ghost:    { background: 'transparent', color: T.blue, border: `1px solid ${T.rule}` },
    danger:   { background: 'transparent', color: T.red, border: `1px solid ${T.redSoft}` },
    dangerSolid:{ background: T.red, color: '#fff', border: '1px solid transparent' },
  }[kind];
  return (
    <button className="mt-press" onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: z.p, fontSize: z.f, fontWeight: 600, borderRadius: 999,
      cursor: disabled ? 'default' : 'pointer', width: full ? '100%' : undefined, ...styles,
    }}>{children}</button>
  );
};

// ── avatars (flat — stand in for the product's final memoji art) ──────────
const AvPlayer = ({ size = 44, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ display: 'block', borderRadius: 11, ...style }}>
    <rect width="100" height="100" rx="16" fill="#f2d9ad"/>
    <path d="M20 96C24 72 76 72 80 96L80 100 20 100Z" fill="#5a3b27"/>
    <rect x="44" y="58" width="12" height="14" fill="#cd9e6f"/>
    <ellipse cx="50" cy="46" rx="19" ry="21" fill="#cd9e6f"/>
    <path d="M31 40C31 24 69 24 69 40C69 33 61 29 50 29C39 29 31 33 31 40Z" fill="#39281b"/>
    <path d="M27 44C27 28 73 28 73 44" fill="none" stroke="#39281b" strokeWidth="3.4" strokeLinecap="round"/>
    <rect x="23" y="42" width="8" height="12" rx="3" fill="#39281b"/><rect x="69" y="42" width="8" height="12" rx="3" fill="#39281b"/>
    <circle cx="43.5" cy="48" r="1.7" fill="#1a1208"/><circle cx="56.5" cy="48" r="1.7" fill="#1a1208"/>
    <path d="M44 55q6 4 12 0" fill="none" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const AvOpp = ({ size = 44, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ display: 'block', borderRadius: 11, ...style }}>
    <rect width="100" height="100" rx="16" fill="#7fb0e6"/>
    <path d="M20 96C24 73 76 73 80 96L80 100 20 100Z" fill="#243b59"/>
    <path d="M45 76 50 92 55 76Z" fill="#e8eef6"/>
    <rect x="44" y="58" width="12" height="14" fill="#b98a63"/>
    <ellipse cx="50" cy="46" rx="19" ry="21" fill="#b98a63"/>
    <path d="M31 36C31 22 69 22 69 36L69 40 31 40Z" fill="#1c2c43"/>
    <path d="M23 40 60 40 60 44 23 44Z" fill="#1c2c43"/>
    <rect x="39" y="45" width="7" height="1.6" fill="#1a1208"/><rect x="54" y="45" width="7" height="1.6" fill="#1a1208"/>
    <circle cx="43.5" cy="48.5" r="1.7" fill="#1a1208"/><circle cx="56.5" cy="48.5" r="1.7" fill="#1a1208"/>
    <path d="M44 58 56 58" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const AvCoach = ({ size = 40, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ display: 'block', borderRadius: 11, ...style }}>
    <rect width="100" height="100" rx="16" fill="#a7d8c4"/>
    <path d="M20 96C24 73 76 73 80 96L80 100 20 100Z" fill="#5e5340"/>
    <path d="M40 72 50 78 40 84ZM60 72 50 78 60 84Z" fill="#0a52c4"/>
    <rect x="48" y="74" width="4" height="8" rx="1" fill="#0a3f96"/>
    <rect x="44" y="60" width="12" height="14" fill="#d9b691"/>
    <ellipse cx="50" cy="46" rx="19" ry="21" fill="#d9b691"/>
    <path d="M30 43C30 37 36 33 42 33L58 33C64 33 70 37 70 43C66 39 60 37 50 37C40 37 34 39 30 43Z" fill="#d9b691"/>
    <path d="M28 51C28 39 34 33 38 33L38 37C33 39 30 45 30 53Z" fill="#e9e6e0"/>
    <path d="M72 51C72 39 66 33 62 33L62 37C67 39 70 45 70 53Z" fill="#e9e6e0"/>
    <circle cx="40" cy="50" r="5" fill="none" stroke="#1a1208" strokeWidth="1.4"/><circle cx="60" cy="50" r="5" fill="none" stroke="#1a1208" strokeWidth="1.4"/>
    <path d="M45 50 55 50" stroke="#1a1208" strokeWidth="1.4"/>
    <circle cx="40" cy="50" r="1.4" fill="#1a1208"/><circle cx="60" cy="50" r="1.4" fill="#1a1208"/>
    <path d="M40 60q10 4 20 0q-4-2-10-2q-6 0-10 2Z" fill="#e9e6e0"/>
  </svg>
);

// ── small shared bits ─────────────────────────────────────────────────────
const Eyebrow = ({ children, style }) => <div className="eyebrow" style={style}>{children}</div>;

const Stars = ({ v }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.ink2 }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#eab308"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 23l-6 -2.6 1.4-6.8L2.3 9l6.9-.7z"/></svg>
    <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
  </span>
);

const Cup = ({ size = 14, c = T.ink3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M7 3.5 6.5 5M10 3.5 9.5 5M13 3.5 12.5 5"/>
  </svg>
);

// card shell
const Panel = ({ children, style, pad = 18 }) => (
  <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 16, padding: pad, ...style }}>{children}</div>
);

Object.assign(window, {
  T, Cash, Price, Glyph, DomainChip, DomainRow, DomainTag, Btn,
  AvPlayer, AvOpp, AvCoach, Eyebrow, Stars, Cup, Panel,
});
