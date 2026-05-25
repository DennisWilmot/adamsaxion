// Price War v3 — refined Decide, Submitted, Post-match.
// Decide v3: reuses the v2 master/detail body but adds the "Scout = 1 Finance slot" callout.
// Submitted v3: adds "Unlock & revise" affordance (only while opponent hasn't locked + timer alive).
// Post-match v3: adds customer-count trajectory chart alongside price chart.

// ── Decide v3 — same body as v2, plus Scout-slot clarification overlay ─────
const DecideV3 = () => (
  <div style={{ position: 'relative' }}>
    <DecideV2 />
    {/* v3 callout: makes it clear Scout consumes 1 of your 3 Finance slots. */}
    <div style={{ position: 'absolute', top: 470, right: 6, width: 240, transform: 'rotate(-1.2deg)' }}>
      <div className="wf-card warm" style={{ padding: 10, background: '#fff7ed', borderColor: 'var(--warm)' }}>
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>Scout · clarification</div>
        <div style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, lineHeight: 1.4 }}>
          Scout is a <DomBadge d="Finance" /> action — tapping it here still <b>uses 1 of your 3 slots</b>, not free.
        </div>
        <div className="step-hint" style={{ marginTop: 6, fontSize: 11 }}>v3 fix: chip will show "+1 slot · Finance" on the button itself.</div>
      </div>
    </div>
  </div>
);

// ── Submitted v3 — adds Unlock & revise ────────────────────────────────────
const SubmittedV3 = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 5 · submitted</div>
        <h2>Locked in. Waiting on Marina.</h2>
      </div>
      <Chip kind="warm">⏱ 14h 22m before timer expires</Chip>
    </div>

    <div className="wf-grid cols-2">
      <div className="wf-card">
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="eyebrow">Your plan</div>
          <span className="step-hint" style={{ margin: 0, fontSize: 12 }}>3 of 3 slots used</span>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="eyebrow" style={{ color: 'var(--ink)' }}>Definite — will fire</div>
          <div className="wf-card" style={{ padding: 10, marginTop: 6, background: 'var(--paper-2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <DomBadge d="HR" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>Train staff</div>
                <div className="step-hint" style={{ margin: 0 }}>-$25 · effect in 2 rounds · private</div>
              </div>
              <Chip kind="ghost">●</Chip>
            </div>
          </div>
          <div className="wf-card" style={{ padding: 10, marginTop: 6, background: 'var(--paper-2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <DomBadge d="Marketing" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>Local ad</div>
                <div className="step-hint" style={{ margin: 0 }}>-$30 · this round · public</div>
              </div>
              <Chip kind="ghost">●</Chip>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--ink)' }}>Conditional — fires only if…</div>
          <div className="wf-card" style={{ padding: 10, marginTop: 6, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <DomBadge d="Sales" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>Price-match guarantee · ARMED</div>
                <div className="step-hint" style={{ margin: 0 }}>fires only if Marina's posted price &lt; $4.25</div>
              </div>
              <Chip kind="warm">if-then</Chip>
            </div>
          </div>
        </div>

        {/* Passive state — NOT a slot */}
        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>Persists automatically · not a move</div>
          <div className="wf-card" style={{ padding: 10, marginTop: 6, background: 'transparent', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)' }}>Current price (no Sales action queued)</span>
              <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>$4.25</span>
            </div>
          </div>
        </div>

        {/* v3: Unlock & revise — explicit affordance */}
        <div className="wf-card warm" style={{ padding: 12, marginTop: 12, background: '#fff7ed', borderColor: 'var(--warm)' }}>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>Changed your mind?</div>
              <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>Available while Marina hasn't locked + timer alive. Once she submits, you're committed.</div>
            </div>
            <Btn kind="ghost" style={{ borderColor: 'var(--warm)', color: 'var(--warm)' }}>↺ Unlock &amp; revise</Btn>
          </div>
          <div className="step-hint" style={{ margin: '8px 0 0', fontSize: 11, fontStyle: 'italic' }}>Warning shown on tap: "Marina may submit while you're revising. You'd lock again before her timer expires."</div>
        </div>
      </div>

      <div className="wf-col" style={{ gap: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">Match status</div>
          <KV k="Round" v="5 of 8" />
          <KV k="You submitted" v="14m ago" />
          <KV k="Marina" v="not yet" />
          <RoundDots total={8} current={5} />
        </div>
        <div className="wf-card">
          <div className="eyebrow">Your other games · check on them</div>
          <div className="wf-col" style={{ gap: 6, marginTop: 6 }}>
            <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontFamily: "'Kalam',cursive" }}>vs Anya · results in</span><Chip kind="warm">ready</Chip>
            </div>
            <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontFamily: "'Kalam',cursive" }}>vs Devon · R1</span><Chip kind="accent">your turn</Chip>
            </div>
            <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontFamily: "'Kalam',cursive" }}>vs Sana · waiting</span><span className="step-hint" style={{ margin: 0 }}>6h left</span>
            </div>
          </div>
        </div>
        <Btn kind="ghost" style={{ borderStyle: 'dashed' }}>← Back to lobby</Btn>
      </div>
    </div>
  </>
);

// ── Post-match v3 — customer-count trajectory added ─────────────────────────
const ROUNDS = [1,2,3,4,5,6,7,8];
const YOU_PRICE = [4.00,4.00,4.25,4.25,4.00,4.25,4.40,4.40];
const OPP_PRICE = [4.10,4.10,4.10,3.95,3.95,3.95,4.05,4.10];
const YOU_CUST  = [128, 134, 144, 142, 156, 152, 148, 155];
const OPP_CUST  = [140, 138, 132, 168, 154, 145, 138, 134];

const TrajChart = ({ title, yTicks, you, opp, format = (v) => v, pivot = 4, height = 130 }) => {
  const W = 360, H = height, pad = 32;
  const all = [...you, ...opp];
  const min = Math.min(...all), max = Math.max(...all);
  const span = max - min || 1;
  const x = (i) => pad + (i * (W - pad - 12) / (you.length - 1));
  const y = (v) => H - pad + 4 - ((v - min) / span) * (H - pad - 16);
  const path = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        {/* pivot column highlight */}
        <rect x={x(pivot - 1) - 14} y={6} width={28} height={H - pad + 6} fill="#fef3c7" />
        {/* axis baseline */}
        <line x1={pad - 4} y1={H - pad + 4} x2={W - 6} y2={H - pad + 4} stroke="#bcb5a8" strokeWidth="1.2" />
        <path d={path(opp)} stroke="#c46b3f" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        <path d={path(you)} stroke="#1f59c2" strokeWidth="2.4" fill="none" />
        {/* dots */}
        {you.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#1f59c2" />)}
        {opp.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#c46b3f" />)}
        {/* y ticks */}
        {yTicks.map((t, i) => (
          <text key={i} x={4} y={y(t) + 4} fontSize="10" fill="#7d7567" fontFamily="Patrick Hand">{format(t)}</text>
        ))}
        {/* x labels */}
        {ROUNDS.map((r, i) => (
          <text key={r} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#7d7567" fontFamily="Patrick Hand">R{r}</text>
        ))}
        {/* pivot label */}
        <text x={x(pivot - 1)} y={20} textAnchor="middle" fontSize="11" fill="#c46b3f" fontFamily="Caveat" fontWeight="700">turning point</text>
      </svg>
    </div>
  );
};

const PostmatchV3 = () => (
  <>
    <div className="wf-card" style={{ background: '#fff8ec', borderColor: 'var(--accent)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Match complete · 8 / 8</div>
          <h2 style={{ marginTop: 4 }}>You won · Coffee Shop vs Marina</h2>
          <div className="step-hint" style={{ margin: '4px 0 0' }}>Cumulative profit: <b>$2,148</b> vs Marina <b>$1,772</b> · margin <b>+$376</b></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num" style={{ fontSize: 32, color: 'var(--good)' }}>+18 Elo</div>
          <div className="stat-label">now 1266 · best 1284</div>
        </div>
      </div>
    </div>

    <div className="wf-card accent" style={{ marginTop: 12 }}>
      <div className="eyebrow">Turning point · round 4</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 17, lineHeight: 1.45, marginTop: 6 }}>
        Marina dropped to <b>$3.95</b> to chase casuals after the sunny-weekend traffic bump. You held quality, held price, and kept your regulars. Her gains were a one-round spike; your retention compounded.
      </p>
    </div>

    {/* v3: customer trajectory added next to price trajectory */}
    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <TrajChart title="Price trajectory · 8 rounds" yTicks={[3.75, 4.10, 4.40]} you={YOU_PRICE} opp={OPP_PRICE} format={(v) => `$${v.toFixed(2)}`} />
        <div className="wf-row" style={{ gap: 14, marginTop: 4, fontSize: 12 }}>
          <span><span style={{ display: 'inline-block', width: 14, height: 3, background: '#1f59c2', verticalAlign: 'middle' }} /> You</span>
          <span><span style={{ display: 'inline-block', width: 14, borderTop: '2px dashed #c46b3f', verticalAlign: 'middle' }} /> Marina</span>
        </div>
      </div>
      <div className="wf-card">
        <TrajChart title="Customer count · 8 rounds" yTicks={[130, 150, 170]} you={YOU_CUST} opp={OPP_CUST} />
        <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 12 }}>R4 spike: her flash sale + her price cut pulled her crowd briefly. You crossed her in R5 and never gave it back.</div>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card good">
        <div className="eyebrow">Best move</div>
        <h4>R5 · Held price, ran loyalty</h4>
        <div className="step-hint" style={{ margin: 0 }}>Impact: ~+$184 retained margin. Marina's casuals leaked back to you.</div>
      </div>
      <div className="wf-card" style={{ background: '#fef2f2', borderColor: '#c46b3f' }}>
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>Worst move</div>
        <h4>R2 · Hired without training</h4>
        <div className="step-hint" style={{ margin: 0 }}>Impact: ~-$60. New hire dragged service quality for 2 rounds.</div>
      </div>
    </div>

    {/* Lesson CTA — the bridge from match to course. This is THE moment players
        are most curious about why what happened, happened. Pick the one lesson
        the engine identifies as most relevant (here: elasticity from the R4 turning point). */}
    <div className="wf-card accent" style={{ marginTop: 14, padding: 18, background: 'linear-gradient(180deg,#eaf2ff 0%,#f6efff 100%)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Lesson recommended for this match</div>
          <h3 style={{ marginTop: 2, fontSize: 28 }}>L23 · Price elasticity in head-to-head markets</h3>
          <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, lineHeight: 1.45, marginTop: 6 }}>
            Your turning point in <b>R4</b> was Marina's price cut. The math behind why your <i>hold</i> beat her <i>cut</i> is exactly what this lesson covers — when extra volume beats lost margin, and when it doesn't.
          </p>
          <div className="wf-row" style={{ gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip kind="ghost">14 min · interactive</Chip>
            <Chip kind="ghost">includes a worked example using this match's data</Chip>
          </div>
        </div>
        <Btn kind="primary" className="big" style={{ padding: '14px 22px', fontSize: 17 }}>Start lesson →</Btn>
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--ink-3)' }}>
        <div className="eyebrow" style={{ fontSize: 11 }}>Also worth reviewing — pulled from this match</div>
        <div className="wf-row wrap" style={{ gap: 8, marginTop: 6 }}>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L31 · Customer retention</a>
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L45 · Expected value (events you saw this match)</a>
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L17 · Hiring + training sequencing</a>
        </div>
      </div>
    </div>

    {/* Secondary actions — the match-related CTAs move down, lesson is the headline */}
    <div className="wf-row" style={{ marginTop: 14, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
      <Btn kind="ghost">← Lobby</Btn>
      <div className="wf-row" style={{ gap: 8 }}>
        <Btn kind="ghost">Replay match ▷</Btn>
        <Btn kind="ghost">Rematch Marina</Btn>
        <Btn kind="ghost">Find new opponent</Btn>
      </div>
    </div>
    <div className="step-hint" style={{ marginTop: 6, textAlign: 'center', fontStyle: 'italic' }}>
      Match CTAs are demoted to ghost buttons — the lesson is the primary path. Skip to lobby if you must.
    </div>
  </>
);

Object.assign(window, { DecideV3, SubmittedV3, PostmatchV3 });
