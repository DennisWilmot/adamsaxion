// Lobby wireframes + shared atoms for the Price War wireframe deck.
// 3 directions: list view, board view, focus card.

// ─── shared atoms ─────────────────────────────────────────────────────
const Bar = ({ w = '100%', t }) => (
  <div className={`wf-bar ${t || ''}`} style={{ width: w }} />
);
const ImgSlot = ({ h = 120, label = 'image' }) => (
  <div className="wf-img" style={{ height: h }}>{label}</div>
);
const Btn = ({ children, kind = '', ...rest }) => (
  <button className={`wf-btn ${kind}`} {...rest}>{children}</button>
);
const KV = ({ k, v }) => (
  <div className="wf-kv"><span className="k">{k}</span><span className="v">{v}</span></div>
);
const Chip = ({ children, kind = '' }) => (
  <span className={`chip ${kind}`}>{children}</span>
);
const DomBadge = ({ d }) => {
  const map = { Sales: 'sales', Procurement: 'proc', Operations: 'ops', HR: 'hr', Marketing: 'mkt', Finance: 'fin' };
  return <span className={`badge ${map[d] || ''}`}>{d}</span>;
};
const RoundDots = ({ total = 8, current = 3 }) => (
  <div className="round-dots">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={`d ${i < current - 1 ? 'done' : i === current - 1 ? 'now' : ''}`} />
    ))}
  </div>
);
const Spark = ({ data = [4, 6, 5, 8, 7, 10, 12, 11], color = '#1f59c2', neg = false }) => {
  const w = 100, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={neg ? '#c84a2c' : color} strokeWidth="1.5" />
      </svg>
    </div>
  );
};
const Slider = ({ pct = 50 }) => (
  <div className="slider">
    <div className="track"><div className="thumb" style={{ left: `${pct}%` }} /></div>
  </div>
);

Object.assign(window, { Bar, ImgSlot, Btn, KV, Chip, DomBadge, RoundDots, Spark, Slider });

// ─── lobby data ────────────────────────────────────────────────────────
const GAMES = [
  { opp: 'Marina Okafor',  init: 'MO', elo: 1284, rec: '8-5',  round: 5, total: 8, status: 'your-turn',     timer: '18h 42m left',  yourPrice: '$4.25', oppPrice: '$3.95', profit: '+$84',  custLast: 142, tone: '' },
  { opp: 'Theo Park',      init: 'TP', elo: 1190, rec: '12-9', round: 3, total: 8, status: 'waiting',       timer: '22h 10m left',  yourPrice: '$4.00', oppPrice: '$4.00', profit: '+$22',  custLast: 96,  tone: '' },
  { opp: 'Anya Lindqvist', init: 'AL', elo: 1340, rec: '24-18',round: 6, total: 8, status: 'results-ready', timer: 'submitted',     yourPrice: '$3.75', oppPrice: '$4.50', profit: '-$18',  custLast: 188, tone: 'warm' },
  { opp: 'Devon Reyes',    init: 'DR', elo: 1075, rec: '3-2',  round: 1, total: 8, status: 'your-turn',     timer: '23h 04m left',  yourPrice: '$4.00', oppPrice: '—',     profit: '$0',    custLast: 0,   tone: '' },
  { opp: 'Sana Idris',     init: 'SI', elo: 1422, rec: '52-31',round: 7, total: 8, status: 'waiting',       timer: '6h 18m left',   yourPrice: '$5.10', oppPrice: '$4.80', profit: '+$162', custLast: 124, tone: '' },
];

const StatusChip = ({ s, timer }) => {
  if (s === 'your-turn')     return <Chip kind="accent"><span className="dot" />Your turn · {timer}</Chip>;
  if (s === 'waiting')       return <Chip kind="ghost">Waiting for opp · {timer}</Chip>;
  if (s === 'results-ready') return <Chip kind="warm"><span className="dot" />Results ready</Chip>;
  if (s === 'resolving')     return <Chip>Resolving…</Chip>;
  return <Chip>{s}</Chip>;
};

// ── A: vertical list, action-priority first ───────────────────────────
const LobbyA = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <h2>Games</h2>
        <div className="step-hint">5 active · 2 need your move · sorted: your turn → results → waiting</div>
      </div>
      <div className="wf-row" style={{ gap: 8 }}>
        <Btn kind="ghost">Filter ▾</Btn>
        <Btn kind="primary">+ New game</Btn>
      </div>
    </div>

    <div className="wf-row" style={{ gap: 10, marginBottom: 12 }}>
      <Chip kind="accent">Your turn · 2</Chip>
      <Chip kind="warm">Results ready · 1</Chip>
      <Chip kind="ghost">Waiting · 2</Chip>
      <Chip kind="ghost">Finished · 14</Chip>
    </div>

    <div className="wf-col" style={{ gap: 10 }}>
      {GAMES.map((g, i) => (
        <div key={i} className={`gcard ${g.status === 'your-turn' ? 'attn' : ''} ${g.tone}`}>
          <div className="gtop">
            <div className="opp">
              <div className="av">{g.init}</div>
              <div>
                <div className="name">{g.opp}</div>
                <div className="elo">Elo {g.elo} · {g.rec}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StatusChip s={g.status} timer={g.timer} />
              <div className="elo" style={{ marginTop: 4 }}>Coffee Shop · Round {g.round}/{g.total}</div>
            </div>
          </div>
          <div className="meta-row">
            <RoundDots total={g.total} current={g.round} />
            <div style={{ display: 'flex', gap: 14, fontFamily: "'Kalam',cursive", fontWeight: 700 }}>
              <span>You {g.yourPrice}</span>
              <span style={{ color: 'var(--ink-3)' }}>vs</span>
              <span>{g.opp.split(' ')[0]} {g.oppPrice}</span>
              <span style={{ color: g.profit.startsWith('-') ? 'var(--warm)' : 'var(--good)' }}>{g.profit}</span>
            </div>
            <Btn kind={g.status === 'your-turn' ? 'primary' : ''}>
              {g.status === 'your-turn' ? 'Take turn →' : g.status === 'results-ready' ? 'See result →' : 'Open'}
            </Btn>
          </div>
        </div>
      ))}
    </div>

    <div className="step-hint" style={{ marginTop: 14 }}>Finished matches collapse into a "History" section below.</div>
  </>
);

// ── B: kanban board by status ─────────────────────────────────────────
const LobbyB = () => {
  const cols = [
    { title: 'Your turn',     kind: 'accent', items: GAMES.filter(g => g.status === 'your-turn') },
    { title: 'Results ready', kind: 'warm',   items: GAMES.filter(g => g.status === 'results-ready') },
    { title: 'Waiting',       kind: 'ghost',  items: GAMES.filter(g => g.status === 'waiting') },
  ];
  return (
    <>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2>Games · Board</h2>
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
                <div key={j} className="gcard" style={{ background: '#fffdf6' }}>
                  <div className="opp">
                    <div className="av">{g.init}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="name">{g.opp}</div>
                      <div className="elo">Elo {g.elo} · R{g.round}/{g.total}</div>
                    </div>
                  </div>
                  <div className="price-row">
                    <div className="col"><div className="lab">You</div><div className="val">{g.yourPrice}</div></div>
                    <div className="col"><div className="lab">Opp</div><div className="val">{g.oppPrice}</div></div>
                    <div className="col"><div className="lab">Profit</div><div className="val" style={{ color: g.profit.startsWith('-') ? 'var(--warm)' : 'var(--good)' }}>{g.profit}</div></div>
                  </div>
                  <div className="elo" style={{ marginTop: 8 }}>{g.timer}</div>
                </div>
              ))}
              {c.items.length === 0 && <div className="step-hint" style={{ textAlign: 'center', padding: 14 }}>nothing here</div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ── C: hero focus + queue rail ─────────────────────────────────────────
const LobbyC = () => {
  const hero = GAMES[0];
  return (
    <div className="wf-row" style={{ alignItems: 'flex-start' }}>
      <div className="wf-col" style={{ flex: 1.6 }}>
        <div className="wf-card accent">
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Up next · your turn</div>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <div className="opp">
              <div className="av" style={{ width: 54, height: 54, fontSize: 22 }}>{hero.init}</div>
              <div>
                <div className="name" style={{ fontSize: 22 }}>{hero.opp}</div>
                <div className="elo">Elo {hero.elo} · {hero.rec} · Coffee Shop</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stat-num" style={{ color: 'var(--warm)' }}>18:42</div>
              <div className="stat-label">time left</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <RoundDots total={8} current={5} />
            <span className="step-hint">Round 5 of 8 · last round: you held, they cut to $3.95</span>
          </div>
          <div className="vs" style={{ marginTop: 12 }}>
            <div className="side you">
              <div className="stat-label">You</div>
              <div className="stat-num">+$84</div>
              <div className="elo">142 cust · price $4.25</div>
            </div>
            <div className="vs-divider">vs</div>
            <div className="side">
              <div className="stat-label">{hero.opp.split(' ')[0]}</div>
              <div className="stat-num">+$118</div>
              <div className="elo">168 cust · price $3.95</div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <Btn kind="primary" className="big">Take your turn →</Btn>
            <Btn kind="ghost">Scout opponent</Btn>
          </div>
        </div>

        <div className="wf-card">
          <div className="eyebrow">Find a new opponent</div>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Coffee Shop · 8 rounds</h4>
              <div className="elo">Match to ~Elo 1280 · usually finds in 30s</div>
            </div>
            <Btn kind="primary">Queue</Btn>
          </div>
        </div>
      </div>

      <div className="wf-col" style={{ flex: 1 }}>
        <div className="wf-card">
          <div className="eyebrow">Your other games</div>
          {GAMES.slice(1).map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < GAMES.length - 2 ? '1px dashed var(--ink-3)' : 'none' }}>
              <div className="av" style={{ width: 32, height: 32, fontSize: 14 }}>{g.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{g.opp}</div>
                <div className="elo">R{g.round}/{g.total} · {g.timer}</div>
              </div>
              <StatusChip s={g.status} timer="" />
            </div>
          ))}
        </div>
        <div className="wf-card">
          <div className="eyebrow">You</div>
          <KV k="Elo" v="1248 ▲ 12" />
          <KV k="Record" v="34 W · 21 L" />
          <KV k="Avg. margin" v="$2.18 / cup" />
        </div>
      </div>
    </div>
  );
};

window.LobbyOptions = [
  { tag: 'A', title: 'Priority list',           why: 'Linear scan. Your-turn games rise to the top. Closest to Chess.com.', Body: LobbyA },
  { tag: 'B', title: 'Kanban by status',        why: 'Visualizes the pipeline. Easier when juggling 5-6 concurrent games.', Body: LobbyB },
  { tag: 'C', title: 'Hero focus + sidebar',    why: 'One game in the spotlight; others tucked into a rail. Calmer.',       Body: LobbyC },
];
