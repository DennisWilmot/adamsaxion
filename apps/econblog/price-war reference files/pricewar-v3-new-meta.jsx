// Meta screens — Match history, Player profile, Leaderboard, Notifications.

// ── Match history — list with outcome, opponent, Elo change, date ──────────
const HISTORY = [
  { id: 'h1', date: 'Yesterday',  outcome: 'W', opp: 'Marina Okafor',  init: 'MO', oppElo: 1284, delta: '+18', margin: '+$376', rounds: 8, scenario: 'Coffee Shop' },
  { id: 'h2', date: 'Yesterday',  outcome: 'L', opp: 'Sana Idris',     init: 'SI', oppElo: 1422, delta: '−12', margin: '−$214', rounds: 8, scenario: 'Coffee Shop' },
  { id: 'h3', date: '2 days ago', outcome: 'W', opp: 'Theo Park',      init: 'TP', oppElo: 1190, delta: '+9',  margin: '+$92',  rounds: 8, scenario: 'Coffee Shop' },
  { id: 'h4', date: '3 days ago', outcome: 'W', opp: 'Devon Reyes',    init: 'DR', oppElo: 1075, delta: '+6',  margin: '+$148', rounds: 8, scenario: 'Coffee Shop' },
  { id: 'h5', date: '4 days ago', outcome: 'F', opp: 'Anya Lindqvist', init: 'AL', oppElo: 1340, delta: '−22', margin: 'forfeit · R5', rounds: 5, scenario: 'Coffee Shop' },
  { id: 'h6', date: 'Last week',  outcome: 'L', opp: 'Marina Okafor',  init: 'MO', oppElo: 1266, delta: '−14', margin: '−$58',  rounds: 8, scenario: 'Coffee Shop' },
  { id: 'h7', date: 'Last week',  outcome: 'W', opp: 'Anya Lindqvist', init: 'AL', oppElo: 1340, delta: '+22', margin: '+$408', rounds: 8, scenario: 'Coffee Shop' },
];

const MatchHistory = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
      <div>
        <div className="eyebrow">Profile · history</div>
        <h2>Match history</h2>
        <div className="step-hint" style={{ margin: 0 }}>34 wins · 22 losses · 1 forfeit · 56 matches total</div>
      </div>
      <div className="wf-row" style={{ gap: 6 }}>
        <Chip kind="accent">All</Chip>
        <Chip kind="ghost">Coffee Shop</Chip>
        <Chip kind="ghost">Wins</Chip>
        <Chip kind="ghost">Losses</Chip>
      </div>
    </div>

    <div className="wf-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="wf-row" style={{ padding: '10px 14px', borderBottom: '1.5px solid var(--ink)', background: 'var(--paper-2)', fontFamily: "'Patrick Hand',cursive", fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
        <span style={{ width: 70 }}>Outcome</span>
        <span style={{ flex: 1 }}>Opponent</span>
        <span style={{ width: 100 }}>Margin</span>
        <span style={{ width: 80 }}>Elo</span>
        <span style={{ width: 100, textAlign: 'right' }}>Date</span>
      </div>
      {HISTORY.map((m, i) => {
        const isWin = m.outcome === 'W';
        const isForfeit = m.outcome === 'F';
        return (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderBottom: i < HISTORY.length - 1 ? '1px dashed var(--ink-3)' : 'none',
            cursor: 'pointer',
          }}>
            <span style={{ width: 70 }}>
              <Chip kind={isWin ? 'good' : isForfeit ? 'warm' : 'ghost'}>
                {isWin ? '✓ W' : isForfeit ? 'F' : '✕ L'}
              </Chip>
            </span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="av" style={{ width: 32, height: 32, fontSize: 12 }}>{m.init}</div>
              <div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>{m.opp}</div>
                <div className="step-hint" style={{ margin: 0, fontSize: 11 }}>{m.scenario} · {m.rounds}R · Elo {m.oppElo}</div>
              </div>
            </div>
            <span style={{ width: 100, fontFamily: "'Kalam',cursive", fontSize: 14, color: isWin ? 'var(--good)' : 'var(--warm)' }}>{m.margin}</span>
            <span style={{ width: 80, fontFamily: "'Kalam',cursive", fontSize: 15, fontWeight: 700, color: m.delta.startsWith('+') ? 'var(--good)' : 'var(--warm)' }}>{m.delta}</span>
            <span style={{ width: 100, textAlign: 'right', fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)' }}>{m.date}</span>
          </div>
        );
      })}
    </div>

    <div className="step-hint" style={{ marginTop: 10, textAlign: 'center' }}>Tap any row → opens the post-match analysis again.</div>
  </>
);

// ── Player Profile — Elo HERO + scenario stats ─────────────────────────────
const PlayerProfile = () => (
  <>
    <div className="wf-card accent" style={{ padding: 22 }}>
      <div className="wf-row" style={{ alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div className="av lg" style={{ width: 76, height: 76, fontSize: 28 }}>YOU</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ marginBottom: 0 }}>adam.s</h2>
          <div className="step-hint" style={{ margin: 0 }}>joined 6 weeks ago · 56 matches · Coffee Shop loyalist</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* Hero Elo treatment */}
          <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 80, lineHeight: 1, color: 'var(--accent)' }}>1266</div>
          <div className="stat-label">Elo · top 32 % of Coffee Shop pool</div>
          <div className="step-hint" style={{ margin: '2px 0 0' }}>peak 1284 · trending <span style={{ color: 'var(--good)' }}>+18 last 7d</span></div>
        </div>
      </div>
    </div>

    <div className="wf-grid cols-4" style={{ marginTop: 12, gap: 10 }}>
      <div className="wf-card"><div className="stat-num">34–22</div><div className="stat-label">W / L · 61 %</div></div>
      <div className="wf-card"><div className="stat-num">+$148</div><div className="stat-label">avg. profit margin</div></div>
      <div className="wf-card"><div className="stat-num">71 %</div><div className="stat-label">customer retention</div></div>
      <div className="wf-card"><div className="stat-num">+0.42</div><div className="stat-label">comeback rating</div></div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Elo · last 30 matches</div>
        <svg viewBox="0 0 360 110" style={{ width: '100%' }}>
          <line x1="20" y1="90" x2="350" y2="90" stroke="#bcb5a8" strokeWidth="1" />
          {/* simple ascending trend */}
          <path d="M 20,80 L 50,75 L 80,82 L 110,68 L 140,72 L 170,60 L 200,65 L 230,52 L 260,58 L 290,45 L 320,40 L 350,32" stroke="#1f59c2" strokeWidth="2.4" fill="none" />
          <text x="22" y="22" fontSize="11" fill="#7d7567" fontFamily="Patrick Hand">1284</text>
          <text x="22" y="100" fontSize="11" fill="#7d7567" fontFamily="Patrick Hand">1180</text>
          <text x="320" y="28" fontSize="11" fill="#1f59c2" fontFamily="Kalam" fontWeight="700">peak</text>
        </svg>
        <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>Trajectory after the first 26 placement matches. The bump at match 18 is when you started holding price.</div>
      </div>

      <div className="wf-card">
        <div className="eyebrow">By scenario</div>
        <div className="wf-col" style={{ gap: 8, marginTop: 6 }}>
          <div>
            <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>Coffee Shop</span>
              <span style={{ fontFamily: "'Kalam',cursive", fontSize: 13 }}>56 matches · 61 % win</span>
            </div>
            <div style={{ height: 8, background: '#e7ddc7', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: '61%', background: 'var(--good)' }} />
            </div>
          </div>
          <div className="step-hint" style={{ margin: '6px 0 0', fontSize: 12, fontStyle: 'italic' }}>Tech Startup / Family Farm / Developing Nation appear here when they launch.</div>
        </div>
      </div>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Lessons completed</div>
        <div className="stat-num">23 / 60</div>
        <Btn kind="ghost" style={{ marginTop: 6 }}>View concepts →</Btn>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Streaks</div>
        <KV k="Current" v="—" />
        <KV k="Best winning" v="6" />
        <KV k="Avg. match length" v="22 min" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">Recently active vs.</div>
        <div className="wf-col" style={{ gap: 4, marginTop: 4 }}>
          <span style={{ fontFamily: "'Kalam',cursive", fontSize: 14 }}>Marina Okafor · 4 games</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontSize: 14 }}>Anya Lindqvist · 3 games</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontSize: 14 }}>Theo Park · 3 games</span>
        </div>
      </div>
    </div>
  </>
);

// ── Leaderboard — ranked list, scenario-filtered ───────────────────────────
const BOARD = [
  { rank: 1,  name: 'Anya Lindqvist',  elo: 1612, init: 'AL', winrate: '74%', delta: '+4', you: false },
  { rank: 2,  name: 'Sana Idris',       elo: 1582, init: 'SI', winrate: '71%', delta: '−2', you: false },
  { rank: 3,  name: 'Yuki Tan',         elo: 1521, init: 'YT', winrate: '68%', delta: '+12', you: false },
  { rank: 4,  name: 'Marko Beric',      elo: 1488, init: 'MB', winrate: '66%', delta: '+1', you: false },
  { rank: 5,  name: 'Marina Okafor',    elo: 1284, init: 'MO', winrate: '62%', delta: '−18', you: false },
  { rank: 6,  name: 'adam.s · you',     elo: 1266, init: 'YOU', winrate: '61%', delta: '+18', you: true },
  { rank: 7,  name: 'Theo Park',        elo: 1190, init: 'TP', winrate: '57%', delta: '−9', you: false },
];
const Leaderboard = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
      <div>
        <div className="eyebrow">Coffee Shop ladder · this season</div>
        <h2>Leaderboard</h2>
        <div className="step-hint" style={{ margin: 0 }}>Filtered to the Coffee Shop pool. When other scenarios launch, each gets its own ladder.</div>
      </div>
      <div className="wf-row" style={{ gap: 6 }}>
        <Chip kind="accent">Coffee Shop</Chip>
        <Chip kind="ghost">Tech Startup (soon)</Chip>
        <Chip kind="ghost">Global</Chip>
      </div>
    </div>

    <div className="wf-card" style={{ padding: 0, overflow: 'hidden' }}>
      {BOARD.map((p, i) => (
        <div key={p.rank} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
          borderBottom: i < BOARD.length - 1 ? '1px dashed var(--ink-3)' : 'none',
          background: p.you ? '#fff8ec' : (i < 3 ? '#fefcf6' : 'transparent'),
        }}>
          <div style={{ width: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: 24, fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--ink-3)' }}>
              {i === 0 ? '①' : i === 1 ? '②' : i === 2 ? '③' : p.rank}
            </div>
          </div>
          <div className="av" style={{ width: 36, height: 36, fontSize: 12, background: p.you ? 'var(--accent)' : undefined, color: p.you ? '#fff' : undefined }}>{p.init}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Kalam',cursive", fontWeight: p.you ? 800 : 700, fontSize: 16 }}>{p.name}</div>
            <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>win rate {p.winrate}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-num" style={{ fontSize: 22 }}>{p.elo}</div>
            <div className="step-hint" style={{ margin: 0, fontSize: 11, color: p.delta.startsWith('+') ? 'var(--good)' : 'var(--warm)' }}>{p.delta} this week</div>
          </div>
          {!p.you && <Btn kind="ghost" style={{ flex: 'none' }}>Challenge</Btn>}
          {p.you && <Chip kind="accent">that's you</Chip>}
        </div>
      ))}
    </div>

    <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
      <Btn kind="ghost">↑ Top 100</Btn>
      <span className="step-hint" style={{ margin: 0 }}>showing #1–#7 · jump to <a style={{ color: 'var(--accent)' }}>your rank #6</a></span>
      <Btn kind="ghost">Top 500 ↓</Btn>
    </div>
  </>
);

// ── Notifications — in-app center, badge counts, mark-read ─────────────────
const NOTIFS = [
  { id: 'n1', kind: 'your-turn',     text: 'Marina submitted · your turn in Round 5',           t: '14m ago', unread: true },
  { id: 'n2', kind: 'results-ready', text: "Round 6 vs. Anya resolved — you're up $48",         t: '2h ago',  unread: true },
  { id: 'n3', kind: 'timer-warn',    text: 'vs. Sana · 2h until your timer expires',            t: '3h ago',  unread: false },
  { id: 'n4', kind: 'match-complete',text: 'Match vs. Theo complete · you won (+9 Elo)',         t: 'Yesterday', unread: false },
  { id: 'n5', kind: 'rematch',       text: 'Marina sent a rematch challenge · accept by 11pm',   t: 'Yesterday', unread: false },
  { id: 'n6', kind: 'abandoned',     text: 'vs. Devon · opponent may have abandoned · resolution in 6h', t: '2 days ago', unread: false },
];
const KIND_META = {
  'your-turn':      { icon: '▲', label: 'Your turn',      tone: 'accent', sound: 'soft chime',  badge: 'red dot' },
  'results-ready':  { icon: '★', label: 'Results ready',  tone: 'warm',   sound: 'soft chime',  badge: 'red dot' },
  'timer-warn':     { icon: '⏱', label: 'Timer warning',  tone: 'warm',   sound: 'no sound',    badge: 'count' },
  'match-complete': { icon: '✓', label: 'Match complete', tone: 'good',   sound: 'soft chime',  badge: 'count' },
  'rematch':        { icon: '↔', label: 'Rematch',        tone: 'accent', sound: 'soft chime',  badge: 'count' },
  'abandoned':      { icon: '⚠', label: 'Abandonment',    tone: 'warm',   sound: 'no sound',    badge: 'count' },
};

const NotificationsCenter = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
      <div>
        <div className="eyebrow">Notifications</div>
        <h2>Inbox</h2>
        <div className="step-hint" style={{ margin: 0 }}>2 unread · sound + badge controls in settings</div>
      </div>
      <div className="wf-row" style={{ gap: 6 }}>
        <Btn kind="ghost">Mark all read</Btn>
        <Btn kind="ghost">Settings</Btn>
      </div>
    </div>

    <div className="wf-card" style={{ padding: 0, overflow: 'hidden' }}>
      {NOTIFS.map((n, i) => {
        const meta = KIND_META[n.kind];
        return (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: n.unread ? '#fff8ec' : 'transparent',
            borderBottom: i < NOTIFS.length - 1 ? '1px dashed var(--ink-3)' : 'none',
          }}>
            <div style={{ width: 32, height: 32, border: '1.5px solid var(--ink)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Caveat',cursive", fontSize: 18 }}>{meta.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="wf-row" style={{ gap: 8, alignItems: 'baseline' }}>
                <Chip kind={meta.tone}>{meta.label}</Chip>
                {n.unread && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--warm)' }} />}
              </div>
              <div style={{ fontFamily: "'Kalam',cursive", fontSize: 15, marginTop: 2 }}>{n.text}</div>
            </div>
            <span className="step-hint" style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{n.t}</span>
            <Btn kind="ghost" style={{ flex: 'none' }}>{n.kind === 'your-turn' || n.kind === 'results-ready' ? 'Open →' : '✕'}</Btn>
          </div>
        );
      })}
    </div>

    <div className="wf-card" style={{ marginTop: 12, background: 'var(--paper-2)' }}>
      <div className="eyebrow">Behavior matrix</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Patrick Hand',cursive", fontSize: 13, marginTop: 6 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px', textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em', color: 'var(--ink-3)' }}>Trigger</th>
              <th style={{ padding: '6px 8px', textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em', color: 'var(--ink-3)' }}>In-app</th>
              <th style={{ padding: '6px 8px', textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em', color: 'var(--ink-3)' }}>App badge</th>
              <th style={{ padding: '6px 8px', textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em', color: 'var(--ink-3)' }}>Sound</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(KIND_META).map(([k, m]) => (
              <tr key={k} style={{ borderBottom: '1px dashed var(--ink-3)' }}>
                <td style={{ padding: '6px 8px' }}>{m.label}</td>
                <td style={{ padding: '6px 8px' }}>list item · highlight</td>
                <td style={{ padding: '6px 8px' }}>{m.badge}</td>
                <td style={{ padding: '6px 8px' }}>{m.sound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="step-hint" style={{ marginTop: 6, fontStyle: 'italic' }}>Push notification copy lives in the engine spec — this screen is the in-app collector only.</div>
    </div>
  </>
);

Object.assign(window, { MatchHistory, PlayerProfile, Leaderboard, NotificationsCenter });
