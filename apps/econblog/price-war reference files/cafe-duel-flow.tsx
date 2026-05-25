// Café Duel — flow screens: Lobby, Scenario, Matchmaking, Briefing, Post-match, Tutorial, Profile.

// ----- Reusable: scenario card art (subtle decorative) -----

const ScenarioArt = ({ kind = 'coffee', opacity = 1, scale = 1 }) => {
  if (kind === 'coffee') return (
    <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: 'block' }}>
      <g stroke={CD.ink} strokeWidth="1.4" fill="none">
        <path d="M 10 30 Q 25 18, 40 30 T 70 30 T 100 30 T 130 30 T 160 30 T 190 30" />
        <line x1="10" y1="30" x2="190" y2="30" />
      </g>
      <g fill={CD.ink}>
        <rect x="62" y="56" width="76" height="44" rx="3" />
        <rect x="80" y="46" width="40" height="14" rx="2" />
        <rect x="92" y="38" width="4" height="9" />
        <rect x="106" y="38" width="4" height="9" />
        <circle cx="86" cy="80" r="4" fill={CD.paper} />
        <circle cx="114" cy="80" r="4" fill={CD.paper} />
      </g>
      <g fill={CD.terracotta} opacity="0.6">
        <circle cx="34" cy="98" r="6" />
      </g>
    </svg>
  );
  if (kind === 'foodtruck') return (
    <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: 'block' }}>
      <g stroke={CD.ink} strokeWidth="1.4" fill="none">
        <rect x="30" y="42" width="120" height="50" rx="6" />
        <rect x="40" y="50" width="40" height="22" rx="2" />
        <line x1="86" y1="48" x2="86" y2="92" />
        <rect x="90" y="50" width="50" height="20" rx="2" />
      </g>
      <g fill={CD.ink}>
        <circle cx="58" cy="98" r="9" />
        <circle cx="58" cy="98" r="3" fill={CD.paper} />
        <circle cx="124" cy="98" r="9" />
        <circle cx="124" cy="98" r="3" fill={CD.paper} />
      </g>
    </svg>
  );
  if (kind === 'tech') return (
    <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: 'block' }}>
      <g stroke={CD.ink} strokeWidth="1.4" fill="none">
        <rect x="40" y="36" width="120" height="64" rx="4" />
        <line x1="40" y1="48" x2="160" y2="48" />
        <circle cx="50" cy="42" r="2" fill={CD.ink} />
        <circle cx="58" cy="42" r="2" fill={CD.ink} />
        <circle cx="66" cy="42" r="2" fill={CD.ink} />
        <line x1="52" y1="60" x2="100" y2="60" />
        <line x1="52" y1="68" x2="120" y2="68" />
        <line x1="52" y1="76" x2="86" y2="76" />
        <rect x="110" y="80" width="36" height="14" rx="2" />
      </g>
    </svg>
  );
  if (kind === 'bookshop') return (
    <svg viewBox="0 0 200 120" width="100%" style={{ opacity, display: 'block' }}>
      <g stroke={CD.ink} strokeWidth="1.4" fill="none">
        {[40, 60, 80, 100, 120, 140].map((x, i) => (
          <rect key={i} x={x} y={50 - (i % 2) * 6} width="14" height={50 + (i % 2) * 6} />
        ))}
        <line x1="34" y1="100" x2="160" y2="100" />
      </g>
    </svg>
  );
  return null;
};

// ----- LOBBY -----

const RecentMatch = ({ won, opp, score, delta }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 10,
  }}>
    <span style={{
      width: 6, height: 36, borderRadius: 3,
      background: won ? CD.green : CD.red,
    }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: CD.ink, fontWeight: 600 }}>{opp}</div>
      <div style={{ fontSize: 12, color: CD.ink3 }}>{score}</div>
    </div>
    <span className="num" style={{ fontSize: 14, color: won ? CD.green : CD.red, fontWeight: 600 }}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  </div>
);

const CafeLobby = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    {/* Top bar */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="serif" style={{ fontSize: 32, color: CD.ink, fontStyle: 'italic' }}>
        The Price War
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <PillBtn variant="ghost" color={CD.ink3} size="sm">Leaderboard</PillBtn>
        <PillBtn variant="ghost" color={CD.ink3} size="sm">History</PillBtn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 12px',
                      background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 999 }}>
          <span className="num" style={{ fontSize: 13, color: CD.ink, fontWeight: 600 }}>1326</span>
          <span style={{ fontSize: 11, color: CD.ink3 }}>elo</span>
          <AvatarPlayer size={32} />
        </div>
      </div>
    </div>

    {/* Hero */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 32, alignItems: 'stretch' }}>
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 22,
        background: CD.paperDeep, border: `1px solid ${CD.rule}`, padding: '36px 32px',
      }}>
        <CoffeeBackdrop opacity={0.08} height={300} />
        <div style={{ position: 'relative' }}>
          <div className="tab">Welcome back</div>
          <h1 className="serif" style={{ fontSize: 48, color: CD.ink, lineHeight: 1.05, marginTop: 6, maxWidth: 480 }}>
            Ready for another <span style={{ color: CD.terracotta, fontStyle: 'italic' }}>round</span>?
          </h1>
          <p style={{ fontSize: 15, color: CD.ink2, marginTop: 12, maxWidth: 460, lineHeight: 1.5 }}>
            You're on a <b style={{ color: CD.ink }}>3-match win streak</b>. Marina's been knocking on your bracket — she might be next.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}>
            <PillBtn variant="solid" color={CD.terracotta} size="lg">
              Quick match <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
            <PillBtn variant="outline" color={CD.ink}>Choose scenario</PillBtn>
            <PillBtn variant="ghost" color={CD.ink3}>Practice vs CPU</PillBtn>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
            {[
              { l: 'Wins', v: '24' }, { l: 'Losses', v: '9' },
              { l: 'Streak', v: '3' }, { l: 'Best margin', v: '$2.1k' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{s.l}</div>
                <div className="num serif" style={{ fontSize: 30, color: CD.ink, lineHeight: 1, marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side panel: recent + coach */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 18 }}>
          <div className="tab" style={{ marginBottom: 12 }}>Recent matches</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <RecentMatch won  opp="Marina K."     score="$5,120 vs $3,890" delta={+18} />
            <RecentMatch won  opp="Ben (CPU · Hard)" score="$4,640 vs $4,210" delta={+12} />
            <RecentMatch     opp="Wren O."        score="$2,950 vs $4,830" delta={-24} />
          </div>
          <PillBtn variant="ghost" color={CD.ink3} size="sm">See all →</PillBtn>
        </div>

        <CoachBubble label="Prof. Aldo · Daily tip">
          Pricing too low against a streaky opponent makes you predictable. Try one premium round to flip the read.
        </CoachBubble>
      </div>
    </div>
  </div>
);

// ----- SCENARIO SELECT -----

const ScenarioCard = ({ kind, name, brief, length, domains, locked, selected, onClick }) => (
  <div onClick={onClick} style={{
    position: 'relative', overflow: 'hidden',
    background: selected ? CD.cardstockHi : CD.cardstock,
    border: `1px solid ${selected ? CD.terracotta : CD.rule}`,
    borderRadius: 18, padding: 20, cursor: locked ? 'not-allowed' : 'pointer',
    boxShadow: selected ? `0 0 0 3px ${CD.terraSoft}` : `0 1px 0 ${CD.rule}`,
    opacity: locked ? 0.55 : 1,
  }} className="cd-move">
    <div style={{ height: 110, marginBottom: 14, padding: '0 8px' }}>
      <ScenarioArt kind={kind} opacity={locked ? 0.4 : 1} />
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <h3 className="serif" style={{ fontSize: 24, color: CD.ink, lineHeight: 1.1 }}>{name}</h3>
      {locked && (
        <span style={{ fontSize: 10, color: CD.ink3, letterSpacing: '0.12em', textTransform: 'uppercase',
                       padding: '3px 8px', background: CD.paperDeep, borderRadius: 999 }}>Locked</span>
      )}
      {!locked && selected && (
        <span style={{ fontSize: 10, color: CD.terracotta, letterSpacing: '0.12em', textTransform: 'uppercase',
                       padding: '3px 8px', background: CD.terraSoft, borderRadius: 999, fontWeight: 700 }}>Selected</span>
      )}
    </div>
    <p style={{ fontSize: 13.5, color: CD.ink2, marginTop: 6, lineHeight: 1.45 }}>{brief}</p>
    <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${CD.rule}`, fontSize: 12, color: CD.ink2 }}>
      <span><span style={{ color: CD.ink3 }}>match </span><span className="num">{length}</span> rounds</span>
      <span style={{ color: CD.ink3 }}>·</span>
      <span><span style={{ color: CD.ink3 }}>domains </span>{domains}</span>
    </div>
  </div>
);

const CafeScenario = () => {
  const [picked, setPicked] = React.useState('coffee');
  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>
      <div className="tab" style={{ marginTop: 16 }}>Choose your battleground</div>
      <h1 className="serif" style={{ fontSize: 42, color: CD.ink, marginTop: 4, lineHeight: 1.05 }}>
        Where are we trading punches today?
      </h1>
      <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, maxWidth: 560 }}>
        Scenarios change which domains matter, the round count, and what your opponent can throw at you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginTop: 24 }}>
        <ScenarioCard kind="coffee" name="Coffee Shop · Downtown"
                      brief="Pricing, weather, beans. Tight margins on a fast clock."
                      length={8} domains="6 / 6" selected={picked === 'coffee'} onClick={() => setPicked('coffee')} />
        <ScenarioCard kind="foodtruck" name="Food Truck · Lunch rush"
                      brief="Location plays, supply runs, hourly demand. Short, punchy matches."
                      length={5} domains="5 / 6" locked />
        <ScenarioCard kind="bookshop" name="Bookshop · Holiday push"
                      brief="Inventory + events. Slower, more strategic. Marketing matters."
                      length={10} domains="4 / 6" locked />
        <ScenarioCard kind="tech" name="SaaS Startup · Quarterly"
                      brief="Pricing tiers, churn, growth loops. Coming after MVP."
                      length={12} domains="6 / 6" locked />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <PillBtn variant="solid" color={CD.terracotta} size="lg">
          Queue {picked === 'coffee' ? 'Coffee Shop' : '—'} <span style={{ opacity: 0.6 }}>→</span>
        </PillBtn>
        <PillBtn variant="outline" color={CD.ink}>Practice solo</PillBtn>
      </div>
    </div>
  );
};

// ----- MATCHMAKING QUEUE -----

const CafeQueue = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36, display: 'flex', flexDirection: 'column' }}>
    <PillBtn variant="ghost" color={CD.ink3} size="sm">← Cancel</PillBtn>

    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center', position: 'relative',
    }}>
      {/* Searching pulse */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <AvatarPlayer size={120} ring={CD.terracotta} />
        {[1, 2, 3].map(i => (
          <div key={i} className="cd-pulse" style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            border: `2px solid ${CD.terracotta}`,
            opacity: 0.4 / i,
            animationDelay: `${i * 0.6}s`,
            transform: `scale(${1 + i * 0.15})`,
          }} />
        ))}
      </div>

      <div className="tab" style={{ marginTop: 28 }}>Searching for an opponent</div>
      <h1 className="serif" style={{ fontSize: 38, color: CD.ink, marginTop: 8, lineHeight: 1.1, maxWidth: 600 }}>
        Finding someone in your league…
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="tab">Your Elo</div>
          <div className="num serif" style={{ fontSize: 34, color: CD.ink, lineHeight: 1, marginTop: 4 }}>1,326</div>
        </div>
        <div style={{ width: 1, height: 36, background: CD.rule }} />
        <div style={{ textAlign: 'center' }}>
          <div className="tab">Searching range</div>
          <div className="num" style={{ fontSize: 16, color: CD.ink, lineHeight: 1, marginTop: 6 }}>1,180 — 1,470</div>
        </div>
        <div style={{ width: 1, height: 36, background: CD.rule }} />
        <div style={{ textAlign: 'center' }}>
          <div className="tab">In queue</div>
          <div className="num mono" style={{ fontSize: 24, color: CD.ink, lineHeight: 1, marginTop: 6 }}>00:14</div>
        </div>
      </div>

      {/* Widening range bar */}
      <div style={{ width: 360, marginTop: 26 }}>
        <div style={{ height: 6, background: CD.paperDeep, borderRadius: 999, position: 'relative', border: `1px solid ${CD.rule}` }}>
          <div style={{ position: 'absolute', left: '20%', right: '20%', top: -3, bottom: -3,
                        background: CD.terraSoft, border: `1px solid ${CD.terracotta}`, borderRadius: 999 }} />
          <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 2, background: CD.terracotta, transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ fontSize: 11.5, color: CD.ink3, marginTop: 6 }}>Range widens every 30s.</div>
      </div>

      <PillBtn variant="outline" color={CD.ink} size="md">
        Cancel search
      </PillBtn>
    </div>

    <CoachBubble label="Prof. Aldo · While we wait">
      Take a breath. Look at the scenario again. Decide your default playstyle before the bell rings — premium, value, or chaos.
    </CoachBubble>
  </div>
);

// ----- BRIEFING (opponent reveal before round 1) -----

const CafeBriefing = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '40px 36px',
    }}>
      <CoffeeBackdrop opacity={0.08} height={220} />
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div className="tab">Opponent located · Coffee Shop · Downtown</div>
        <h1 className="serif" style={{ fontSize: 52, color: CD.ink, marginTop: 6, lineHeight: 1.05, fontStyle: 'italic' }}>
          You've drawn Marina.
        </h1>
        <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8 }}>
          8 rounds. Ranked match. Elo at stake: <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>±24</span>.
        </p>

        {/* Vs reveal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 36, marginTop: 36, alignItems: 'center' }}>
          {/* You */}
          <div className="cd-slide-in-l" style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <AvatarPlayer size={120} ring={CD.terracotta} />
              <div className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 12 }}>You</div>
              <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>Elo <span className="num" style={{ color: CD.ink }}>1,326</span></div>
              <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
                {[true, true, true, false, true].map((w, i) => (
                  <span key={i} style={{
                    width: 22, height: 6, borderRadius: 999,
                    background: w ? CD.green : CD.red,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: CD.ink3, marginTop: 6 }}>Last 5</div>
            </div>
          </div>

          {/* vs */}
          <div className="serif cd-pop-in cd-d-300" style={{ fontSize: 48, color: CD.terracotta, fontStyle: 'italic' }}>vs</div>

          {/* Opp */}
          <div className="cd-slide-in-r" style={{ textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <AvatarOpponent size={120} ring={CD.ink4} />
              <div className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 12 }}>Marina K.</div>
              <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>Elo <span className="num" style={{ color: CD.ink }}>1,284</span></div>
              <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
                {[true, false, true, true, true].map((w, i) => (
                  <span key={i} style={{
                    width: 22, height: 6, borderRadius: 999,
                    background: w ? CD.green : CD.red,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: CD.ink3, marginTop: 6 }}>Last 5</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 32,
                      padding: '14px 24px', background: CD.paper, border: `1px solid ${CD.rule}`, borderRadius: 14 }}>
          <span style={{ fontSize: 12, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Playstyle hint</span>
          <span style={{ fontSize: 14, color: CD.ink2 }}>Marina leans <b style={{ color: CD.ink }}>aggressive · discount-heavy</b>.</span>
        </div>

        <div style={{ marginTop: 32 }}>
          <PillBtn variant="solid" color={CD.terracotta} size="lg">
            Begin Round 1 <span style={{ opacity: 0.6 }}>→</span>
          </PillBtn>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 18 }}>
      <CoachBubble label="Prof. Aldo · The bell">
        She'll come out swinging — discounters always do. Don't match her first move out of fear. Read the demand, then commit.
      </CoachBubble>
    </div>
  </div>
);

// ----- POST-MATCH -----

const CafePostmatch = () => {
  const youWon = true;
  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '40px 36px',
      }}>
        <CoffeeBackdrop opacity={0.05} height={200} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div className="tab">Match · Coffee Shop · 8 rounds</div>
          <h1 className="serif" style={{ fontSize: 64, color: CD.ink, marginTop: 4, lineHeight: 1, fontStyle: 'italic' }}>
            {youWon ? 'You won the morning.' : 'Marina took it.'}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 16,
                        padding: '6px 14px', background: youWon ? CD.terraSoft : CD.paper,
                        border: `1px solid ${youWon ? CD.terracotta : CD.rule}`, borderRadius: 999 }}>
            <span className="num serif" style={{ fontSize: 22, color: CD.terracotta }}>+24</span>
            <span style={{ fontSize: 13, color: CD.ink2 }}>Elo · now <b className="num" style={{ color: CD.ink }}>1,350</b></span>
          </div>
        </div>

        {/* Final standings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 32 }}>
          <div style={{ background: CD.cardstock, border: `1px solid ${youWon ? CD.terracotta : CD.rule}`,
                        borderRadius: 14, padding: 20, boxShadow: youWon ? `0 0 0 3px ${CD.terraSoft}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AvatarPlayer size={64} ring={CD.terracotta} />
              <div>
                <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>You</div>
                <div className="serif" style={{ fontSize: 26, color: CD.ink }}>Final cash</div>
              </div>
              <div className="num serif" style={{ marginLeft: 'auto', fontSize: 40, color: CD.ink }}>$5,820</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${CD.rule}` }}>
              <Stat label="Rounds won" value="5" />
              <Stat label="Best round" value="+$1.2k" />
              <Stat label="Avg price" value="438¢" />
            </div>
          </div>
          <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AvatarOpponent size={64} ring={CD.ink4} />
              <div>
                <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Marina K.</div>
                <div className="serif" style={{ fontSize: 26, color: CD.ink }}>Final cash</div>
              </div>
              <div className="num serif" style={{ marginLeft: 'auto', fontSize: 40, color: CD.ink2 }}>$4,140</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${CD.rule}` }}>
              <Stat label="Rounds won" value="3" />
              <Stat label="Best round" value="+$680" />
              <Stat label="Avg price" value="371¢" />
            </div>
          </div>
        </div>

        {/* Trajectory */}
        <div style={{ marginTop: 22, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14, padding: 20 }}>
          <div className="tab" style={{ marginBottom: 12 }}>Cash trajectory · 8 rounds</div>
          <CashLine you={[3000, 3450, 3200, 3700, 4250, 4900, 5400, 5820]}
                    opp={[3000, 3520, 3680, 3450, 3920, 3850, 4050, 4140]} />
          <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 12, color: CD.ink2 }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: CD.ink, marginRight: 6, verticalAlign: 'middle' }} /> You</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: CD.terracotta, marginRight: 6, verticalAlign: 'middle' }} /> Marina</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
          <PillBtn variant="solid" color={CD.terracotta} size="lg">Play again →</PillBtn>
          <PillBtn variant="outline" color={CD.ink}>Rematch Marina</PillBtn>
          <PillBtn variant="ghost" color={CD.ink3}>Back to lobby</PillBtn>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · Debrief">
          Round 5 is what won it for you. You stopped trying to win on price and won on perception. That's the lesson — write it down.
        </CoachBubble>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    <div className="num" style={{ fontSize: 18, color: CD.ink, marginTop: 2, fontWeight: 600 }}>{value}</div>
  </div>
);

const CashLine = ({ you, opp }) => {
  const W = 600, H = 100, pad = 4;
  const all = [...you, ...opp];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const toPath = (arr) => arr.map((v, i) => {
    const x = pad + (i / (arr.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <path d={toPath(opp)} stroke={CD.terracotta} strokeWidth="1.8" fill="none" />
      <path d={toPath(you)} stroke={CD.ink} strokeWidth="2" fill="none" />
      {you.map((v, i) => {
        const x = pad + (i / (you.length - 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={CD.ink} />;
      })}
      {opp.map((v, i) => {
        const x = pad + (i / (opp.length - 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={CD.terracotta} />;
      })}
    </svg>
  );
};

// ----- TUTORIAL (R1 decide with coach overlay + highlighted card) -----

const CafeTutorial = () => {
  const you = { name: 'You', cash: 5000, trend: [5000] };
  const opp = { name: 'Coach Aldo (Practice)', elo: 1000, price: 400, locked: false };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28, position: 'relative' }}>
      <MatchBar round={1} total={3} timer="no timer" you={you} opp={opp} />

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · Turn 1">
          Welcome. First match — I'll walk you through. Every round, you pick up to 3 moves from your hand. Let's start with the simplest one: <i>Set price</i>.
        </CoachBubble>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginTop: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="tab">Your hand · Tutorial Round 1</div>
              <h2 className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 2 }}>Try setting a price</h2>
            </div>
            <DomainTabs active="sales" />
          </div>

          {/* Single highlighted card */}
          <div style={{ position: 'relative' }}>
            {/* Hand-drawn arrow & circle around the card */}
            <svg viewBox="0 0 800 220" style={{ position: 'absolute', left: -40, top: -30, width: 'calc(100% + 80px)', height: 280, pointerEvents: 'none', zIndex: 1 }}>
              <path d="M 40 40 C 80 20, 720 20, 760 40 C 800 100, 800 180, 720 220 C 600 240, 200 240, 80 220 C 20 180, 20 100, 40 40 Z"
                    stroke={CD.terracotta} strokeWidth="2.4" fill="none" strokeDasharray="6 6" opacity="0.7" />
            </svg>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <InlineMoveCard cardId="set-price"
                              state={{ price: 425 }}
                              onChange={() => {}}
                              onAdd={() => {}}
                              drafted={false} />
            </div>
          </div>

          {/* Faded other cards */}
          <div style={{ marginTop: 14, opacity: 0.4, pointerEvents: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <InlineMoveCard cardId="flash-sale"    state={{ cut: 15 }}    onChange={() => {}} onAdd={() => {}} />
              <InlineMoveCard cardId="premium-blend" state={{ price: 650 }} onChange={() => {}} onAdd={() => {}} />
            </div>
          </div>
        </div>

        <div style={{
          background: CD.cardstock, border: `1px solid ${CD.terracotta}`,
          boxShadow: `0 0 0 3px ${CD.terraSoft}`,
          borderRadius: 16, padding: 18,
        }}>
          <div className="tab" style={{ color: CD.terracotta }}>Coach's nudge</div>
          <h3 className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 4, lineHeight: 1.2 }}>
            Drag the slider, then draft.
          </h3>
          <p style={{ fontSize: 13, color: CD.ink2, marginTop: 8, lineHeight: 1.5 }}>
            Move the slider to set your price. Below 400¢ is cheap. Above 500¢ is premium. Drafting just adds the move to your picks — you can still revise.
          </p>
          <div style={{ marginTop: 12, padding: '10px 12px', background: CD.cream, borderRadius: 10, fontSize: 12, color: CD.ink2 }}>
            <b style={{ color: CD.ink }}>Goal:</b> draft one move and lock the round.
          </div>
          <PillBtn variant="ghost" color={CD.ink3} size="sm">Skip tutorial</PillBtn>
        </div>
      </div>
    </div>
  );
};

// ----- PROFILE -----

const CafeProfile = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>

    <div style={{
      marginTop: 16, position: 'relative', overflow: 'hidden',
      background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '32px 28px',
    }}>
      <CoffeeBackdrop opacity={0.05} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22 }}>
        <AvatarPlayer size={112} ring={CD.terracotta} />
        <div style={{ flex: 1 }}>
          <div className="tab">Profile</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1 }}>You</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 13, color: CD.ink2 }}>
            <span><span style={{ color: CD.ink3 }}>joined </span>Apr 2026</span>
            <span style={{ color: CD.ink3 }}>·</span>
            <span><span style={{ color: CD.ink3 }}>playstyle </span><b style={{ color: CD.ink }}>balanced · patient</b></span>
            <span style={{ color: CD.ink3 }}>·</span>
            <span><span style={{ color: CD.ink3 }}>main </span><b style={{ color: CD.ink }}>Coffee Shop</b></span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="tab">Elo</div>
          <div className="num serif" style={{ fontSize: 64, color: CD.ink, lineHeight: 1, marginTop: 2 }}>1,326</div>
          <div style={{ fontSize: 12, color: CD.green, marginTop: 2 }}>+42 last week</div>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginTop: 22 }}>
      {/* History */}
      <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 20 }}>
        <div className="tab" style={{ marginBottom: 12 }}>Match history</div>
        <div style={{ display: 'grid', gap: 8 }}>
          <RecentMatch won  opp="Marina K." score="$5,120 vs $3,890 · 8 rounds" delta={+18} />
          <RecentMatch won  opp="Ben (CPU · Hard)" score="$4,640 vs $4,210" delta={+12} />
          <RecentMatch     opp="Wren O." score="$2,950 vs $4,830 · forfeited R6" delta={-24} />
          <RecentMatch won  opp="Sasha B." score="$5,890 vs $4,110" delta={+15} />
          <RecentMatch won  opp="Marina K." score="$4,980 vs $4,210" delta={+14} />
          <RecentMatch     opp="Dom V." score="$3,810 vs $4,920" delta={-19} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 20 }}>
          <div className="tab" style={{ marginBottom: 12 }}>Highlights</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Stat label="Wins" value="24" />
            <Stat label="Losses" value="9" />
            <Stat label="Streak" value="3" />
            <Stat label="Best margin" value="$2,140" />
            <Stat label="Avg round" value="+$280" />
            <Stat label="Favourite move" value="Premium blend" />
          </div>
        </div>

        <CoachBubble label="Prof. Aldo · Read on you">
          You hold pricing nerve well — but you forfeit on bad luck more than you should. One bad round isn't a match. Stay in.
        </CoachBubble>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  CafeLobby, CafeScenario, CafeQueue, CafeBriefing, CafePostmatch, CafeTutorial, CafeProfile,
});
