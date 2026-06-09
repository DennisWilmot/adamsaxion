// Price War v3 — refined versions of the 6 existing wireframes.
// Folds in the design-review feedback:
//   Lobby v3      — player's own Elo in the header; first-time-user empty state hinted
//   Briefing v3   — opponent playstyle + avg price HIDDEN (earned through play);
//                   "last seen 2h ago" softened to "active today / this week"
//   Results v3    — collapsible "What you might infer" (opt-out after first matches);
//                   forward-looking events use WORDS not exact %s
//   Decide v3     — Scout chip clearly tagged "uses 1 of your 3 Finance slots"
//   Submitted v3  — "Unlock & revise" button (timer not expired, opponent hasn't locked)
//   Post-match v3 — customer-count trajectory chart added next to price chart

// ── shared sample data ────────────────────────────────────────────────
const GAMES_V3 = [
  { opp: 'Marina Okafor',  init: 'MO', elo: 1284, rec: '8-5',   round: 5, total: 8, status: 'your-turn',     timer: '18h 42m left',  yourPrice: '$4.25', oppPrice: '$3.95', profit: '+$84',  scenario: 'Coffee Shop' },
  { opp: 'Theo Park',      init: 'TP', elo: 1190, rec: '12-9',  round: 3, total: 8, status: 'waiting',       timer: '22h 10m left',  yourPrice: '$4.00', oppPrice: '$4.00', profit: '+$22',  scenario: 'Coffee Shop' },
  { opp: 'Anya Lindqvist', init: 'AL', elo: 1340, rec: '24-18', round: 6, total: 8, status: 'results-ready', timer: 'view now',      yourPrice: '$3.75', oppPrice: '$4.50', profit: '-$18',  scenario: 'Coffee Shop' },
  { opp: 'Devon Reyes',    init: 'DR', elo: 1075, rec: '3-2',   round: 1, total: 8, status: 'your-turn',     timer: '23h 04m left',  yourPrice: '$4.00', oppPrice: '—',     profit: '$0',    scenario: 'Coffee Shop' },
  { opp: 'Sana Idris',     init: 'SI', elo: 1422, rec: '52-31', round: 7, total: 8, status: 'waiting',       timer: '6h 18m left',   yourPrice: '$5.10', oppPrice: '$4.80', profit: '+$162', scenario: 'Coffee Shop' },
];
const ME_V3 = { name: 'You', elo: 1266, trend: '+18', rec: '34-22', winrate: '61%' };

// ── Lobby v3 — kanban + player Elo header + empty-state hint ─────────────
const LobbyV3 = () => {
  const cols = [
    { title: 'Results ready', kind: 'warm',   urgent: true,  items: GAMES_V3.filter(g => g.status === 'results-ready') },
    { title: 'Your turn',     kind: 'accent', urgent: false, items: GAMES_V3.filter(g => g.status === 'your-turn') },
    { title: 'Waiting',       kind: 'ghost',  urgent: false, items: GAMES_V3.filter(g => g.status === 'waiting') },
  ];
  return (
    <>
      {/* NEW v3: Elo + record header — gives ladder grinders their number without diving in */}
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h2>Games</h2>
          <div className="step-hint">5 active · 1 result waiting · 2 need your move</div>
        </div>
        <div className="wf-row" style={{ alignItems: 'center', gap: 14 }}>
          <div className="wf-card" style={{ padding: '6px 14px', display: 'flex', alignItems: 'baseline', gap: 14, background: 'var(--paper-2)' }}>
            <div><div className="stat-num" style={{ fontSize: 26 }}>{ME_V3.elo}</div><div className="stat-label">Elo · <span style={{ color: 'var(--good)' }}>{ME_V3.trend}</span> last match</div></div>
            <div style={{ borderLeft: '1.5px dashed var(--ink-3)', paddingLeft: 14 }}>
              <div className="stat-num" style={{ fontSize: 22 }}>{ME_V3.rec}</div>
              <div className="stat-label">win rate {ME_V3.winrate}</div>
            </div>
          </div>
          <div className="wf-row" style={{ gap: 8 }}>
            <Btn kind="ghost">⇄ List</Btn>
            <Btn kind="primary">+ New game</Btn>
          </div>
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
                    {c.urgent ? <Btn kind="primary">See result →</Btn>
                      : c.kind === 'accent' ? <Btn kind="primary">Take turn</Btn>
                      : <span className="elo">{g.timer}</span>}
                  </div>
                </div>
              ))}
              {c.items.length === 0 && <div className="step-hint" style={{ textAlign: 'center', padding: 14 }}>nothing here</div>}
            </div>
          </div>
        ))}
      </div>

      {/* NEW v3: history + first-time hint */}
      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14, gap: 14, flexWrap: 'wrap' }}>
        <div className="step-hint" style={{ margin: 0 }}>Finished matches collapse into <a style={{ color: 'var(--accent)' }}>History (12)</a>. Scenario label scales when Tech Startup / Family Farm / Developing Nation ship.</div>
        <div className="step-hint" style={{ margin: 0, fontStyle: 'italic' }}>First-time user variant: empty board, single primary CTA "Start your first match" + 3-line "how it works" strip.</div>
      </div>
    </>
  );
};

// ── Briefing v3 — opponent playstyle HIDDEN, last-seen softened ──────────
const BriefingV3 = () => (
  <>
    <div className="wf-row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">New match · Coffee Shop</div>
        <h2>You face a real rival.</h2>
      </div>
      <Btn kind="ghost">← Lobby</Btn>
    </div>

    <div className="wf-card accent" style={{ padding: 16 }}>
      <div className="wf-row" style={{ alignItems: 'center', gap: 16 }}>
        <div className="av lg">MO</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 28 }}>Marina Okafor</h3>
          {/* v3: only Elo + record. Playstyle and avg. price are EARNED through play. */}
          <div className="step-hint" style={{ margin: 0 }}>Elo 1284 · 8 W / 5 L</div>
          <div className="step-hint" style={{ margin: '4px 0 0', fontStyle: 'italic', fontSize: 12 }}>How she plays is for you to figure out. That's the game.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* v3: rough indicator only — no exact "2h ago" timing */}
          <Chip kind="ghost">● active today</Chip>
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
          <span style={{ fontSize: 14, marginLeft: 8 }}>both prices, customer counts, review scores, foot traffic, market events, "public" actions.</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Chip>private</Chip>
          <span style={{ fontSize: 14, marginLeft: 8 }}>cash, costs, debt, morale, supplier tier, R&amp;D, inventory.</span>
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

// ── Results v3 — words not %s, collapsible inference ──────────────────────
const PUBLIC_LAST_V3 = {
  you: { price: '$4.25', cust: 142, review: '4.2 ★' },
  opp: { price: '$3.95', cust: 168, review: '4.0 ★', name: 'Marina' },
  traffic: 318, trafficDelta: '+24 vs avg',
};
const ResultsV3 = () => (
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
            <div><div className="stat-num">{PUBLIC_LAST_V3.you.price}</div><div className="stat-label">price</div></div>
            <div><div className="stat-num">{PUBLIC_LAST_V3.you.cust}</div><div className="stat-label">customers</div></div>
            <div><div className="stat-num">{PUBLIC_LAST_V3.you.review}</div><div className="stat-label">review</div></div>
          </div>
        </div>
        <div className="vs-divider">vs</div>
        <div className="side">
          <div className="stat-label">{PUBLIC_LAST_V3.opp.name}</div>
          <div className="wf-row" style={{ gap: 14, marginTop: 6, alignItems: 'baseline' }}>
            <div><div className="stat-num">{PUBLIC_LAST_V3.opp.price}</div><div className="stat-label">price</div></div>
            <div><div className="stat-num">{PUBLIC_LAST_V3.opp.cust}</div><div className="stat-label">customers</div></div>
            <div><div className="stat-num">{PUBLIC_LAST_V3.opp.review}</div><div className="stat-label">review</div></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1.5px dashed var(--ink-3)' }}>
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="eyebrow">Events this round · stochastic</div>
          <span className="step-hint" style={{ fontSize: 12 }}>hover any for the mechanic</span>
        </div>
        <div className="wf-row wrap" style={{ marginTop: 10, gap: 10, alignItems: 'flex-start' }}>
          <Chip>Foot traffic {PUBLIC_LAST_V3.traffic} · {PUBLIC_LAST_V3.trafficDelta}</Chip>
          <Chip kind="ghost">☀ Sunny weekend +12% traffic</Chip>
          <Chip kind="ghost">⚑ Bean supply tight +5% cost</Chip>
          <Chip kind="warm">{PUBLIC_LAST_V3.opp.name}: Flash sale</Chip>
        </div>

        {/* v3: words not percentages */}
        <div className="wf-row wrap" style={{ marginTop: 12, gap: 8, alignItems: 'center', paddingTop: 10, borderTop: '1px dotted var(--ink-3)' }}>
          <span className="step-hint" style={{ fontSize: 12, minWidth: 'fit-content' }}>Could occur next round:</span>
          <Chip kind="ghost">⛅ Weather shift · likely</Chip>
          <Chip kind="ghost">⚑ Supplier reset · possible</Chip>
          <Chip kind="ghost">★ Reviewer visit · unlikely</Chip>
          <span className="step-hint" style={{ fontSize: 12, opacity: 0.7 }}>rough — exact rolls happen at resolve</span>
        </div>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Your P&amp;L · round 4</div>
        <KV k="Revenue" v="$603.50" />
        <KV k="Inputs" v="-$184" />
        <KV k="Wages" v="-$112" />
        <KV k="Marketing" v="-$40" />
        <KV k="Training" v="-$25" />
        <KV k="Maint." v="-$12" />
        <KV k="Interest" v="-$0" />
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0 0' }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: 22, fontWeight: 700 }}>Net profit</span>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: 30, fontWeight: 700, color: 'var(--good)' }}>+$230.50</span>
        </div>
        <div className="wf-row" style={{ justifyContent: 'space-between' }}>
          <span className="step-hint">cumulative</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, color: 'var(--good)' }}>+$642</span>
        </div>
      </div>

      <div className="wf-col" style={{ gap: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">Your state</div>
          <KV k="Cash" v="$748" />
          <KV k="Staff" v="2 · morale Stable · skill Good" />
          <KV k="Reputation" v="Good" />
          <KV k="Segments" v="38% reg · 47% cas · 15% new" />
        </div>
        <div className="wf-card">
          <div className="eyebrow">Action outcomes</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
            <span className="chip good" style={{ padding: '0 6px', fontSize: 11 }}>✓</span>
            <span style={{ fontSize: 14 }}>Training paid off · skill ▲</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
            <span className="chip good" style={{ padding: '0 6px', fontSize: 11 }}>✓</span>
            <span style={{ fontSize: 14 }}>Worker stayed (wage match)</span>
          </div>
        </div>
        {/* v3: collapsible inference, opt-out after first matches */}
        <div className="inf">
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <b>What you might infer</b>
            <span className="step-hint" style={{ margin: 0, fontSize: 11 }}>shown for first 15 matches · <a style={{ color: 'var(--warm)', textDecoration: 'underline' }}>hide</a> · <a style={{ color: 'var(--warm)', textDecoration: 'underline' }}>collapse</a></span>
          </div>
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

Object.assign(window, { LobbyV3, BriefingV3, ResultsV3 });
