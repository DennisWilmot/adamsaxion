import React from 'react';
import { T, Cash, Price, Glyph, DomainChip, DomainRow, DomainTag, Btn, AvPlayer, AvOpp, AvCoach, Eyebrow, Stars, Cup, Panel } from './kit.jsx';

// Margin — tightened Decide screen, two directions + system-decision cards.
// Renders inside DesignCanvas artboards. Everything uses the mt-kit so the
// material is finally consistent: flat glyphs, mono money, one button family.

const PAGE = { background: 'linear-gradient(180deg,#e9eef5 0%, #eef1f6 120px)', height: '100%', overflow: 'hidden' };

// ───────────────────────── shared sub-components ─────────────────────────

// host tab/shell chrome (kept — constraint: stays inside the game tab)
const Shell = ({ children, tab = 'vs Morgan · Round 2' }) => (
  <div className="mt" style={PAGE}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '10px 16px 0', background: 'linear-gradient(180deg,#dbe6f5,#e9eef5)' }}>
      <ShellTab>Home</ShellTab>
      <ShellTab active>{tab}</ShellTab>
      <ShellTab plus>+</ShellTab>
      <div style={{ flex: 1 }} />
      <button className="mt-press" style={{ border: `1px solid ${T.redSoft}`, background: '#fff', color: T.red, fontWeight: 600, fontSize: 13, padding: '6px 14px', borderRadius: 999, cursor: 'pointer' }}>Forfeit</button>
      <span style={{ fontSize: 13, color: T.ink2, fontWeight: 600, marginLeft: 16 }}>Margin</span>
    </div>
    <div style={{ padding: '18px 22px 24px' }}>{children}</div>
  </div>
);
const ShellTab = ({ children, active, plus }) => (
  <div style={{
    padding: plus ? '8px 12px' : '9px 16px', fontSize: 13, fontWeight: 600,
    color: active ? T.ink : T.ink2,
    background: active ? T.paper : 'transparent',
    border: `1px solid ${active ? T.rule : 'transparent'}`, borderBottom: active ? `1px solid ${T.paper}` : 'none',
    borderRadius: '10px 10px 0 0', marginBottom: -1, position: 'relative', zIndex: active ? 2 : 1,
  }}>{children}</div>
);

const CoachBubble = ({ children, tag = 'Prof. Aldo · Coach' }) => (
  <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.coach, border: `1px solid ${T.coachLine}`, borderRadius: 14 }}>
    <div style={{ flex: '0 0 auto' }}><AvCoach size={40} /></div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', color: '#1f2937', fontFamily: 'inherit' }}>Prof. Aldo</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b5a1f', background: '#fbeeb8', border: '1px solid #ecd98f', padding: '1px 6px', borderRadius: 5 }}>Coach</span>
      </div>
      <div className="serif" style={{ fontSize: 16.5, lineHeight: 1.36, fontStyle: 'italic', color: '#2b2616', marginTop: 5, fontWeight: 500 }}>“{children}”</div>
    </div>
  </div>
);

// move tile — domain color as a thin left rule. Action name only; the
// effect/cost live on the detail card so they're not shown twice.
const MoveTile = ({ dk, name, meta, selected }) => {
  const d = T.d[dk];
  return (
    <div className="mt-tile mt-press" style={{
      position: 'relative', textAlign: 'left', cursor: 'pointer',
      background: selected ? d.soft : T.card,
      border: `1px solid ${selected ? d.c : T.rule}`, borderRadius: 11,
      padding: '13px 12px 13px 15px', overflow: 'hidden', minHeight: 46,
      display: 'flex', alignItems: 'center',
      boxShadow: selected ? `0 0 0 3px ${d.soft}` : 'none',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: d.c }} />
      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{name}</div>
      {meta && <div className="mono" style={{ fontSize: 11, color: T.ink3, marginLeft: 'auto', paddingLeft: 8, flex: '0 0 auto' }}>{meta}</div>}
    </div>
  );
};

// selected-move detail
const MoveDetail = ({ dk, title, desc, effect, cost }) => {
  const d = T.d[dk];
  return (
    <div style={{ border: `1px solid ${d.c}`, boxShadow: `0 0 0 3px ${d.soft}`, borderRadius: 13, padding: 15, background: T.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: d.soft, display: 'grid', placeItems: 'center' }}><Glyph kind={d.glyph} c={d.c} size={15} /></div>
            <DomainTag dk={dk} />
          </div>
          <h3 className="serif" style={{ fontSize: 21, color: T.ink, lineHeight: 1.05 }}>{title}</h3>
        </div>
        <Btn kind="ghost" size="sm">Remove draft</Btn>
      </div>
      <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.5, margin: '10px 0 12px' }}>{desc}</p>
      <div style={{ display: 'flex', gap: 18, paddingTop: 11, borderTop: `1px dashed ${T.rule}` }}>
        <div><Eyebrow>Effect</Eyebrow><div className="mono" style={{ fontSize: 13, color: T.ink, marginTop: 3 }}>{effect}</div></div>
        <div><Eyebrow>Cost</Eyebrow><div style={{ marginTop: 3 }}><Cash v={cost} size={13} /></div></div>
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.ink2 }}>
            <span style={{ width: 32, height: 18, borderRadius: 99, background: T.blue, position: 'relative' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: 99, background: '#fff' }} /></span>
            This round
          </span>
        </div>
      </div>
    </div>
  );
};

// the left column (identical across both directions — the system is the point)
const DecideColumn = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 380 }}>
    <CoachBubble>Last round you served 45 and held 3.8 stars, but the bigger menu strained the team. Steady the line before you stretch it again.</CoachBubble>
    <Panel pad={16}>
      <Eyebrow>Domains · Round 2</Eyebrow>
      <h2 className="serif" style={{ fontSize: 26, color: T.ink, margin: '4px 0 14px', fontWeight: 600 }}>What will you do?</h2>
      <DomainRow active="ops" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0 14px' }}>
        <MoveTile dk="ops" name="Upgrade equipment" selected />
        <MoveTile dk="ops" name="Perform maintenance" />
        <MoveTile dk="ops" name="Start R&D project" />
        <MoveTile dk="ops" name="Activate overtime" />
      </div>
      <MoveDetail dk="ops" title="Upgrade equipment" desc="Invest in better gear. More capacity and quality — but gear wears down without upkeep." effect="capacity +18%" cost={80} />
    </Panel>
  </div>
);

// ── ARENA — Option A: flat head-to-head (converted, no photo) ─────────────
const ArenaFlat = () => {
  const Side = ({ av, name, sub, price, cap, you, locked, thinking }) => (
    <div style={{ flex: 1, padding: '4px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {av}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{name}</span>
            {you && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: T.blue, background: T.blueSoft, padding: '2px 6px', borderRadius: 5 }}>YOU</span>}
          </div>
          <div style={{ fontSize: 12, color: locked ? T.green : T.ink3, fontWeight: 600, marginTop: 2 }}>{locked ? '● Locked in' : thinking ? '○ Thinking…' : sub}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div><Eyebrow>Their price</Eyebrow><div style={{ marginTop: 2 }}><Price v={price} size={28} color={T.ink} /></div></div>
        {cap != null && <div style={{ textAlign: 'right' }}><Eyebrow>Capacity</Eyebrow><div className="mono" style={{ fontSize: 15, marginTop: 2, color: T.ink2 }}>{cap}%</div></div>}
      </div>
      <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: T.ruleSoft, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: (cap || 70) + '%', background: you ? T.blue : T.ink4, borderRadius: 99 }} />
      </div>
    </div>
  );
  return (
    <Panel pad={16} style={{ background: T.paper2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Eyebrow>Head to head</Eyebrow>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: T.card, border: `1px solid ${T.rule}` }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: T.blue }} />
          <span className="mono" style={{ fontSize: 12, color: T.ink2 }}>3:22</span>
          <span style={{ fontSize: 11, color: T.ink3 }}>to reveal</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
        <Side av={<AvOpp size={44} />} name="Morgan" price={450} cap={62} thinking />
        <div style={{ width: 1, background: T.rule, position: 'relative' }}>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: T.paper2, padding: '2px 0', fontSize: 11, fontWeight: 700, color: T.ink4, letterSpacing: '0.1em' }}>VS</span>
        </div>
        <Side av={<AvPlayer size={44} />} name="You" price={450} cap={71} you locked />
      </div>
    </Panel>
  );
};

// ── ARENA — Option B: restrained stage (kept, but flat material) ──────────
const ArenaStage = () => {
  const FloatCard = ({ av, name, status, price, you }) => (
    <div style={{
      background: T.card, border: `1.5px solid ${you ? T.blueLine : T.rule}`, borderRadius: 14,
      boxShadow: '0 8px 24px -14px rgba(15,30,60,.4)', padding: '11px 13px', minWidth: 178,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {av}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: T.ink }}>{name}</div>
          <div style={{ fontSize: 11.5, color: status === 'Locked in' ? T.green : T.ink3, fontWeight: 600 }}>{status === 'Locked in' ? '● ' : '○ '}{status}</div>
        </div>
        {you && <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: T.blue, background: T.blueSoft, padding: '2px 5px', borderRadius: 4 }}>YOU</span>}
      </div>
      <div style={{ marginTop: 9, height: 5, borderRadius: 99, background: T.ruleSoft }}>
        <div style={{ height: '100%', width: you ? '71%' : '58%', background: you ? T.blue : T.ink4, borderRadius: 99 }} />
      </div>
      <div style={{ marginTop: 8, textAlign: 'right' }}><Price v={price} size={17} color={T.ink} /></div>
    </div>
  );
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.rule}`,
      background: 'radial-gradient(120% 90% at 50% -10%, #fbf6 ee 0%, #eef2f8 45%, #e7ecf4 100%)', height: 250, padding: 16 }}>
      {/* flat bokeh — no photo, just soft light */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,214,140,.35), transparent 18%), radial-gradient(circle at 72% 24%, rgba(180,205,245,.4), transparent 16%), radial-gradient(circle at 60% 70%, rgba(255,230,180,.3), transparent 20%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
        <Eyebrow style={{ color: T.ink2 }}>Coffee Shop · Downtown</Eyebrow>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: T.card, border: `1px solid ${T.rule}` }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: T.blue }} /><span className="mono" style={{ fontSize: 12, color: T.ink2 }}>3:22</span>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 52, left: 18 }}><FloatCard av={<AvOpp size={38} />} name="Morgan" status="Thinking" price={450} /></div>
      <div style={{ position: 'absolute', bottom: 18, right: 18 }}><FloatCard av={<AvPlayer size={38} />} name="You" status="Locked in" price={450} you /></div>
    </div>
  );
};

// moves-to-lock list — border = domain color (now that color is taught)
const LockRow = ({ dk, name, meta }) => {
  const d = T.d[dk];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: T.card, border: `1px solid ${T.rule}`, borderLeft: `4px solid ${d.c}`, borderRadius: 11, padding: '10px 12px' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: d.soft, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><Glyph kind={d.glyph} c={d.c} size={15} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{name}</div>
        <div className="mono" style={{ fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{meta}</div>
      </div>
      <button className="mt-press" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.rule}`, background: T.paper2, color: T.ink3, cursor: 'pointer', fontSize: 15, lineHeight: 1, flex: '0 0 auto' }}>×</button>
    </div>
  );
};

const LockColumn = ({ arena }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 432 }}>
    {arena}
    <Panel pad={16}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <Eyebrow>Moves to lock</Eyebrow>
        <span className="mono" style={{ fontSize: 12, color: T.ink3, whiteSpace: 'nowrap' }}>3 / 3 slots</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LockRow dk="product" name="Simplify menu" meta="1 unit" />
        <LockRow dk="sales" name="Surge pricing" meta="enabled this round" />
        <LockRow dk="ops" name="Upgrade equipment" meta="enabled this round" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0', paddingTop: 12, borderTop: `1px dashed ${T.rule}` }}>
        <Eyebrow>Cost this round</Eyebrow>
        <span className="mono" style={{ fontSize: 14, color: T.ink2 }}><Cash v={-80} size={14} color={T.ink} /> <span style={{ color: T.ink3 }}>· after</span> <Cash v={474} size={14} color={T.ink} /></span>
      </div>
      <Btn kind="primary" size="lg" full>Review and lock →</Btn>
    </Panel>
  </div>
);

// turn log (right column) — DESCENDING: latest turn on top.
const TURNS = [
  { n: 2, latest: true, you: 54, opp: 31, served: 48, stars: '3.9', price: 450,
    note: 'You held at 450¢ while Morgan nudged to 440¢. Your regulars stayed; you out-earned the block this round.',
    news: 'Office order fulfilled — the capacity you kept paid off.' },
  { n: 1, latest: false, you: 54, opp: 79, served: 45, stars: '3.8', price: 450,
    note: 'Both shops opened at 450¢. Good news lifted everyone; Morgan edged you on volume.',
    news: 'A big office order is up for grabs.' },
];

const TurnEntry = ({ t }) => (
  <div style={{
    border: `1px solid ${t.latest ? T.blueLine : T.rule}`, borderRadius: 13,
    background: t.latest ? T.card : T.paper2, padding: t.latest ? 14 : 12,
    boxShadow: t.latest ? `0 0 0 3px ${T.blueSoft}` : 'none',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h3 className="serif" style={{ fontSize: t.latest ? 21 : 17, color: T.ink, fontWeight: 700 }}>Turn {t.n}</h3>
        {t.latest && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: T.blue, background: T.blueSoft, padding: '2px 6px', borderRadius: 5 }}>LATEST</span>}
      </div>
      <Cash v={t.you} sign size={t.latest ? 20 : 16} color={T.green} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.ink2, fontWeight: 600 }}><Cup size={14} c={T.ink2} /><span className="mono">{t.served}</span> served</span>
      <Stars v={t.stars} />
      <span className="mono" style={{ fontSize: 12, color: T.ink3, marginLeft: 'auto' }}>you {t.you >= t.opp ? '≥' : '<'} Morgan +${t.opp}</span>
    </div>
    <p style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.5, margin: '10px 0 0' }}>{t.note}</p>
    {t.latest && (
      <div style={{ display: 'flex', gap: 8, background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 10, padding: '9px 11px', marginTop: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: '#eab308', marginTop: 4, flex: '0 0 auto' }} />
        <div style={{ fontSize: 12, color: T.ink2, lineHeight: 1.4 }}><b style={{ color: T.ink }}>News:</b> {t.news}</div>
      </div>
    )}
  </div>
);

const TurnLog = () => (
  <div style={{ width: 348 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Eyebrow>Turn log</Eyebrow>
      <span className="mono" style={{ fontSize: 11, color: T.ink3 }}>newest first</span>
    </div>
    <div style={{ height: 2, background: T.ink, margin: '8px 0 14px', width: '100%' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {TURNS.map(t => <TurnEntry key={t.n} t={t} />)}
    </div>
  </div>
);

// ── full Decide screens ───────────────────────────────────────────────────
const DecideA = () => (
  <Shell>
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <DecideColumn />
      <LockColumn arena={<ArenaFlat />} />
      <TurnLog />
    </div>
  </Shell>
);
const DecideB = () => (
  <Shell>
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <DecideColumn />
      <LockColumn arena={<ArenaStage />} />
      <TurnLog />
    </div>
  </Shell>
);

export { CoachBubble, MoveTile, MoveDetail, LockRow, TurnLog, DecideColumn, LockColumn };
