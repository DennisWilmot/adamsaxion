// Café Duel — meta: Leaderboard + Notifications

// ----- Leaderboard -----

interface LeaderRow {
  rank: number; name: string; elo: number; record: string; streak: number;
  trend: number; you?: boolean; avatar?: 'p' | 'o';
}

const LEADERS: LeaderRow[] = [
  { rank: 1,  name: 'Aiko T.',   elo: 1742, record: '142 · 38', streak: 6, trend: +18 },
  { rank: 2,  name: 'Dom V.',    elo: 1681, record: '128 · 44', streak: -1, trend: -8 },
  { rank: 3,  name: 'Wren O.',   elo: 1623, record: '111 · 52', streak: 2, trend: +5 },
  { rank: 4,  name: 'Sasha B.',  elo: 1592, record: '98 · 51',  streak: 4, trend: +12 },
  { rank: 5,  name: 'Marina K.', elo: 1284, record: '54 · 38',  streak: 1, trend: +6, avatar: 'o' },
  { rank: 14, name: 'You',       elo: 1326, record: '24 · 9',   streak: 3, trend: +42, you: true, avatar: 'p' },
  { rank: 15, name: 'Ben C.',    elo: 1318, record: '40 · 28',  streak: -2, trend: -4 },
];

const TrendBadge = ({ v }: { v: number }) => (
  <span style={{
    fontSize: 12, fontWeight: 600,
    color: v > 0 ? CD.green : v < 0 ? CD.red : CD.ink3,
  }} className="num">
    {v > 0 ? '↑' : v < 0 ? '↓' : '·'} {Math.abs(v)}
  </span>
);

const StreakBadge = ({ v }: { v: number }) => {
  const positive = v >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: positive ? 'oklch(0.94 0.04 145)' : 'oklch(0.94 0.04 25)',
      color: positive ? CD.green : CD.red,
    }}>
      {positive ? 'W' : 'L'}{Math.abs(v)}
    </span>
  );
};

const CafeLeaderboard = () => {
  const [scope, setScope] = React.useState('coffee');
  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="tab">Ladder</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: 'italic' }}>
            Who's calling the prices.
          </h1>
        </div>
        <Segmented value={scope} onChange={setScope} options={[
          { value: 'coffee', label: 'Coffee Shop' },
          { value: 'global', label: 'Global' },
          { value: 'friends', label: 'Friends' },
        ]} />
      </div>

      {/* Top-3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 14, marginTop: 28, alignItems: 'end' }}>
        {[LEADERS[1], LEADERS[0], LEADERS[2]].map((r) => {
          const isFirst = r.rank === 1;
          return (
            <div key={r.rank} style={{
              background: isFirst ? CD.terraSoft : CD.cardstock,
              border: `1px solid ${isFirst ? CD.terracotta : CD.rule}`,
              borderRadius: 18, padding: '22px 20px', textAlign: 'center',
              boxShadow: isFirst ? `0 0 0 3px oklch(0.92 0.04 40)` : 'none',
              transform: isFirst ? 'translateY(-12px)' : 'none',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: isFirst ? CD.terracotta : CD.paper,
                border: `2px solid ${isFirst ? CD.terracotta : CD.rule}`,
                color: isFirst ? CD.paper : CD.ink, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                display: 'grid', placeItems: 'center', fontSize: 18,
              }}>{r.rank}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <AvatarOpponent size={isFirst ? 72 : 56} ring={isFirst ? CD.terracotta : CD.ink4} />
              </div>
              <div className="serif" style={{ fontSize: isFirst ? 22 : 18, color: CD.ink, marginTop: 10 }}>{r.name}</div>
              <div className="num serif" style={{ fontSize: isFirst ? 32 : 26, color: CD.ink, lineHeight: 1, marginTop: 4 }}>{r.elo.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', marginTop: 2 }}>{r.record}</div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                <StreakBadge v={r.streak} />
                <TrendBadge v={r.trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of table */}
      <div style={{ marginTop: 28, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px 80px 80px',
          padding: '12px 18px', background: CD.paperDeep, borderBottom: `1px solid ${CD.rule}`,
          fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          <span>Rank</span><span>Player</span><span>Elo</span><span>Record</span><span>Streak</span><span>7d</span>
        </div>
        {LEADERS.slice(3).map((r) => (
          <div key={r.rank} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px 80px 80px',
            padding: '12px 18px', borderBottom: `1px solid ${CD.rule}`, alignItems: 'center',
            background: r.you ? CD.terraSoft : 'transparent',
          }}>
            <span className="num serif" style={{ fontSize: 18, color: CD.ink }}>{r.rank}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.avatar === 'p' ? <AvatarPlayer size={32} ring={r.you ? CD.terracotta : undefined} /> : <AvatarOpponent size={32} />}
              <span className="serif" style={{ fontSize: 18, color: CD.ink, fontStyle: r.you ? 'italic' : 'normal' }}>
                {r.name}{r.you && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: CD.terracotta, color: CD.paper, letterSpacing: '0.08em', fontFamily: 'Geist' }}>YOU</span>}
              </span>
            </span>
            <span className="num" style={{ fontSize: 15, color: CD.ink, fontWeight: 600 }}>{r.elo.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: CD.ink2 }} className="num">{r.record}</span>
            <span><StreakBadge v={r.streak} /></span>
            <span><TrendBadge v={r.trend} /></span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <CoachBubble label="Prof. Aldo · Your climb">
          You're 320 Elo from the top 5 in Coffee Shop. Three good weeks. Don't chase the leaders' style — be unpredictable, not impressive.
        </CoachBubble>
      </div>
    </div>
  );
};

// ----- Notifications inbox -----

interface NotifItem {
  id: string;
  kind: 'match' | 'social' | 'system' | 'season';
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  cta?: string;
}

const NOTIFS: NotifItem[] = [
  { id: '1', kind: 'match', title: 'Marina wants a rematch',  body: 'You beat her +18 yesterday. She queued up for round 2.', time: '5m', unread: true, cta: 'Accept rematch' },
  { id: '2', kind: 'season', title: 'Weekly ladder reset in 2 days', body: "You're 14th. Top 10 earns a portrait frame.", time: '2h', unread: true, cta: 'See standings' },
  { id: '3', kind: 'match', title: 'Match resolved · Marina K.', body: 'Partial credit win. +12 Elo. She didn\'t reconnect.', time: 'Yesterday', cta: 'View match' },
  { id: '4', kind: 'social', title: 'Sasha B. followed you', body: 'They climbed to #4 last week.', time: 'Yesterday' },
  { id: '5', kind: 'system', title: 'New scenario in beta · Food Truck', body: 'Lunch-rush variant. 5 rounds. Apply to test.', time: '3d', cta: 'Join beta' },
];

const NotifIcon = ({ kind }: { kind: NotifItem['kind'] }) => {
  const map: Record<NotifItem['kind'], { bg: string; fg: string; glyph: string }> = {
    match:  { bg: CD.terraSoft, fg: CD.terracotta, glyph: '⌖' },
    social: { bg: 'oklch(0.94 0.04 230)', fg: 'oklch(0.52 0.07 230)', glyph: '☺' },
    system: { bg: 'oklch(0.94 0.04 145)', fg: CD.green, glyph: '◐' },
    season: { bg: 'oklch(0.95 0.04 75)', fg: 'oklch(0.62 0.12 75)', glyph: '☼' },
  };
  const m = map[kind];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: m.bg, color: m.fg,
      display: 'grid', placeItems: 'center',
      fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, lineHeight: 1,
    }}>{m.glyph}</div>
  );
};

const CafeNotifications = () => {
  const [filter, setFilter] = React.useState('all');
  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="tab">Inbox · 2 unread</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: 'italic' }}>
            Word from the floor.
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Segmented value={filter} onChange={setFilter} options={[
            { value: 'all', label: 'All' },
            { value: 'match', label: 'Matches' },
            { value: 'social', label: 'Social' },
            { value: 'system', label: 'System' },
          ]} />
          <PillBtn variant="outline" color={CD.ink} size="sm">Mark all read</PillBtn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22, marginTop: 24, alignItems: 'flex-start' }}>
        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, overflow: 'hidden' }}>
          {NOTIFS.map((n, i) => (
            <div key={n.id} style={{
              display: 'flex', gap: 14, padding: '16px 18px',
              borderBottom: i < NOTIFS.length - 1 ? `1px solid ${CD.rule}` : 'none',
              background: n.unread ? CD.cardstockHi : 'transparent',
              position: 'relative',
            }}>
              {n.unread && (
                <span style={{
                  position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 6, height: 6, borderRadius: 999, background: CD.terracotta,
                }} />
              )}
              <NotifIcon kind={n.kind} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span className="serif" style={{ fontSize: 19, color: CD.ink, lineHeight: 1.2 }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 13.5, color: CD.ink2, marginTop: 4, lineHeight: 1.5 }}>{n.body}</p>
                {n.cta && (
                  <div style={{ marginTop: 8 }}>
                    <PillBtn variant="outline" color={CD.ink} size="sm">{n.cta} →</PillBtn>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 18, position: 'sticky', top: 0 }}>
          <div className="tab" style={{ marginBottom: 12 }}>What to ping me about</div>
          {[
            { label: 'Rematch invites',     def: true, k: 'rematch' },
            { label: 'Match resolutions',   def: true, k: 'resolution' },
            { label: 'New followers',       def: false, k: 'follow' },
            { label: 'Ladder reset & rewards', def: true, k: 'ladder' },
            { label: 'New scenarios',       def: true, k: 'scenarios' },
            { label: "Coach's weekly read", def: false, k: 'coach' },
          ].map((p) => (
            <PrefRow key={p.k} label={p.label} initial={p.def} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PrefRow = ({ label, initial }: { label: string; initial: boolean }) => {
  const [on, setOn] = React.useState(initial);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${CD.rule}` }}>
      <span style={{ fontSize: 13.5, color: CD.ink }}>{label}</span>
      <button onClick={() => setOn(!on)} style={{
        width: 38, height: 22, borderRadius: 999, padding: 2,
        background: on ? CD.terracotta : CD.paperDeep, border: `1px solid ${on ? CD.terracotta : CD.rule}`,
        cursor: 'pointer', position: 'relative', transition: 'background .15s',
      }}>
        <span style={{
          display: 'block', width: 16, height: 16, borderRadius: 999, background: CD.paper,
          transform: on ? 'translateX(16px)' : 'translateX(0)', transition: 'transform .15s',
        }} />
      </button>
    </div>
  );
};

(window as any).CafeLeaderboard = CafeLeaderboard;
(window as any).CafeNotifications = CafeNotifications;
