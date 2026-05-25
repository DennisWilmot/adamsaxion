// Last-round results review (State B). 3 directions.

const PUBLIC_LAST = {
  round: 4,
  you:  { price: '$4.25', cust: 142, review: '4.2 ★' },
  opp:  { price: '$3.95', cust: 168, review: '4.0 ★', name: 'Marina', actions: ['Flash sale'] },
  traffic: 318,
  trafficDelta: '+24 vs avg',
  events: ['Sunny weekend +12% traffic', 'Bean supply tight +5% cost'],
};
const PRIVATE_LAST = {
  revenue: '$603.50',
  exp: { inputs: '-$184', wages: '-$112', mktg: '-$40', training: '-$25', maint: '-$12', interest: '-$0' },
  net: '+$230.50',
  cum: '+$642',
  cash: '$748',
  staff: '2', morale: 'Stable', skill: 'Good',
  segs: { reg: '38%', cas: '47%', new: '15%' },
  rep: 'Good',
  outcomes: ['Training paid off · skill ▲', 'Worker stayed (wage match)'],
};

// ── A: Two-column public/private, dense like a P&L ────────────────────
const ResultsA = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 4 of 8 · resolved</div>
        <h2>Results</h2>
      </div>
      <div className="wf-row" style={{ gap: 6 }}>
        <Chip kind="ghost">← Round 3</Chip>
        <Chip kind="accent">Round 4</Chip>
        <Chip kind="ghost">Plan round 5 →</Chip>
      </div>
    </div>

    <div className="wf-card tinted">
      <div className="eyebrow">Public · what both of you see</div>
      <div className="vs" style={{ marginTop: 6 }}>
        <div className="side you">
          <div className="stat-label">You</div>
          <div className="wf-row" style={{ gap: 14, marginTop: 6, alignItems: 'baseline' }}>
            <div><div className="stat-num">{PUBLIC_LAST.you.price}</div><div className="stat-label">price</div></div>
            <div><div className="stat-num">{PUBLIC_LAST.you.cust}</div><div className="stat-label">customers</div></div>
            <div><div className="stat-num">{PUBLIC_LAST.you.review}</div><div className="stat-label">review</div></div>
          </div>
        </div>
        <div className="vs-divider">vs</div>
        <div className="side">
          <div className="stat-label">{PUBLIC_LAST.opp.name}</div>
          <div className="wf-row" style={{ gap: 14, marginTop: 6, alignItems: 'baseline' }}>
            <div><div className="stat-num">{PUBLIC_LAST.opp.price}</div><div className="stat-label">price</div></div>
            <div><div className="stat-num">{PUBLIC_LAST.opp.cust}</div><div className="stat-label">customers</div></div>
            <div><div className="stat-num">{PUBLIC_LAST.opp.review}</div><div className="stat-label">review</div></div>
          </div>
        </div>
      </div>
      <div className="wf-row" style={{ marginTop: 10, gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip>Foot traffic {PUBLIC_LAST.traffic} <span style={{ color: 'var(--good)' }}>· {PUBLIC_LAST.trafficDelta}</span></Chip>
        {PUBLIC_LAST.events.map((e, i) => <Chip key={i} kind="ghost">⚑ {e}</Chip>)}
        {PUBLIC_LAST.opp.actions.map((a, i) => <Chip key={i} kind="warm">{PUBLIC_LAST.opp.name}: {a}</Chip>)}
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Your P&amp;L · round 4</div>
        <KV k="Revenue" v={PRIVATE_LAST.revenue} />
        <KV k="Inputs" v={PRIVATE_LAST.exp.inputs} />
        <KV k="Wages" v={PRIVATE_LAST.exp.wages} />
        <KV k="Marketing" v={PRIVATE_LAST.exp.mktg} />
        <KV k="Training" v={PRIVATE_LAST.exp.training} />
        <KV k="Maint." v={PRIVATE_LAST.exp.maint} />
        <KV k="Interest" v={PRIVATE_LAST.exp.interest} />
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0 0' }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: 22, fontWeight: 700 }}>Net profit</span>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: 30, fontWeight: 700, color: 'var(--good)' }}>{PRIVATE_LAST.net}</span>
        </div>
        <div className="wf-row" style={{ justifyContent: 'space-between' }}>
          <span className="step-hint">cumulative</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, color: 'var(--good)' }}>{PRIVATE_LAST.cum}</span>
        </div>
      </div>

      <div className="wf-col" style={{ gap: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">Your state</div>
          <KV k="Cash" v={PRIVATE_LAST.cash} />
          <KV k="Staff" v={`${PRIVATE_LAST.staff} · morale ${PRIVATE_LAST.morale} · skill ${PRIVATE_LAST.skill}`} />
          <KV k="Reputation" v={PRIVATE_LAST.rep} />
          <KV k="Segments" v={`${PRIVATE_LAST.segs.reg} reg · ${PRIVATE_LAST.segs.cas} cas · ${PRIVATE_LAST.segs.new} new`} />
        </div>
        <div className="wf-card">
          <div className="eyebrow">Action outcomes</div>
          {PRIVATE_LAST.outcomes.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
              <span className="chip good" style={{ padding: '0 6px', fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 14 }}>{o}</span>
            </div>
          ))}
        </div>
        <div className="inf">
          <b>What you might infer</b>
          Marina's customers rose despite a flash sale ending. Foot traffic was high — possibly her marketing, possibly weather. Watch her review score: it didn't move.
        </div>
      </div>
    </div>

    <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
      <Btn kind="ghost">Replay round 4 ▷</Btn>
      <Btn kind="primary" className="big">Plan round 5 →</Btn>
    </div>
  </>
);

// ── B: Narrative-first, charts top, copy second ───────────────────────
const ResultsB = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 4 · the report</div>
        <h2>You undercut, they cut harder.</h2>
        <p className="step-hint" style={{ maxWidth: 540 }}>Auto-generated narrative; numbers below if you want to dig in.</p>
      </div>
      <RoundDots total={8} current={5} />
    </div>

    <div className="wf-card accent">
      <div className="eyebrow" style={{ color: 'var(--accent)' }}>The story so far</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 16, lineHeight: 1.5 }}>
        You dropped to <b>$4.25</b> hoping to peel casuals off Marina. She ran a <b>flash sale</b> the same round
        and ended at <b>$3.95</b>. She gained 26 customers; you gained 8. But your margins held — you still netted
        <span style={{ color: 'var(--good)' }}> +$230</span> to her likely ~$140.
      </p>
      <div className="annot-row">If she keeps cutting, you'll win on margin even at lower volume.</div>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Price trend</div>
        <Spark data={[4, 4, 4.25, 4.25, 4.25]} />
        <div className="step-hint">You: $4.00 → $4.25</div>
        <Spark data={[4, 4.2, 4.2, 4.1, 3.95]} neg />
        <div className="step-hint">Marina: $4.00 → $3.95</div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Customers</div>
        <Spark data={[110, 120, 130, 134, 142]} />
        <div className="step-hint">You: 110 → 142</div>
        <Spark data={[110, 122, 138, 142, 168]} />
        <div className="step-hint">Marina: 110 → 168</div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Cumulative profit</div>
        <Spark data={[80, 180, 320, 411, 642]} />
        <div className="step-hint">You: +$642</div>
        <Spark data={[80, 160, 250, 320, 460]} />
        <div className="step-hint">Marina: est. ~+$460</div>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Your P&amp;L · this round</div>
        <KV k="Revenue" v={PRIVATE_LAST.revenue} />
        <KV k="Total expenses" v="-$373" />
        <KV k="Net" v={<span style={{ color: 'var(--good)' }}>{PRIVATE_LAST.net}</span>} />
        <Btn kind="ghost">Show breakdown ▾</Btn>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Signals to read</div>
        {[
          { sig: 'Foot traffic +24 above average', read: 'Weather event + likely opp. marketing' },
          { sig: 'Marina\'s review steady at 4.0 ★', read: 'Sale didn\'t hurt her perceived quality' },
          { sig: 'Your regulars ▲ from 32% → 38%', read: 'Training is sticking; protect this segment' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: i < 2 ? '1px dashed var(--ink-3)' : 'none' }}>
            <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{s.sig}</div>
            <div className="step-hint" style={{ margin: 0 }}>→ {s.read}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="wf-row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
      <Btn kind="primary" className="big">Plan round 5 →</Btn>
    </div>
  </>
);

// ── C: Side-by-side battle card; collapsed P&L ────────────────────────
const ResultsC = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <h2>Round 4 · resolved</h2>
      <RoundDots total={8} current={5} />
    </div>

    <div className="wf-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1.5px dashed var(--ink-3)' }}>
        <div style={{ padding: 16, background: 'rgba(31,89,194,.06)', borderRight: '1.5px dashed var(--ink-3)' }}>
          <div className="eyebrow">You</div>
          <div className="stat-num" style={{ fontSize: 44 }}>$4.25</div>
          <div className="step-hint">price · unchanged from R3</div>
          <div className="wf-row" style={{ gap: 14, marginTop: 8 }}>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26 }}>142</div><div className="stat-label">customers</div></div>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26, color: 'var(--good)' }}>+$230</div><div className="stat-label">profit</div></div>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26 }}>4.2 ★</div><div className="stat-label">review</div></div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="eyebrow">Marina</div>
          <div className="stat-num" style={{ fontSize: 44, color: 'var(--warm)' }}>$3.95</div>
          <div className="step-hint">▼ from $4.10 · ran flash sale</div>
          <div className="wf-row" style={{ gap: 14, marginTop: 8 }}>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26 }}>168</div><div className="stat-label">customers</div></div>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26, color: 'var(--ink-3)' }}>?</div><div className="stat-label">profit (hidden)</div></div>
            <div><div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26 }}>4.0 ★</div><div className="stat-label">review</div></div>
          </div>
        </div>
      </div>
      <div style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="step-hint" style={{ margin: 0 }}>street:</span>
        <Chip>Foot traffic 318 · +24</Chip>
        <Chip kind="ghost">☀ Sunny weekend</Chip>
        <Chip kind="ghost">⚑ Bean supply tight</Chip>
      </div>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card good">
        <div className="eyebrow" style={{ color: 'var(--good)' }}>Going well</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
          <li>Margins held at $1.62/cup</li>
          <li>Training paid off · staff skill ▲</li>
          <li>Regulars share ↑ 6pts</li>
        </ul>
      </div>
      <div className="wf-card warm">
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>Pressure</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
          <li>Lost ~26 customers to Marina</li>
          <li>Casuals likely to chase price</li>
          <li>Bean costs rising</li>
        </ul>
      </div>
      <div className="wf-card">
        <div className="eyebrow">To consider</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
          <li>Match price? Or hold and protect rep?</li>
          <li>Scout her supplier tier ($25)</li>
          <li>Loyalty program now buys ahead</li>
        </ul>
      </div>
    </div>

    <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
      <Btn kind="ghost">Full P&amp;L ▾</Btn>
      <Btn kind="primary" className="big">Plan round 5 →</Btn>
    </div>
  </>
);

window.ResultsOptions = [
  { tag: 'A', title: 'P&L report (Bloomberg-y)',  why: 'Public bar on top, your numbers in two columns below. Dense.',     Body: ResultsA },
  { tag: 'B', title: 'Narrative + sparklines',     why: 'Trusted-advisor opening line, mini-charts, signals to read.',      Body: ResultsB },
  { tag: 'C', title: 'Battle card + 3 takeaways',  why: 'Big YOU vs THEM headline, then going-well / pressure / consider.', Body: ResultsC },
];
