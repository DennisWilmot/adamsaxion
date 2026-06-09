// Margin — SHELL screens (everything under GameShell).
// Home (with game-type dropdown), Queue, Match history, Leaderboard,
// Notifications, Profile. Content carried over from the Price War v3 review,
// re-skinned onto the mt-kit so it matches the in-match material.

// ─────────────────────────── sample data ──────────────────────────────────
// col: which kanban column · kind drives the card's label + accent
//   up-next  = needs you (your turn, or a result to read)
//   submitted = your move locked, round not yet resolved
//   waiting  = waiting on opponent's move / their clock
const GAMES = [
  { col: 'up-next',  kind: 'result',    opp: 'Anya Lindqvist', elo: 1340, rec: '24–18', round: 6, total: 8, timer: 'view now', you: 375, theirs: 450, profit: -18, av: <AvOpp size={34} /> },
  { col: 'up-next',  kind: 'your-turn', opp: 'Marina Okafor',  elo: 1284, rec: '8–5',   round: 5, total: 8, timer: '18h 42m', you: 425, theirs: 395, profit: 84,  av: <AvOpp size={34} /> },
  { col: 'up-next',  kind: 'your-turn', opp: 'Devon Reyes',    elo: 1075, rec: '3–2',   round: 1, total: 8, timer: '23h 04m', you: 400, theirs: null, profit: 0,   av: <AvOpp size={34} /> },
  { col: 'submitted', kind: 'submitted', opp: 'Sana Idris',    elo: 1422, rec: '52–31', round: 7, total: 8, timer: 'resolving', you: 510, theirs: 480, profit: 162, av: <AvOpp size={34} /> },
  { col: 'waiting',  kind: 'waiting',   opp: 'Theo Park',      elo: 1190, rec: '12–9',  round: 3, total: 8, timer: '22h 10m', you: 400, theirs: 400, profit: 22,  av: <AvOpp size={34} /> },
];

const StatCol = ({ label, children }) => (
  <div><Eyebrow>{label}</Eyebrow><div style={{ marginTop: 3 }}>{children}</div></div>
);

const GameCard = ({ g }) => {
  const result = g.kind === 'result';
  const yourTurn = g.kind === 'your-turn';
  const needsYou = result || yourTurn;
  return (
    <div className="mt-tile mt-press" style={{
      background: T.card, border: `1px solid ${result ? '#f0d99a' : yourTurn ? T.blueLine : T.rule}`,
      borderRadius: 13, padding: 13, cursor: 'pointer',
      boxShadow: result ? '0 0 0 3px #fdf0d8' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: 11, color: T.ink3 }}>Coffee Shop · R{g.round}/{g.total}</span>
        {result ? <Pill tone="warn">result ready</Pill>
          : yourTurn ? <Pill tone="blue">your turn</Pill>
          : g.kind === 'submitted' ? <Pill tone="green">submitted</Pill>
          : <span className="mono" style={{ fontSize: 11.5, color: T.ink3 }}>{g.timer}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
        {g.av}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{g.opp}</div>
          <div className="mono" style={{ fontSize: 11, color: T.ink3, marginTop: 1 }}>Elo {g.elo} · {g.rec}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: `1px dashed ${T.rule}` }}>
        <StatCol label="You"><Price v={g.you} size={14} color={T.ink} /></StatCol>
        <StatCol label="Opp">{g.theirs != null ? <Price v={g.theirs} size={14} color={T.ink2} /> : <span className="mono" style={{ fontSize: 14, color: T.ink4 }}>—</span>}</StatCol>
        <StatCol label="Profit"><Cash v={g.profit} sign size={14} color={g.profit < 0 ? T.red : g.profit > 0 ? T.green : T.ink3} /></StatCol>
        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          {result ? <Btn kind="primary" size="sm">See result →</Btn>
            : yourTurn ? <Btn kind="primary" size="sm">Take turn</Btn>
            : <span className="mono" style={{ fontSize: 11, color: T.ink3 }}>{g.timer}</span>}
        </div>
      </div>
    </div>
  );
};

const KanbanCol = ({ title, tone, items }) => (
  <div style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 700, color: T.ink }}><Dot c={tone} />{title}</span>
      <span className="mono" style={{ fontSize: 12, color: T.ink3 }}>{items.length}</span>
    </div>
    {items.map((g, i) => <GameCard key={i} g={g} />)}
    {items.length === 0 && <div style={{ textAlign: 'center', padding: 18, fontSize: 12.5, color: T.ink3 }}>nothing here</div>}
  </div>
);

// ─────────────────────────── Home (ShellHomePanel) ────────────────────────
const Home = ({ dropdownOpen }) => (
  <GameShell nav="home">
    <RouteTag route="/play/price-war" panel="shell-home" />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn kind="primary" size="md">Play →</Btn>
        <ModePicker open={dropdownOpen} />
      </div>
      <div style={{ textAlign: 'right' }}>
        <Eyebrow>Your games</Eyebrow>
        <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4 }}>5 active · 1 result waiting</h1>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <KanbanCol title="Up next" tone={T.blue} items={GAMES.filter(g => g.col === 'up-next')} />
      <KanbanCol title="Submitted" tone={T.green} items={GAMES.filter(g => g.col === 'submitted')} />
      <KanbanCol title="Waiting" tone={T.ink4} items={GAMES.filter(g => g.col === 'waiting')} />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 16, padding: '13px 16px', background: T.card, border: `1px solid ${T.rule}`, borderRadius: 13 }}>
      <span style={{ fontSize: 13, color: T.ink2 }}>Finished matches collapse into <b style={{ color: T.blue }}>History</b> (top bar).</span>
      <span style={{ fontSize: 12.5, color: T.ink3, fontStyle: 'italic' }}>First-time variant: empty board + one “Start your first match” CTA.</span>
    </div>
  </GameShell>
);

// ─────────────────────────── Queue (matchmaking) ──────────────────────────
// Coffee-ops flavor lines instead of technical telemetry; the current one is
// highlighted to imply a slow cycle. (Front-end can rotate through them.)
const PREP_LINES = ['Warming the espresso machine', 'Pre-heating the oven', 'Balancing the books'];
const QueueSearching = () => (
  <GameShell nav="home">
    <RouteTag route="/play/price-war/queue?mode=blitz" panel="queue-searching" />
    <div style={{ minHeight: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560, background: T.card, border: `1px solid ${T.rule}`, borderRadius: 18, padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginBottom: 4 }}>
          {[0, 1, 2].map(i => <span key={i} className="mtq-dot" style={{ width: 11, height: 11, borderRadius: 99, background: T.blue }} />)}
        </div>
        <h2 className="serif" style={{ fontSize: 27, color: T.ink, fontWeight: 700, marginTop: 14 }}>Looking for an opponent…</h2>
        <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 5 }}>Elo <b className="mono" style={{ color: T.ink2 }}>{ME.elo}</b></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '26px auto 0', maxWidth: 320, textAlign: 'left' }}>
          {PREP_LINES.map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, opacity: i === 0 ? 1 : 0.5 }}>
              {i === 0
                ? <span style={{ display: 'inline-flex', gap: 3 }}><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.blue }} /><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.blue }} /><span className="mtq-dot" style={{ width: 6, height: 6, borderRadius: 99, background: T.blue }} /></span>
                : <span style={{ width: 16, textAlign: 'center', color: T.ink4 }}>○</span>}
              <span className="serif" style={{ fontSize: 15.5, fontStyle: 'italic', color: i === 0 ? T.ink : T.ink3 }}>{line}…</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <Btn kind="danger" size="md">Cancel search</Btn>
        </div>
      </div>
    </div>
  </GameShell>
);

// ─────────────────────────── Match history ────────────────────────────────
const HISTORY = [
  { o: 'W', opp: 'Marina Okafor',  elo: 1284, delta: '+18', margin: '+$376', when: 'Yesterday' },
  { o: 'L', opp: 'Sana Idris',     elo: 1422, delta: '−12', margin: '−$214', when: 'Yesterday' },
  { o: 'W', opp: 'Theo Park',      elo: 1190, delta: '+9',  margin: '+$92',  when: '2 days ago' },
  { o: 'W', opp: 'Devon Reyes',    elo: 1075, delta: '+6',  margin: '+$148', when: '3 days ago' },
  { o: 'F', opp: 'Anya Lindqvist', elo: 1340, delta: '−22', margin: 'forfeit · R5', when: '4 days ago' },
  { o: 'L', opp: 'Marina Okafor',  elo: 1266, delta: '−14', margin: '−$58',  when: 'Last week' },
];
const MatchHistory = () => (
  <GameShell nav="home">
    <RouteTag route="/play/price-war/history" panel="history" />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <Eyebrow>Profile · history</Eyebrow>
        <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4 }}>Match history</h1>
        <div style={{ fontSize: 13, color: T.ink3, marginTop: 4 }}>34 wins · 22 losses · 1 forfeit · 56 total</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Pill tone="blue">All</Pill><Pill>Wins</Pill><Pill>Losses</Pill>
      </div>
    </div>
    <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, padding: '10px 16px', background: T.paper2, borderBottom: `1px solid ${T.rule}` }}>
        <span className="eyebrow" style={{ width: 64 }}>Outcome</span>
        <span className="eyebrow" style={{ flex: 1 }}>Opponent</span>
        <span className="eyebrow" style={{ width: 110 }}>Margin</span>
        <span className="eyebrow" style={{ width: 60 }}>Elo</span>
        <span className="eyebrow" style={{ width: 90, textAlign: 'right' }}>Date</span>
      </div>
      {HISTORY.map((m, i) => {
        const win = m.o === 'W', forf = m.o === 'F';
        return (
          <div key={i} className="mt-press" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < HISTORY.length - 1 ? `1px dashed ${T.rule}` : 'none', cursor: 'pointer' }}>
            <span style={{ width: 64 }}><Pill tone={win ? 'green' : forf ? 'warn' : 'ink'}>{win ? 'Win' : forf ? 'Forfeit' : 'Loss'}</Pill></span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AvOpp size={30} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{m.opp}</div>
                <div className="mono" style={{ fontSize: 11, color: T.ink3 }}>Coffee Shop · Elo {m.elo}</div>
              </div>
            </div>
            <span className="mono" style={{ width: 110, fontSize: 13, color: m.margin.startsWith('−') || forf ? T.red : T.green, fontWeight: 600 }}>{m.margin}</span>
            <span className="mono" style={{ width: 60, fontSize: 14, fontWeight: 600, color: m.delta.startsWith('+') ? T.green : T.red }}>{m.delta}</span>
            <span className="mono" style={{ width: 90, textAlign: 'right', fontSize: 12, color: T.ink3 }}>{m.when}</span>
          </div>
        );
      })}
    </div>
  </GameShell>
);

// ─────────────────────────── Leaderboard ──────────────────────────────────
const BOARD = [
  { rank: 1, name: 'Anya Lindqvist', elo: 1612, wr: '74%', delta: '+4', you: false },
  { rank: 2, name: 'Sana Idris',     elo: 1582, wr: '71%', delta: '−2', you: false },
  { rank: 3, name: 'Yuki Tan',       elo: 1521, wr: '68%', delta: '+12', you: false },
  { rank: 4, name: 'Marko Beric',    elo: 1488, wr: '66%', delta: '+1', you: false },
  { rank: 5, name: 'Marina Okafor',  elo: 1284, wr: '62%', delta: '−18', you: false },
  { rank: 6, name: 'adam.s',         elo: 1266, wr: '61%', delta: '+18', you: true },
  { rank: 7, name: 'Theo Park',      elo: 1190, wr: '57%', delta: '−9', you: false },
];
const Leaderboard = () => (
  <GameShell nav="leaderboard">
    <RouteTag route="/play/price-war/leaderboard" panel="leaderboard" />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <Eyebrow>Coffee Shop ladder · this season</Eyebrow>
        <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4 }}>Leaderboard</h1>
      </div>
      <div style={{ display: 'flex', gap: 6 }}><Pill tone="blue">Coffee Shop</Pill><Pill>Global</Pill></div>
    </div>
    <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 14, overflow: 'hidden' }}>
      {BOARD.map((p, i) => (
        <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < BOARD.length - 1 ? `1px dashed ${T.rule}` : 'none', background: p.you ? T.blueSoft : i < 3 ? T.paper2 : 'transparent' }}>
          <div style={{ width: 32, textAlign: 'center' }}>
            <span className="serif" style={{ fontSize: 20, fontWeight: 700, color: i < 3 ? T.blue : T.ink4 }}>{p.rank}</span>
          </div>
          {p.you ? <AvPlayer size={36} /> : <AvOpp size={36} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: p.you ? 800 : 600, color: T.ink }}>{p.name}{p.you && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: T.blue, background: '#fff', padding: '2px 6px', borderRadius: 5 }}>YOU</span>}</div>
            <div className="mono" style={{ fontSize: 11, color: T.ink3, marginTop: 1 }}>win rate {p.wr}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 19, fontWeight: 600, color: T.ink }}>{p.elo}</div>
            <div className="mono" style={{ fontSize: 11, color: p.delta.startsWith('+') ? T.green : T.red, marginTop: 1 }}>{p.delta} wk</div>
          </div>
          {!p.you && <Btn kind="ghost" size="sm">Challenge</Btn>}
        </div>
      ))}
    </div>
  </GameShell>
);

// ─────────────────────────── Notifications ────────────────────────────────
const NOTIFS = [
  { label: 'Your turn',      tone: 'blue',  text: 'Marina submitted · your turn in Round 5', t: '14m', unread: true,  cta: 'Open →' },
  { label: 'Results ready',  tone: 'warn',  text: "Round 6 vs Anya resolved — you're up $48", t: '2h',  unread: true,  cta: 'Open →' },
  { label: 'Timer warning',  tone: 'warn',  text: 'vs Sana · 2h until your timer expires', t: '3h',  unread: false, cta: '✕' },
  { label: 'Match complete', tone: 'green', text: 'Match vs Theo complete · you won (+9 Elo)', t: '1d', unread: false, cta: '✕' },
  { label: 'Rematch',        tone: 'blue',  text: 'Marina sent a rematch challenge · accept by 11pm', t: '1d', unread: false, cta: '✕' },
  { label: 'Abandonment',    tone: 'ink',   text: 'vs Devon · opponent may have abandoned · resolution in 6h', t: '2d', unread: false, cta: '✕' },
];
const Notifications = () => (
  <GameShell nav="notifications">
    <RouteTag route="/play/price-war/notifications" panel="notifications" />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <Eyebrow>Notifications</Eyebrow>
        <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4 }}>Inbox</h1>
        <div style={{ fontSize: 13, color: T.ink3, marginTop: 4 }}>2 unread · sound + badge controls in settings</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}><Btn kind="ghost" size="sm">Mark all read</Btn><Btn kind="ghost" size="sm">Settings</Btn></div>
    </div>
    <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 14, overflow: 'hidden' }}>
      {NOTIFS.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', background: n.unread ? T.blueSoft : 'transparent', borderBottom: i < NOTIFS.length - 1 ? `1px dashed ${T.rule}` : 'none' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill tone={n.tone}>{n.label}</Pill>
              {n.unread && <Dot c={T.red} />}
            </div>
            <div style={{ fontSize: 14, color: T.ink, marginTop: 5 }}>{n.text}</div>
          </div>
          <span className="mono" style={{ fontSize: 12, color: T.ink3 }}>{n.t}</span>
          <Btn kind="ghost" size="sm">{n.cta}</Btn>
        </div>
      ))}
    </div>
  </GameShell>
);

// ─────────────────────────── Profile (Elo hero) ───────────────────────────
const Profile = () => (
  <GameShell nav="home">
    <RouteTag route="/play/price-war/history" panel="profile" />
    <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 18, padding: 22, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <AvPlayer size={76} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <h1 className="serif" style={{ fontSize: 28, color: T.ink, fontWeight: 700 }}>adam.s</h1>
        <div style={{ fontSize: 13, color: T.ink3, marginTop: 3 }}>joined 6 weeks ago · 56 matches · Coffee Shop loyalist</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="serif" style={{ fontSize: 68, lineHeight: 1, fontWeight: 700, color: T.blue }}>1266</div>
        <div style={{ fontSize: 12, color: T.ink3, marginTop: 4 }}>Elo · top 32% · peak 1284 · <span style={{ color: T.green }}>+18 last 7d</span></div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 12 }}>
      {[['34–22', 'W / L · 61%'], ['+$148', 'avg margin'], ['71%', 'retention'], ['+0.42', 'comeback rating']].map((s, i) => (
        <div key={i} style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 13, padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: T.ink }}>{s[0]}</div>
          <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{s[1]}</div>
        </div>
      ))}
    </div>
    <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
      <Eyebrow>Elo · last 30 matches</Eyebrow>
      <svg viewBox="0 0 360 96" style={{ width: '100%', marginTop: 8 }}>
        <line x1="20" y1="80" x2="350" y2="80" stroke={T.rule} strokeWidth="1" />
        <path d="M 20,72 L 50,68 L 80,74 L 110,60 L 140,64 L 170,52 L 200,57 L 230,44 L 260,50 L 290,38 L 320,33 L 350,26" stroke={T.blue} strokeWidth="2.4" fill="none" />
        <circle cx="350" cy="26" r="4" fill={T.blue} />
      </svg>
      <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>The bump at match 18 is when you started holding price.</div>
    </div>
  </GameShell>
);

Object.assign(window, { GAMES, GameCard, KanbanCol, Home, QueueSearching, MatchHistory, Leaderboard, Notifications, Profile });
