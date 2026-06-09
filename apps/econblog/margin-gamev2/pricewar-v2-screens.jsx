// Refined screens for the 5 non-Decide picks:
// Lobby B', Briefing A', Results A', Submitted A', Post-match C'
// Refinements per feedback:
//   Lobby B   — scenario label on cards; "results ready" visually more urgent than waiting
//   Briefing A — opponent avatar/identity; "price = a Sales action" rephrasing
//   Results A  — tooltips on event/market pills (one opened to demo)
//   Submitted A — fix copy: "price change applies when round resolves"; separate locked vs conditional
//   Post-match C — add "Turning point" callout

// ── shared sample data ────────────────────────────────────────────────
const GAMES_V2 = [
  { opp: 'Marina Okafor',  init: 'MO', elo: 1284, rec: '8-5',   round: 5, total: 8, status: 'your-turn',     timer: '18h 42m left',  yourPrice: '$4.25', oppPrice: '$3.95', profit: '+$84',  scenario: 'Coffee Shop' },
  { opp: 'Theo Park',      init: 'TP', elo: 1190, rec: '12-9',  round: 3, total: 8, status: 'waiting',       timer: '22h 10m left',  yourPrice: '$4.00', oppPrice: '$4.00', profit: '+$22',  scenario: 'Coffee Shop' },
  { opp: 'Anya Lindqvist', init: 'AL', elo: 1340, rec: '24-18', round: 6, total: 8, status: 'results-ready', timer: 'view now',      yourPrice: '$3.75', oppPrice: '$4.50', profit: '-$18',  scenario: 'Coffee Shop' },
  { opp: 'Devon Reyes',    init: 'DR', elo: 1075, rec: '3-2',   round: 1, total: 8, status: 'your-turn',     timer: '23h 04m left',  yourPrice: '$4.00', oppPrice: '—',     profit: '$0',    scenario: 'Coffee Shop' },
  { opp: 'Sana Idris',     init: 'SI', elo: 1422, rec: '52-31', round: 7, total: 8, status: 'waiting',       timer: '6h 18m left',   yourPrice: '$5.10', oppPrice: '$4.80', profit: '+$162', scenario: 'Coffee Shop' },
];

// ── Lobby B' — kanban, scenario label on every card, results-ready urgent ─
const LobbyV2 = () => {
  const cols = [
    { title: 'Results ready', kind: 'warm',   urgent: true,  items: GAMES_V2.filter(g => g.status === 'results-ready') },
    { title: 'Your turn',     kind: 'accent', urgent: false, items: GAMES_V2.filter(g => g.status === 'your-turn') },
    { title: 'Waiting',       kind: 'ghost',  urgent: false, items: GAMES_V2.filter(g => g.status === 'waiting') },
  ];
  return (
    <>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <h2>Games</h2>
          <div className="step-hint">5 active · 1 result waiting · 2 need your move</div>
        </div>
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn kind="ghost">⇄ List</Btn>
          <Btn kind="primary">+ New game</Btn>
        </div>
      </div>

      <div className="wf-grid cols-3">
        {cols.map((c, i) => (
          <div key={i} className="wf-card" style={{ background: 'var(--paper-2)' }}>
            <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h4>{c.title}</h4>
              <Chip kind={c.kind}>{c.items.length}</Chip>
            </div>
            <div className="wf-col" style={{ gap: 8, marginTop: 8 }}>
              {c.items.map((g, j) => (
                <div key={j} className={`gcard ${c.urgent ? 'urgent' : c.kind === 'accent' ? 'attn' : ''}`}>
                  <div className="scenario">{g.scenario} · R{g.round}/{g.total}</div>
                  <div className="opp" style={{ marginTop: 4 }}>
                    <div className="av">{g.init}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="name">{g.opp}</div>
                      <div className="elo">Elo {g.elo} · {g.rec}</div>
                    </div>
                  </div>
                  <div className="price-row">
                    <div className="col"><div className="lab">You</div><div className="val">{g.yourPrice}</div></div>
                    <div className="col"><div className="lab">Opp</div><div className="val">{g.oppPrice}</div></div>
                    <div className="col"><div className="lab">Profit</div><div className="val" style={{ color: g.profit.startsWith('-') ? 'var(--warm)' : 'var(--good)' }}>{g.profit}</div></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <RoundDots total={g.total} current={g.round} />
                    {c.urgent ? (
                      <Btn kind="primary">See result →</Btn>
                    ) : c.kind === 'accent' ? (
                      <Btn kind="primary">Take turn</Btn>
                    ) : (
                      <span className="elo">{g.timer}</span>
                    )}
                  </div>
                </div>
              ))}
              {c.items.length === 0 && <div className="step-hint" style={{ textAlign: 'center', padding: 14 }}>nothing here</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="step-hint" style={{ marginTop: 14 }}>Finished matches collapse into a "History" section below. Scenario label scales when we add Tech Startup, Family Farm, Developing Nation.</div>
    </>
  );
};

// ── Briefing A' — opponent avatar prominent; price-as-Sales-action copy ────
const BriefingV2 = () => (
  <>
    <div className="wf-row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">New match · Coffee Shop</div>
        <h2>You face a real rival.</h2>
      </div>
      <Btn kind="ghost">← Lobby</Btn>
    </div>

    {/* opponent identity hero */}
    <div className="wf-card accent" style={{ padding: 16 }}>
      <div className="wf-row" style={{ alignItems: 'center', gap: 16 }}>
        <div className="av lg">MO</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 28 }}>Marina Okafor</h3>
          <div className="step-hint" style={{ margin: 0 }}>Elo 1284 · 8 W / 5 L · plays conservative · avg. price $4.10</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Chip kind="ghost">last seen 2h ago</Chip>
        </div>
      </div>
    </div>

    <div className="wf-card" style={{ background: 'var(--paper-2)' }}>
      <div className="eyebrow">The scene</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 17, lineHeight: 1.45, marginTop: 6 }}>
        You just opened a coffee shop. Marina opened one across the street. Same block, same foot traffic, same customers walking by every day. You both pay a base cost per cup. Everything else is up to you. <b>The shop with the most profit after 8 days wins.</b>
      </p>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Objective</div>
        <h4>Highest profit, 8 rounds</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Cumulative net profit decides the match.</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Each turn</div>
        <h4>Pick 3 actions</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>From any of 6 domains. Changing price is one possible <DomBadge d="Sales" /> action.</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Resolution</div>
        <h4>Simultaneous</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Both submit, then the engine resolves the round.</p>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">You start with</div>
        <KV k="Cash" v="$500" />
        <KV k="Staff" v="2 · wage $14/hr" />
        <KV k="Supplier" v="Tier 2 (mid)" />
        <KV k="Equipment" v="Level 1 · basic" />
        <KV k="Price" v="$4.00 / cup (default)" />
        <KV k="Base foot traffic" v="220 / day" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">What's public · what's hidden</div>
        <div style={{ marginTop: 4 }}>
          <Chip kind="accent">public</Chip>
          <span style={{ fontSize: 14, marginLeft: 8 }}>both prices, customer counts, review scores, foot traffic, market events, "public" actions (flash sale, sponsor, loyalty launch, price-match, rebrand).</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Chip>private</Chip>
          <span style={{ fontSize: 14, marginLeft: 8 }}>cash, costs, debt, morale, supplier tier, R&amp;D, inventory, deployment mode.</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Chip kind="ghost">inferable</Chip>
          <span style={{ fontSize: 14, marginLeft: 8 }}>everything else — read the public signals to figure it out.</span>
        </div>
      </div>
    </div>

    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
      <Chip kind="ghost">Turn timer: 24h per round</Chip>
      <Btn kind="primary" className="big">Open round 1 →</Btn>
    </div>
  </>
);

// ── Results A' — tooltips on event/market pills (one opened to demonstrate) ─
const PUBLIC_LAST = {
  you:  { price: '$4.25', cust: 142, review: '4.2 ★' },
  opp:  { price: '$3.95', cust: 168, review: '4.0 ★', name: 'Marina', actions: ['Flash sale'] },
  traffic: 318,
  trafficDelta: '+24 vs avg',
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

const ResultsV2 = () => (
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

      {/* Dedicated space for stochastic / market events that occurred this round.
          Lives inside the public card so the "what both of you see" frame
          contains: matchup cards on top, then everything random the market threw. */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1.5px dashed var(--ink-3)' }}>
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="eyebrow">Events this round · stochastic</div>
          <span className="step-hint" style={{ fontSize: 12 }}>random events the market rolled — hover any for the mechanic</span>
        </div>

        {/* Market-wide signals (foot traffic baseline + weather/supply rolls) */}
        <div className="wf-row wrap" style={{ marginTop: 10, gap: 10, alignItems: 'flex-start', position: 'relative', minHeight: 100 }}>
          <Tooltip for={<Chip>Foot traffic {PUBLIC_LAST.traffic} · {PUBLIC_LAST.trafficDelta}</Chip>}
            title="Foot traffic"
            body="Total potential customers in the market this round, before they're split between shops. Higher is better for everyone — but who captures the extra depends on price, quality and capacity."
            arrow="hovered: explains the mechanic, not just the word"
            alwaysOpen
          />
          <Tooltip for={<Chip kind="ghost">☀ Sunny weekend +12% traffic</Chip>}
            title="Market event · sunny weekend"
            body="A weather event lifted available customers this round. Both shops benefited, but the one with better price, capacity and reputation captured more of the extra demand."
          />
          <Tooltip for={<Chip kind="ghost">⚑ Bean supply tight +5% cost</Chip>}
            title="Market event · supply tightness"
            body="Input costs rose for everyone using standard suppliers. Higher supplier tier or inventory buffers reduce the impact."
          />
          <Tooltip for={<Chip kind="warm">{PUBLIC_LAST.opp.name}: Flash sale</Chip>}
            title="Opponent action · flash sale"
            body="A one-round 20% discount visible to all customers. Marina trades margin for casual customers this round."
          />
        </div>

        {/* Forward-looking slot — events that might fire next round, so the
            space is always populated even on quiet rounds. */}
        <div className="wf-row wrap" style={{ marginTop: 12, gap: 8, alignItems: 'center', paddingTop: 10, borderTop: '1px dotted var(--ink-3)' }}>
          <span className="step-hint" style={{ fontSize: 12, minWidth: 'fit-content' }}>Could occur next round:</span>
          <Chip kind="ghost">⛅ Weather shift · 35%</Chip>
          <Chip kind="ghost">⚑ Supplier price reset · 20%</Chip>
          <Chip kind="ghost">★ Reviewer visit · 15%</Chip>
          <span className="step-hint" style={{ fontSize: 12, opacity: 0.7 }}>probabilities are rough — exact rolls happen at resolve</span>
        </div>
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

// ── Submitted A' — copy fixes, locked vs conditional separation ──────────
const SubmittedV2 = () => (
  <>
    <div className="wf-card good">
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--good)' }}>✓ Submitted</div>
          <h2>Round 5 locked in</h2>
          <div className="step-hint" style={{ margin: '4px 0 0' }}>Your actions are committed. They apply when the round resolves.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num">14:08:22</div>
          <div className="stat-label">until timer expires</div>
        </div>
      </div>

      <div className="wf-row" style={{ marginTop: 14, gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Opponent</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="av">MO</div>
            <div><div className="name">Marina Okafor</div><div className="elo">has not submitted yet</div></div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="step-hint" style={{ margin: 0 }}>Round resolves when she submits, or when timer hits 0.</div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--paper-2)', overflow: 'hidden', marginTop: 6, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, var(--accent) 0 8px, var(--accent-soft) 8px 16px)', width: '60%' }} />
          </div>
        </div>
        <Btn kind="ghost">🔔 Notify me</Btn>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Will definitely apply</div>
        {[
          { dom: 'Sales',     a: 'Change price to $4.00', sub: 'Your posted price changes to $4.00 when the round resolves. Public.' },
          { dom: 'HR',        a: 'Train staff (service)', sub: 'Costs $25 now; staff skill improves in 2 rounds. Private.' },
          { dom: 'Marketing', a: 'Set ad budget · $40',    sub: 'Spent on ads this round; affects foot traffic share. Private.' },
        ].map((s, i) => (
          <div key={i} className="wf-row" style={{ alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 2 ? '1px dashed var(--ink-3)' : 'none', gap: 10 }}>
            <DomBadge d={s.dom} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{s.a}</div>
              <div className="step-hint" style={{ margin: 0 }}>{s.sub}</div>
            </div>
            <Chip kind="good">✓</Chip>
          </div>
        ))}
      </div>

      <div className="wf-col" style={{ gap: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">Conditional · depends on Marina</div>
          <div className="wf-row" style={{ alignItems: 'flex-start', padding: '8px 0', gap: 10 }}>
            <DomBadge d="Sales" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>Price-match guarantee (active)</div>
              <div className="step-hint" style={{ margin: 0 }}>Activates only if Marina's posted price ends below yours. Triggers automatically when it does.</div>
            </div>
            <Chip kind="ghost">if-then</Chip>
          </div>
          <div className="step-hint" style={{ marginTop: 4 }}>Conditional moves don't always fire. They're tools that wait for a trigger.</div>
        </div>

        <div className="wf-card">
          <div className="eyebrow">Your other games · check on them</div>
          {[
            { o: 'Anya', s: 'results-ready', t: 'Round 6 resolved' },
            { o: 'Sana', s: 'your-turn',     t: '6h 18m left' },
          ].map((g, i) => (
            <div key={i} className="wf-row" style={{ padding: '8px 0', alignItems: 'center', borderBottom: i === 0 ? '1px dashed var(--ink-3)' : 'none', gap: 10 }}>
              <div className="av" style={{ width: 32, height: 32, fontSize: 14 }}>{g.o[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{g.o}</div>
                <div className="step-hint" style={{ margin: 0 }}>{g.t}</div>
              </div>
              <Btn kind={g.s === 'your-turn' ? 'primary' : ''}>{g.s === 'your-turn' ? 'Take turn' : 'See result'}</Btn>
            </div>
          ))}
        </div>
        <div className="wf-card tinted">
          <div className="eyebrow">While you wait</div>
          <div className="wf-row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <Chip kind="ghost">📖 Lesson L14 · Prisoner's dilemma</Chip>
            <Chip kind="ghost">↩ Back to lobby</Chip>
          </div>
        </div>
      </div>
    </div>
  </>
);

// ── Post-match C' — trophy hero + Turning Point + concept sidebar ────────
const MATCH_V2 = {
  totalYou: '+$1,420',
  totalOpp: '+$1,336',
  eloDelta: '+18',
  eloFrom: 1248, eloTo: 1266,
  prices: { you: [4.00, 4.00, 4.25, 4.25, 4.00, 4.00, 4.10, 4.25], opp: [4.00, 4.20, 4.20, 4.10, 3.95, 3.95, 4.30, 4.50] },
};
const Chart = ({ youSeries, oppSeries, yLab, w = 600, h = 200, fmt = v => v }) => {
  const all = [...youSeries, ...oppSeries];
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 1;
  const yLo = min - pad, yHi = max + pad;
  const x = i => (i / (youSeries.length - 1)) * (w - 60) + 36;
  const y = v => h - 28 - ((v - yLo) / (yHi - yLo)) * (h - 60);
  const path = (s) => s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={36} x2={w - 24} y1={h - 28 - (i / 3) * (h - 60)} y2={h - 28 - (i / 3) * (h - 60)} stroke="#7c7770" strokeWidth=".5" strokeDasharray="3 4" />
      ))}
      {youSeries.map((_, i) => (
        <text key={i} x={x(i)} y={h - 10} fontFamily="Patrick Hand" fontSize="12" fill="#7c7770" textAnchor="middle">R{i + 1}</text>
      ))}
      <text x={8} y={20} fontFamily="Patrick Hand" fontSize="11" fill="#7c7770">{fmt(yHi.toFixed(2))}</text>
      <text x={8} y={h - 30} fontFamily="Patrick Hand" fontSize="11" fill="#7c7770">{fmt(yLo.toFixed(2))}</text>
      {/* turning point band — round 5 */}
      <rect x={x(4) - 22} y={20} width={44} height={h - 50} fill="#1f59c2" opacity=".08" />
      <text x={x(4)} y={16} fontFamily="Caveat" fontSize="13" fill="#1f59c2" textAnchor="middle">★ turning point</text>
      <path d={path(oppSeries)} fill="none" stroke="#c84a2c" strokeWidth="2" />
      <path d={path(youSeries)} fill="none" stroke="#1f59c2" strokeWidth="2" />
      {youSeries.map((v, i) => <circle key={`y${i}`} cx={x(i)} cy={y(v)} r="3.5" fill="#1f59c2" />)}
      {oppSeries.map((v, i) => <circle key={`o${i}`} cx={x(i)} cy={y(v)} r="3.5" fill="#c84a2c" />)}
    </svg>
  );
};

const PostmatchV2 = () => (
  <div className="wf-row" style={{ alignItems: 'flex-start' }}>
    <div className="wf-col" style={{ flex: 1.4 }}>
      <div className="wf-card" style={{ background: 'linear-gradient(180deg, rgba(58,125,68,.10), transparent)', padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 28, color: 'var(--good)' }}>🏆</div>
        <h1 style={{ fontSize: 60, lineHeight: 1 }}>Victory</h1>
        <div className="step-hint" style={{ fontSize: 16 }}>You won the price war by <b>$84</b>.</div>
        <div className="wf-row" style={{ justifyContent: 'center', gap: 26, marginTop: 18, flexWrap: 'wrap' }}>
          <div><div className="stat-num">{MATCH_V2.totalYou}</div><div className="stat-label">your profit</div></div>
          <div><div className="stat-num" style={{ color: 'var(--warm)' }}>{MATCH_V2.totalOpp}</div><div className="stat-label">Marina</div></div>
          <div><div className="stat-num" style={{ color: 'var(--good)' }}>{MATCH_V2.eloDelta}</div><div className="stat-label">Elo gained</div></div>
        </div>
        <div className="wf-row" style={{ justifyContent: 'center', gap: 10, marginTop: 18 }}>
          <Btn kind="primary" className="big">Rematch</Btn>
          <Btn className="big">New opponent</Btn>
        </div>
      </div>

      {/* TURNING POINT — new */}
      <div className="wf-card accent">
        <div className="eyebrow" style={{ color: 'var(--accent)' }}>★ Turning point</div>
        <h3>Round 5</h3>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, lineHeight: 1.5 }}>
          Marina dropped to $3.95 to chase casuals. You held quality and kept your regulars.
          Her volume rose, but her reviews started to slip — and you compounded a training
          investment from R3 that paid back through R6-R8. Once your regulars share crossed 50%,
          her price cuts couldn't catch up.
        </p>
      </div>

      <div className="wf-card">
        <div className="eyebrow">Prices · 8 rounds</div>
        <Chart youSeries={MATCH_V2.prices.you} oppSeries={MATCH_V2.prices.opp} yLab="price" h={200} fmt={v => `$${v}`} />
        <div className="wf-row" style={{ gap: 10, marginTop: 4 }}>
          <Chip kind="accent">You</Chip>
          <Chip kind="warm">Marina</Chip>
        </div>
      </div>
    </div>

    <div className="wf-col" style={{ flex: 1 }}>
      <div className="wf-card good">
        <div className="eyebrow" style={{ color: 'var(--good)' }}>★ Best move</div>
        <h4>R3 · Train staff</h4>
        <div className="step-hint">+$160 across R5-R8 from the regulars you kept.</div>
      </div>
      <div className="wf-card warm">
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>⚑ Worst move</div>
        <h4>R7 · Scout (too late)</h4>
        <div className="step-hint">$25 spent; you couldn't react with only one round left.</div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Economics in play · L = lesson</div>
        <div className="wf-col" style={{ gap: 8, marginTop: 4 }}>
          {[
            { code: 'L10',  name: 'Price elasticity of demand' },
            { code: 'L14',  name: 'Prisoner\'s dilemma' },
            { code: 'L21',  name: 'Signaling' },
            { code: 'L108', name: 'Labor supply curves' },
          ].map(c => (
            <div key={c.code} className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', border: '1.5px dashed var(--ink-3)', borderRadius: 8 }}>
              <div>
                <div className="step-hint" style={{ margin: 0 }}>{c.code}</div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{c.name}</div>
              </div>
              <Btn kind="ghost">Open →</Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { LobbyV2, BriefingV2, ResultsV2, SubmittedV2, PostmatchV2 });
