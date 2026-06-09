import React from 'react';
import { T, Cash, Price, Glyph, DomainChip, DomainRow, DomainTag, Btn, AvPlayer, AvOpp, AvCoach, Eyebrow, Stars, Cup, Panel } from './kit.jsx';
import { MatchShell, RouteTag, BattleBoard, FullBleed, LessonNudge, Pill } from './shell.jsx';
import { DecideColumn, LockColumn, TurnLog, CoachBubble } from './decide.jsx';

// Margin — MATCH-FLOW screens. The round loop inside MatchShell:
//   match-lobby → briefing → decide → review(full-bleed) → waiting → report → (Continue)
// Reuses DecideColumn / LockColumn / TurnLog from margin-tight-screens and the
// BattleBoard / MatchShell from margin-shell.

const AVO = <AvOpp size={44} />;
const AVP = <AvPlayer size={44} />;

// read-only locked move row (no remove affordance)
const LockedRow = ({ dk, name, meta }) => {
  const d = T.d[dk];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: T.paper2, border: `1px solid ${T.rule}`, borderLeft: `4px solid ${d.c}`, borderRadius: 11, padding: '10px 12px' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: d.soft, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><Glyph kind={d.glyph} c={d.c} size={15} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{name}</div>
        <div className="mono" style={{ fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{meta}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
  );
};

const LOCKED = [
  ['product', 'Simplify menu', '1 unit'],
  ['sales', 'Surge pricing', 'enabled this round'],
  ['ops', 'Upgrade equipment', 'enabled this round'],
];

// empty turn-log placeholder (pre-report phases)
const TurnLogEmpty = ({ note }) => (
  <div style={{ width: 340 }}>
    <Panel pad={16} style={{ minHeight: 360 }}>
      <Eyebrow>Turn log</Eyebrow>
      <div style={{ height: 2, background: T.ink, margin: '8px 0 14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 10, color: T.ink3, textAlign: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.ink4} strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>
        <div style={{ fontSize: 13, maxWidth: 240, lineHeight: 1.45 }}>{note}</div>
      </div>
    </Panel>
  </div>
);

// ── waiting_for_opponent — match-lobby ─────────────────────────────────────
const MatchLobby = () => (
  <MatchShell opp="Morgan" round={1} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}" phase="waiting_for_opponent" panel="match-lobby" />}>
    <div style={{ width: 372 }}>
      <Panel pad={18}>
        <Eyebrow>New match · Coffee Shop</Eyebrow>
        <h2 className="serif" style={{ fontSize: 24, color: T.ink, fontWeight: 600, margin: '6px 0 10px' }}>Match created.</h2>
        <p style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5, margin: 0 }}>You’re matched with <b>Morgan</b> (Elo 1240). Waiting for them to connect — the round won’t start until both of you are in.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span style={{ fontSize: 13.5, color: T.ink }}>You’re connected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', gap: 3 }}><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.ink3 }} /><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.ink3 }} /><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.ink3 }} /></span>
            <span style={{ fontSize: 13.5, color: T.ink3 }}>Morgan is connecting…</span>
          </div>
        </div>
        <div style={{ marginTop: 16 }}><Btn kind="ghost" size="md" full>Leave to lobby</Btn></div>
      </Panel>
    </div>
    <div style={{ width: 432 }}>
      <BattleBoard opp={{ name: 'Morgan', av: AVO, status: 'connecting' }} you={{ name: 'You', av: AVP, you: true, status: 'connecting' }} reveal={false} timerLabel="—" timerSub="not started" />
      <Panel pad={16} style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5 }}>The board fills in once Morgan joins and the briefing begins.</div>
      </Panel>
    </div>
    <TurnLogEmpty note="No rounds played yet. The first report lands after Round 1 resolves." />
  </MatchShell>
);

// ── briefing — clock already running, Begin Round 1 ────────────────────────
const Briefing = () => (
  <MatchShell opp="Morgan" round={1} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}/briefing" phase="briefing" panel="briefing" />}>
    <div style={{ width: 372, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CoachBubble>You both open on the same block — same foot traffic, same costs. Most profit after 8 days wins. Don’t flinch on price round one.</CoachBubble>
      <Panel pad={16}>
        <Eyebrow>The scene</Eyebrow>
        <p className="serif" style={{ fontSize: 16, lineHeight: 1.45, color: '#3a3413', marginTop: 6, fontStyle: 'italic' }}>You just opened a coffee shop. Morgan opened one across the street. The shop with the most profit after 8 days wins.</p>
      </Panel>
    </div>
    <div style={{ width: 432, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <BattleBoard opp={{ name: 'Morgan', av: AVO, status: 'thinking' }} you={{ name: 'You', av: AVP, you: true, status: 'thinking' }} reveal={false} timerLabel="0:42" timerSub="clock running" />
      <Panel pad={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>Round 1 of 8</Eyebrow>
          <Pill tone="warn">⏱ clock started at match creation</Pill>
        </div>
        <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.5, margin: '10px 0 14px' }}>Each turn you pick 3 actions across 6 domains. Both players submit, then the engine resolves the round simultaneously.</p>
        <Btn kind="primary" size="lg" full>Begin Round 1 →</Btn>
      </Panel>
    </div>
    <div style={{ width: 340 }}>
      <Panel pad={16}>
        <Eyebrow>You start with</Eyebrow>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[['Cash', <Cash v={500} size={13} color={T.ink} />], ['Price', <Price v={400} size={13} color={T.ink} />], ['Staff', '2 · wage $14/hr'], ['Supplier', 'Tier 2 (mid)'], ['Equipment', 'Level 1'], ['Foot traffic', '220 / day']].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? `1px dashed ${T.rule}` : 'none' }}>
              <span style={{ fontSize: 13, color: T.ink2 }}>{r[0]}</span>
              <span className="mono" style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{r[1]}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.rule}` }}>
          <Eyebrow>Public vs hidden</Eyebrow>
          <p style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.5, margin: '6px 0 0' }}><b style={{ color: T.ink }}>Public:</b> both prices, customers, reviews. <b style={{ color: T.ink }}>Hidden:</b> cash, costs, morale, supplier.</p>
        </div>
      </Panel>
    </div>
  </MatchShell>
);

// ── decide (not locked) — the canonical round screen ───────────────────────
const DecideScreen = () => (
  <MatchShell opp="Morgan" round={2} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}" phase="decide (not locked)" panel="decide" />}>
    <DecideColumn />
    <LockColumn arena={<BattleBoard opp={{ name: 'Morgan', av: AVO, status: 'thinking' }} you={{ name: 'You', av: AVP, you: true, status: 'thinking' }} reveal={false} timerLabel="3:22" timerSub="to reveal" />} />
    <TurnLog />
  </MatchShell>
);

// ── waiting (you locked, opp not) — resolving ──────────────────────────────
const Waiting = () => (
  <MatchShell opp="Morgan" round={2} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}/waiting" phase="decide / resolving" panel="waiting" />}>
    <div style={{ width: 372, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 13, borderRadius: 14, background: T.greenSoft, border: '1px solid #bfe6cc', color: T.green, fontWeight: 700, fontSize: 14.5 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        Locked — 3 moves committed
      </div>
      <Panel pad={16}>
        <Eyebrow>Your locked moves · Round 2</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {LOCKED.map((m, i) => <LockedRow key={i} dk={m[0]} name={m[1]} meta={m[2]} />)}
        </div>
        <p style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.5, margin: '12px 0 0' }}>You can <b style={{ color: T.ink }}>unlock &amp; revise</b> until Morgan locks or your timer expires.</p>
        <div style={{ marginTop: 12 }}><Btn kind="ghost" size="md" full>↺ Unlock &amp; revise</Btn></div>
      </Panel>
    </div>
    <div style={{ width: 432 }}>
      <BattleBoard opp={{ name: 'Morgan', av: AVO, status: 'thinking' }} you={{ name: 'You', av: AVP, you: true, status: 'locked' }} reveal={false} timerLabel="2:48" timerSub="awaiting Morgan" />
      <Panel pad={16} style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: 5, marginBottom: 8 }}>
          <span className="mtq-dot" style={{ width: 8, height: 8, borderRadius: 99, background: T.ink3 }} /><span className="mtq-dot" style={{ width: 8, height: 8, borderRadius: 99, background: T.ink3 }} /><span className="mtq-dot" style={{ width: 8, height: 8, borderRadius: 99, background: T.ink3 }} />
        </div>
        <div style={{ fontSize: 14, color: T.ink2, lineHeight: 1.5 }}>Waiting on Morgan to lock. The round resolves the instant they commit — nothing else to do here.</div>
      </Panel>
    </div>
    <TurnLogEmpty note="Round 2 resolves once both players lock. Round 1’s report is in History." />
  </MatchShell>
);

// ── report — round delta, Continue ─────────────────────────────────────────
const Report = () => (
  <MatchShell opp="Morgan" round={1} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}/report/1" phase="report" panel="report" />}>
    <div style={{ width: 372, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CoachBubble>You both held at 450¢ — a calm open. Morgan edged ahead on volume. Watch your capacity before you stretch the menu again.</CoachBubble>
      <Panel pad={16}>
        <Eyebrow>What changed</Eyebrow>
        <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, margin: '8px 0 0' }}>Good news lifted the whole block. You served 45 at 450¢; Morgan matched at 450¢ and served a few more.</p>
      </Panel>
      <LessonNudge topic="Reading a calm open" mins={3}
        ctx="Both of you held at 450¢. Learn what an opponent matching your price is really telling you." />
    </div>
    <div style={{ width: 432, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <BattleBoard opp={{ name: 'Morgan', av: AVO, status: 'revealed', price: 450, cap: 62 }} you={{ name: 'You', av: AVP, you: true, status: 'revealed', price: 450, cap: 71 }} reveal={true} timerLabel="revealed" timerSub={null} />
      <Panel pad={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Eyebrow>Round 1 resolved</Eyebrow>
            <div className="serif" style={{ fontSize: 22, color: T.ink, fontWeight: 700, marginTop: 2 }}>On to Round 2</div>
          </div>
          <Pill tone="green">+$54 this round</Pill>
        </div>
        <p style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.5, margin: '10px 0 14px' }}>You stay on this report until you press Continue — even if Morgan has already moved on.</p>
        <Btn kind="primary" size="lg" full>Continue to Round 2 →</Btn>
      </Panel>
    </div>
    <TurnLog />
  </MatchShell>
);

// ── review (FULL-BLEED) — confirm lock-in ──────────────────────────────────
const Review = () => (
  <FullBleed max={640}>
    <RouteTag route="/play/price-war/match/{id}/review" phase="decide → review" panel="review" bleed />
    <Panel pad={24}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Eyebrow>Review · Round 2 · before you lock</Eyebrow>
          <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4 }}>Final check.</h1>
        </div>
        <Btn kind="ghost" size="sm">✕</Btn>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#fdf0d8', border: '1px solid #f0d99a', margin: '16px 0' }}>
        <span style={{ flex: '0 0 auto', marginTop: 1 }}>⚠</span>
        <div style={{ fontSize: 13, color: '#7a5a12', lineHeight: 1.5 }}><b>1 note · no Sales move queued.</b> Morgan’s posted price (450¢) is at yours. Your price persists at 450¢ unless you queue a response.</div>
      </div>

      <Eyebrow>Your 3 actions</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {LOCKED.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', borderRadius: 11, background: T.paper2, border: `1px solid ${T.rule}`, borderLeft: `4px solid ${T.d[m[0]].c}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Glyph kind={T.d[m[0]].glyph} c={T.d[m[0]].c} size={16} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{m[1]}</span>
            </div>
            <span className="mono" style={{ fontSize: 12, color: T.ink3 }}>{m[2]}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${T.rule}` }}>
        <div>
          <Eyebrow>Cost this round</Eyebrow>
          <div style={{ marginTop: 3 }}><Cash v={-80} size={15} color={T.ink} /> <span style={{ color: T.ink3, fontSize: 13 }}>· cash after</span> <Cash v={474} size={15} color={T.ink} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="ghost" size="md">← Back to edit</Btn>
          <Btn kind="primary" size="md">✓ Lock in</Btn>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: T.ink3, marginTop: 12 }}>You can unlock &amp; revise from the next screen until Morgan locks or the timer expires.</div>
    </Panel>
  </FullBleed>
);

export { MatchLobby, Briefing, DecideScreen, Waiting, Report, Review };
