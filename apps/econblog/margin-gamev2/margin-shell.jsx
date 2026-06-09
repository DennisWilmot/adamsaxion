// Margin — handoff shell system.
// Two chromes the whole product hangs off of, plus the shared widgets every
// screen reuses. Built on the mt-kit so material stays consistent.
//   · GameShell   — the SHELL routes (Home, Leaderboard, History, Notifications, Profile)
//                   GameTabs = Home | one tab per active match | +
//   · MatchShell  — the in-match routes. 3-col grid [ Left controls ][ Board ][ Turn log ]
//                   unless a phase is FULL-BLEED (review / terminal).
//   · RouteTag    — dev annotation strip (route · phase · panel) on every artboard.

// ─────────────────────────── sample data ───────────────────────────
// one-time motion styles (pulsing "thinking" dots used across phases)
if (typeof document !== 'undefined' && !document.getElementById('mg-shell-styles')) {
  const s = document.createElement('style');
  s.id = 'mg-shell-styles';
  s.textContent = `
    @keyframes mgq-dots { 0%{opacity:.25;} 50%{opacity:1;} 100%{opacity:.25;} }
    .mtq-dot{ animation:mgq-dots 1.1s ease-in-out infinite; }
    .mtq-dot:nth-child(2){ animation-delay:.18s; } .mtq-dot:nth-child(3){ animation-delay:.36s; }
    @media (prefers-reduced-motion: reduce){ .mtq-dot{ animation:none; } }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────── shared sample data ───────────────────────────
const ME = { name: 'adam.s', elo: 1266, trend: '+18', rec: '34–22', winrate: '61%' };
const TABS = [
  { id: 'marina', opp: 'Marina', round: 5, total: 8, urgent: true },
  { id: 'theo',   opp: 'Theo',   round: 3, total: 8, urgent: false },
];

// ─────────────────────────── dev annotation strip ─────────────────────────
// Shown at the top of every artboard so the engineer can map screen → route.
const RouteTag = ({ route, phase, panel, bleed }) => (
  <div className="mt" style={{
    display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, marginBottom: 12,
    border: `1px solid ${T.rule}`, borderRadius: 9, overflow: 'hidden', background: T.card,
  }}>
    <span style={{ padding: '5px 10px', background: T.ink, color: '#fff', fontWeight: 600 }}>{route}</span>
    {phase && <span style={{ padding: '5px 10px', color: T.ink2, borderRight: `1px solid ${T.rule}` }}>phase: <b style={{ color: T.ink }}>{phase}</b></span>}
    {panel && <span style={{ padding: '5px 10px', color: T.ink2 }}>panel: <b style={{ color: T.ink }}>{panel}</b></span>}
    {bleed && <span style={{ padding: '5px 10px', marginLeft: 'auto', color: T.red, fontWeight: 600, letterSpacing: '.04em' }}>FULL-BLEED</span>}
  </div>
);

// ─────────────────────────── small shared widgets ─────────────────────────
const RoundDots = ({ total = 8, current = 1 }) => (
  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{
        width: i + 1 === current ? 9 : 6, height: i + 1 === current ? 9 : 6, borderRadius: 99,
        background: i + 1 < current ? T.ink2 : i + 1 === current ? T.blue : T.ink4,
      }} />
    ))}
  </span>
);

// game-type dropdown — Standard default, Blitz, vs CPU
const ModePicker = ({ open }) => {
  const opts = [
    { k: 'standard', label: 'Standard', meta: '8 rounds · 24h/turn', dot: T.blue },
    { k: 'blitz',    label: 'Blitz',    meta: '6 rounds · 3 min/turn', dot: '#c2410c' },
    { k: 'cpu',      label: 'vs CPU',   meta: 'practice · no Elo', dot: T.ink3 },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button className="mt-press" style={{
        display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 999,
        border: `1px solid ${T.rule}`, background: T.card, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: T.ink,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: T.blue }} />
        Standard
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20, width: 232,
          background: T.card, border: `1px solid ${T.rule}`, borderRadius: 13, padding: 5,
          boxShadow: '0 16px 40px -18px rgba(15,30,60,.4)',
        }}>
          {opts.map((o, i) => (
            <div key={o.k} className="mt-press" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 9, cursor: 'pointer',
              background: i === 0 ? T.blueSoft : 'transparent',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: o.dot }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{o.label}</div>
                <div className="mono" style={{ fontSize: 11, color: T.ink3, marginTop: 1 }}>{o.meta}</div>
              </div>
              {i === 0 && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// generic status pill (status color — never a domain hue)
const Pill = ({ tone = 'ink', children }) => {
  const map = {
    ink:   { bg: T.paper2, bd: T.rule, fg: T.ink2 },
    blue:  { bg: T.blueSoft, bd: T.blueLine, fg: T.blue },
    green: { bg: T.greenSoft, bd: '#bfe6cc', fg: T.green },
    red:   { bg: T.redSoft, bd: '#f3c0c0', fg: T.red },
    warn:  { bg: '#fdf0d8', bd: '#f0d99a', fg: '#9a6b12' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
      background: map.bg, border: `1px solid ${map.bd}`, color: map.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

const Dot = ({ c }) => <span style={{ width: 6, height: 6, borderRadius: 99, background: c, display: 'inline-block' }} />;

// brand wordmark
const Wordmark = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
    <span style={{ width: 22, height: 22, borderRadius: 6, background: T.blue, display: 'grid', placeItems: 'center' }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: '#fff' }} />
    </span>
    <span className="serif" style={{ fontSize: 19, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>Margin</span>
  </span>
);

// ─────────────────────────── GameShell (shell routes) ─────────────────────
const NavIcon = ({ kind, active, badge }) => {
  const c = active ? T.blue : T.ink3;
  const paths = {
    board: <><path d="M4 19V5M10 19V9M16 19v-7M22 19H2"/></>,
    bell:  <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  };
  return (
    <button className="mt-press" style={{
      position: 'relative', width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
      border: `1px solid ${active ? T.blueLine : T.rule}`, background: active ? T.blueSoft : T.card,
      display: 'grid', placeItems: 'center',
    }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>
      {badge && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 99, background: T.red, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>{badge}</span>}
    </button>
  );
};

const GameTab = ({ children, active, plus, urgent }) => (
  <div className="mt-press" style={{
    display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
    padding: plus ? '9px 13px' : '9px 16px', fontSize: 13, fontWeight: 600,
    color: active ? T.ink : T.ink2,
    background: active ? T.card : 'transparent',
    border: `1px solid ${active ? T.rule : 'transparent'}`,
    borderBottom: active ? `1px solid ${T.card}` : '1px solid transparent',
    borderRadius: '11px 11px 0 0', marginBottom: -1, position: 'relative', zIndex: active ? 2 : 1,
  }}>
    {children}
    {urgent && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.red }} />}
  </div>
);

// ─────────────────────────── shared brand bar ─────────────────────────────
// The top bar that sits above BOTH the shell tabs and the match tabs, so the
// chrome is consistent everywhere. History lives here (its only entry point).
const BrandBar = ({ nav }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', background: T.paper2, borderBottom: `1px solid ${T.rule}` }}>
    <Wordmark />
    <span style={{ marginLeft: 4, fontSize: 12, color: T.ink3, fontWeight: 500 }}>/ play / price-war</span>
    <div style={{ flex: 1 }} />
    <button className="mt-press" style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
      border: `1px solid ${nav === 'history' ? T.blueLine : T.rule}`, background: nav === 'history' ? T.blueSoft : T.card,
      fontSize: 13, fontWeight: 600, color: nav === 'history' ? T.blue : T.ink2,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={nav === 'history' ? T.blue : T.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l3 2"/></svg>
      History
    </button>
    <div className="mt-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '5px 6px 5px 12px', borderRadius: 999, border: `1px solid ${T.rule}`, background: T.card, cursor: 'pointer' }}>
      <div style={{ lineHeight: 1 }}>
        <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{ME.elo}</span>
        <span className="mono" style={{ fontSize: 11, color: T.green, marginLeft: 5 }}>{ME.trend}</span>
      </div>
      <AvPlayer size={30} />
    </div>
  </div>
);

const GameShell = ({ route = 'Home', nav = 'home', children }) => (
  <div className="mt" style={{ background: T.paper, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
    <BrandBar nav={nav} />
    {/* game tabs */}
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, padding: '10px 22px 0', background: T.paper2, borderBottom: `1px solid ${T.rule}` }}>
      <GameTab active={nav === 'home'}>Home</GameTab>
      {TABS.map(t => <GameTab key={t.id} urgent={t.urgent}>vs {t.opp} · R{t.round}</GameTab>)}
      <GameTab plus>+ New</GameTab>
    </div>
    <div style={{ padding: '22px 24px 30px', flex: 1 }}>{children}</div>
  </div>
);

// ─────────────────────────── MatchShell (match routes) ────────────────────
const MatchTopBar = ({ opp, round, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '10px 20px 0', background: 'linear-gradient(180deg,#dbe6f5,#e9eef5)' }}>
    <GameTab>Home</GameTab>
    <GameTab active urgent={false}>vs {opp} · R{round}</GameTab>
    <GameTab plus>+</GameTab>
    <div style={{ flex: 1 }} />
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <RoundDots total={total} current={round} />
    </div>
    <button className="mt-press" style={{ marginBottom: 6, marginLeft: 16, border: `1px solid ${T.redSoft}`, background: '#fff', color: T.red, fontWeight: 600, fontSize: 13, padding: '6px 14px', borderRadius: 999, cursor: 'pointer' }}>Forfeit</button>
  </div>
);

// 3-col layout. Children set their own widths (board-tuned). Pass them in order.
const MatchShell = ({ opp = 'Morgan', round = 2, total = 8, tag, children }) => (
  <div className="mt" style={{ background: T.paper, minHeight: '100%' }}>
    <BrandBar nav="match" />
    <div style={{ background: 'linear-gradient(180deg,#e9eef5 0%, #eef1f6 130px)' }}>
      <MatchTopBar opp={opp} round={round} total={total} />
      <div style={{ padding: '16px 22px 26px' }}>
        {tag}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>{children}</div>
      </div>
    </div>
  </div>
);

// full-bleed wrapper for review / terminal — same paper, single centered column
const FullBleed = ({ children, max = 720, dim }) => (
  <div className="mt" style={{ background: dim ? '#0b1220' : T.paper, minHeight: '100%', padding: '34px 22px', display: 'flex', justifyContent: 'center' }}>
    <div style={{ width: '100%', maxWidth: max }}>{children}</div>
  </div>
);

// modal shell (for overlays drawn over a dimmed match)
const Modal = ({ children, accent = T.ink, width = 480 }) => (
  <div style={{ position: 'relative', minHeight: 460 }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,18,32,.32)', borderRadius: 16 }} />
    <div style={{
      position: 'relative', width: '100%', maxWidth: width, margin: '46px auto 0',
      background: T.card, border: `1px solid ${T.rule}`, borderTop: `4px solid ${accent}`, borderRadius: 16,
      padding: 22, boxShadow: '0 30px 70px -30px rgba(11,18,32,.6)',
    }}>{children}</div>
  </div>
);

// ─────────────────── the head-to-head board (CoffeeBattleBoard) ────────────
// One board, every phase. Each side: { name, av, you, status, price, cap }.
// status: 'connecting' | 'thinking' | 'locked' | 'revealed'
const BoardSide = ({ side, reveal }) => {
  const statusText = {
    connecting: '○ Connecting…', thinking: '○ Thinking…', locked: '● Locked in', revealed: '● Revealed',
  }[side.status];
  const statusColor = side.status === 'locked' || side.status === 'revealed' ? T.green : T.ink3;
  return (
    <div style={{ flex: 1, padding: '4px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {side.av}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{side.name}</span>
            {side.you && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: T.blue, background: T.blueSoft, padding: '2px 6px', borderRadius: 5 }}>YOU</span>}
          </div>
          <div style={{ fontSize: 12, color: statusColor, fontWeight: 600, marginTop: 2 }}>{statusText}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div><Eyebrow>Their price</Eyebrow>
          <div style={{ marginTop: 2 }}>
            {reveal && side.price != null
              ? <Price v={side.price} size={28} color={T.ink} />
              : <span className="mono" style={{ fontSize: 28, color: T.ink4, fontWeight: 600, letterSpacing: '.1em' }}>— —</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}><Eyebrow>Capacity</Eyebrow><div className="mono" style={{ fontSize: 15, marginTop: 2, color: T.ink2 }}>{reveal && side.cap != null ? side.cap + '%' : '·'}</div></div>
      </div>
      <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: T.ruleSoft, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: (reveal ? (side.cap || 0) : 0) + '%', background: side.you ? T.blue : T.ink4, borderRadius: 99, transition: 'width .6s ease' }} />
      </div>
    </div>
  );
};

const BattleBoard = ({ opp, you, reveal, timerLabel = '3:22', timerSub = 'to reveal', tone = 'blue' }) => (
  <Panel pad={16} style={{ background: T.paper2 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Eyebrow>Head to head</Eyebrow>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: T.card, border: `1px solid ${T.rule}` }}>
        <Dot c={reveal ? T.green : (tone === 'warn' ? '#c2410c' : T.blue)} />
        <span className="mono" style={{ fontSize: 12, color: T.ink2 }}>{timerLabel}</span>
        {timerSub && <span style={{ fontSize: 11, color: T.ink3 }}>{timerSub}</span>}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
      <BoardSide side={opp} reveal={reveal} />
      <div style={{ width: 1, background: T.rule, position: 'relative' }}>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: T.paper2, padding: '2px 0', fontSize: 11, fontWeight: 700, color: T.ink4, letterSpacing: '0.1em' }}>VS</span>
      </div>
      <BoardSide side={you} reveal={reveal} />
    </div>
  </Panel>
);

// section header used inside full-bleed screens
const BleedHead = ({ eyebrow, title, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="serif" style={{ fontSize: 32, color: T.ink, fontWeight: 700, marginTop: 4, lineHeight: 1.05 }}>{title}</h1>
    </div>
    {right}
  </div>
);

// ─────────────────────── Lesson upsell (Prof. Aldo) ───────────────────────
// Surfaced wherever a teachable moment appears (a mistake, a concept, a loss).
// Coach-cream so it reads as Aldo's voice, with a real CTA into a lesson.
const LessonGlyph = ({ size = 16, c }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-5" /><path d="M22 10v5" />
  </svg>
);
const LessonNudge = ({ topic, mins = 4, ctx, cta = 'Start lesson →' }) => (
  <div style={{ background: T.coach, border: `1px solid ${T.coachLine}`, borderRadius: 14, padding: 15 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: '#fbeeb8', border: '1px solid #ecd98f', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><LessonGlyph c="#6b5a1f" /></span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#6b5a1f', textTransform: 'uppercase' }}>Lesson · from Prof. Aldo</span>
      <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8a7430' }}>{mins} min</span>
    </div>
    <h4 className="serif" style={{ fontSize: 18, color: '#2b2616', fontWeight: 700, marginTop: 10, lineHeight: 1.2 }}>{topic}</h4>
    {ctx && <p style={{ fontSize: 12.5, color: '#5c4d2a', lineHeight: 1.45, margin: '5px 0 0' }}>{ctx}</p>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
      <Btn kind="primary" size="sm">{cta}</Btn>
      <span style={{ fontSize: 12, color: '#8a7430', cursor: 'pointer' }}>Maybe later</span>
    </div>
  </div>
);

// what opens when you tap a lesson CTA — preview / upsell destination
const LessonPreview = () => (
  <FullBleed max={560}>
    <RouteTag route="overlay · lesson upsell" phase="lesson_cta" panel="lesson-preview" />
    <Modal accent="#caa53a" width={520}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#6b5a1f', textTransform: 'uppercase' }}>Lesson · from Prof. Aldo</span>
        <Btn kind="ghost" size="sm">✕</Btn>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <AvCoach size={48} />
        <div>
          <h2 className="serif" style={{ fontSize: 24, color: T.ink, fontWeight: 700, lineHeight: 1.1 }}>Hold the line: price vs. volume</h2>
          <div className="mono" style={{ fontSize: 12, color: T.ink3, marginTop: 3 }}>4 min · 3 short scenes · earns a badge</div>
        </div>
      </div>
      <div style={{ background: T.coach, border: `1px solid ${T.coachLine}`, borderRadius: 12, padding: 13, margin: '14px 0' }}>
        <span style={{ fontSize: 12.5, color: '#5c4d2a' }}><b style={{ color: '#2b2616' }}>Why now:</b> you matched Morgan’s price cut in Round 3 and lost $210. This lesson shows when holding beats chasing.</span>
      </div>
      <Eyebrow>You’ll learn</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {['Why a price cut rarely wins back loyal customers', 'How to read whether a rival can absorb a war', 'The one number to watch before you respond'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: T.blueSoft, color: T.blue, fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', flex: '0 0 auto', marginTop: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.4 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <Btn kind="ghost" size="md" full>Maybe later</Btn>
        <Btn kind="primary" size="md" full>Start lesson →</Btn>
      </div>
    </Modal>
  </FullBleed>
);

Object.assign(window, {
  ME, TABS, RouteTag, RoundDots, ModePicker, Pill, Dot, Wordmark,
  GameShell, GameTab, BrandBar, MatchShell, MatchTopBar, FullBleed, Modal,
  BattleBoard, BoardSide, BleedHead, LessonNudge, LessonPreview,
});
