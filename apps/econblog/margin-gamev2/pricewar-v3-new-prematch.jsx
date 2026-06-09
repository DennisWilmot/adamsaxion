// Pre-match flow — Scenario select (v1 single-scenario), Matchmaking, Rematch.

// ── Scenario select — Coffee Shop is the only unlocked scenario in v1 ───────
const SCENARIOS = [
  { id: 'coffee', name: 'Coffee Shop', tag: 'v1', unlocked: true,
    obj: 'Highest profit after 8 rounds', length: '8 rounds · 24h/round',
    difficulty: 'Approachable',
    pitch: 'You and a rival both open a shop on the same block. Same foot traffic, same base costs. Everything else is your move.',
    domains: ['Sales','Operations','HR','Marketing'],
    color: '#fff8ec', accent: 'var(--accent)' },
  { id: 'tech', name: 'Tech Startup', tag: 'soon', unlocked: false,
    obj: 'Reach product-market fit or burn out',
    length: '12 rounds · runway pressure',
    difficulty: 'Advanced',
    pitch: 'You raised a seed. So did your competitor. Spend it on growth or runway?',
    domains: ['Product','Hiring','Marketing','Finance'],
    color: '#f3eafe' },
  { id: 'farm', name: 'Family Farm', tag: 'soon', unlocked: false,
    obj: 'Survive the season',
    length: '16 rounds · seasonal cycle',
    difficulty: 'Patient',
    pitch: 'Weather. Supply chains. The co-op down the road. Long horizons reward steady hands.',
    domains: ['Crop mix','Equipment','Labor','Hedging'],
    color: '#eaf5e8' },
  { id: 'dev', name: 'Developing Nation', tag: 'soon', unlocked: false,
    obj: 'Lift GDP without inflation spiraling',
    length: '20 rounds · macro feedback',
    difficulty: 'Hard',
    pitch: 'You\'re a finance minister. Across the border, another. Trade, tariffs, currency — every move has neighbors.',
    domains: ['Trade','Currency','Fiscal','Social'],
    color: '#fdeef0' },
];

const ScenarioSelect = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">New match · step 1 of 2</div>
        <h2>Pick a scenario.</h2>
        <div className="step-hint" style={{ margin: 0 }}>v1 ships with Coffee Shop. Three more in development — your wins here carry over.</div>
      </div>
      <Btn kind="ghost">← Lobby</Btn>
    </div>

    <div className="wf-grid cols-2">
      {SCENARIOS.map((s, i) => {
        const featured = s.unlocked;
        return (
          <div key={s.id} className={`wf-card ${featured ? 'accent' : ''}`} style={{
            background: featured ? s.color : 'var(--paper-2)',
            opacity: s.unlocked ? 1 : 0.78,
            position: 'relative',
          }}>
            <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: 24 }}>{s.name}</h3>
              {s.unlocked ? <Chip kind="accent">v1 · available</Chip> : <Chip kind="ghost">🔒 coming soon</Chip>}
            </div>
            <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, lineHeight: 1.45, marginTop: 6 }}>{s.pitch}</p>

            <div className="wf-grid cols-2" style={{ gap: 8, marginTop: 8 }}>
              <KV k="Objective" v={s.obj} />
              <KV k="Length" v={s.length} />
              <KV k="Difficulty" v={s.difficulty} />
              <KV k="Domains" v={s.domains.slice(0, 3).join(' · ') + (s.domains.length > 3 ? '…' : '')} />
            </div>

            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--ink-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {s.unlocked ? (
                <>
                  <Chip kind="ghost">~22 min total · async OK</Chip>
                  <Btn kind="primary" className="big">Find opponent →</Btn>
                </>
              ) : (
                <>
                  <span className="step-hint" style={{ margin: 0, fontSize: 12 }}>Notify me when this scenario launches</span>
                  <Btn kind="ghost">♡ Watch</Btn>
                </>
              )}
            </div>

            {!s.unlocked && (
              <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'Caveat',cursive", color: 'var(--ink-3)', fontSize: 13, transform: 'rotate(8deg)' }}>
                in design
              </div>
            )}
          </div>
        );
      })}
    </div>

    <div className="step-hint" style={{ marginTop: 12, fontStyle: 'italic' }}>
      Layout scales: when 2+ scenarios unlock, this becomes a horizontal carousel; the "in design" tile collapses to a single "More scenarios" card.
    </div>
  </>
);

// ── Matchmaking queue — searching state with Elo range + cancel ─────────────
const MatchmakingQueue = () => {
  const targetElo = 1266;
  const range = 80;
  return (
    <>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <div className="eyebrow">New match · step 2 of 2</div>
          <h2>Looking for an opponent…</h2>
        </div>
        <Btn kind="ghost">← Pick scenario</Btn>
      </div>

      <div className="wf-card" style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--paper-2)' }}>
        {/* searching animation — spinner with notebook texture */}
        <div style={{ fontSize: 64, fontFamily: "'Caveat',cursive", color: 'var(--accent)', letterSpacing: '0.25em', lineHeight: 1 }}>· · ·</div>
        <h3 style={{ marginTop: 8 }}>Matchmaking in the Coffee Shop pool</h3>
        <div className="step-hint" style={{ margin: '4px 0 0' }}>your Elo <b>{targetElo}</b> · matching ±{range}</div>

        {/* Elo range visualization */}
        <div style={{ marginTop: 18, position: 'relative', width: 480, maxWidth: '100%', height: 44, marginInline: 'auto' }}>
          <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, background: '#ded6c5', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 18, left: '20%', width: '60%', height: 4, background: 'var(--accent)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 8, left: 'calc(50% - 12px)', width: 24, height: 24, background: 'var(--accent)', borderRadius: 12, border: '2.5px solid var(--ink)' }} />
          <div style={{ position: 'absolute', top: 30, left: '20%', fontSize: 11, fontFamily: "'Patrick Hand',cursive", color: 'var(--ink-3)' }}>{targetElo - range}</div>
          <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontFamily: "'Kalam',cursive", color: 'var(--accent)', fontWeight: 700 }}>you · {targetElo}</div>
          <div style={{ position: 'absolute', top: 30, right: '20%', fontSize: 11, fontFamily: "'Patrick Hand',cursive", color: 'var(--ink-3)' }}>{targetElo + range}</div>
        </div>

        <div className="wf-row" style={{ justifyContent: 'center', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
          <KV k="Searching for" v="0:12" />
          <KV k="Avg. wait at this hour" v="~45s" />
          <KV k="Pool size right now" v="24 players" />
        </div>

        <div className="wf-row" style={{ justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <Btn kind="ghost">Expand range to ±150 after 1 min</Btn>
          <Btn kind="warm">Cancel search</Btn>
        </div>
      </div>

      <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">If no match in 90s</div>
          <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>We'll widen the Elo range, then offer to queue you for a <b>delayed match</b> — push notification when an opponent appears so you can leave the app.</p>
          <Chip kind="ghost">delayed match opt-in</Chip>
        </div>
        <div className="wf-card">
          <div className="eyebrow">Or play against the engine</div>
          <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>Bot match doesn't affect Elo. Good for warming up between humans.</p>
          <Btn kind="ghost">Play bot at your level</Btn>
        </div>
      </div>
    </>
  );
};

// ── Rematch flow — challenge sent, awaiting opponent's accept ───────────────
const Rematch = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">After post-match</div>
        <h2>Rematch requested.</h2>
      </div>
      <Btn kind="ghost">← Lobby</Btn>
    </div>

    <div className="wf-card accent" style={{ textAlign: 'center', padding: 24 }}>
      <div className="wf-row" style={{ justifyContent: 'center', gap: 18, alignItems: 'center' }}>
        <div className="av lg">YOU</div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: 32, color: 'var(--ink-3)' }}>↔</div>
        <div className="av lg" style={{ background: '#f3e9d4' }}>MO</div>
      </div>
      <h3 style={{ marginTop: 10 }}>Waiting for Marina to accept</h3>
      <div className="step-hint" style={{ margin: '4px 0 0' }}>sent 38s ago · expires in <b>23h 59m</b></div>

      <div className="wf-row" style={{ justifyContent: 'center', gap: 10, marginTop: 18 }}>
        <Btn kind="ghost">Cancel rematch</Btn>
        <Btn kind="ghost">Find new opponent instead</Btn>
      </div>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">If accepted</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>Round 1 unlocks immediately. New 8-round match · fresh state for both.</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">If declined</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>You'll see "Marina passed — find a new opponent?" with one tap to matchmaking.</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">If they ignore</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>After 24h the request expires and rolls into your notification list as "challenge expired."</p>
      </div>
    </div>

    <div className="wf-card" style={{ marginTop: 12, background: 'var(--paper-2)' }}>
      <div className="eyebrow">Decision flow</div>
      <div className="wf-row wrap" style={{ gap: 10, marginTop: 8, alignItems: 'center', fontFamily: "'Patrick Hand',cursive", fontSize: 13 }}>
        <Chip>Post-match · Rematch tapped</Chip>
        <span>→</span>
        <Chip kind="accent">request sent</Chip>
        <span>→</span>
        <Chip kind="ghost">accepted → new match</Chip>
        <span>or</span>
        <Chip kind="ghost">declined → matchmaking</Chip>
        <span>or</span>
        <Chip kind="ghost">expired → notification</Chip>
      </div>
    </div>
  </>
);

Object.assign(window, { ScenarioSelect, MatchmakingQueue, Rematch });
