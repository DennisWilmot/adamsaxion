// Margin — entry & onboarding screens.
//   Catalog (/play · Margin card)  ·  Tutorial bootstrap (guided first turn)

// ── games catalog — /play ──────────────────────────────────────────────────
const Catalog = () => (
  <div className="mt" style={{ background: T.paper, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', background: T.paper2, borderBottom: `1px solid ${T.rule}` }}>
      <Wordmark />
      <span style={{ marginLeft: 4, fontSize: 12, color: T.ink3 }}>/ play</span>
      <div style={{ flex: 1 }} />
      <AvPlayer size={32} />
    </div>
    <div style={{ padding: '26px 24px 32px' }}>
      <RouteTag route="/play" panel="games-catalog" />
      <Eyebrow>Games</Eyebrow>
      <h1 className="serif" style={{ fontSize: 30, color: T.ink, fontWeight: 700, marginTop: 4, marginBottom: 16 }}>Pick something to play.</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {/* Price War — live */}
        <div className="mt-tile mt-press" style={{ background: T.card, border: `1px solid ${T.blueLine}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 0 0 3px #e8f0ff' }}>
          <div style={{ height: 120, background: 'radial-gradient(120% 100% at 30% 0%, #dCe8fb, #eef1f6)', display: 'grid', placeItems: 'center', borderBottom: `1px solid ${T.rule}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><AvPlayer size={48} /><span className="serif" style={{ fontSize: 22, color: T.ink4 }}>vs</span><AvOpp size={48} /></div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="serif" style={{ fontSize: 20, color: T.ink, fontWeight: 700 }}>Price War</h3>
              <Pill tone="green">Live</Pill>
            </div>
            <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.45, margin: '6px 0 12px' }}>Open a shop across the street from a rival. Most profit after 8 rounds wins.</p>
            <Btn kind="primary" size="md" full>Open →</Btn>
          </div>
        </div>
        {/* coming soon */}
        {[['Tech Startup', 'Reach product-market fit or burn out.'], ['Family Farm', 'Survive the season — weather, supply, the co-op.']].map((g, i) => (
          <div key={i} style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 16, overflow: 'hidden', opacity: .82 }}>
            <div style={{ height: 120, background: 'repeating-linear-gradient(45deg,#eef1f6,#eef1f6 9px,#e7ebf2 9px,#e7ebf2 18px)', display: 'grid', placeItems: 'center', borderBottom: `1px solid ${T.rule}` }}>
              <span className="mono" style={{ fontSize: 12, color: T.ink3 }}>cover art</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="serif" style={{ fontSize: 20, color: T.ink2, fontWeight: 700 }}>{g[0]}</h3>
                <Pill tone="ink">soon</Pill>
              </div>
              <p style={{ fontSize: 13, color: T.ink3, lineHeight: 1.45, margin: '6px 0 12px' }}>{g[1]}</p>
              <Btn kind="ghost" size="md" full>♡ Notify me</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── tutorial bootstrap — guided first turn ─────────────────────────────────
const CoachPin = ({ children }) => (
  <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 7, background: T.blue, color: '#fff', padding: '7px 11px', borderRadius: 11, fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, maxWidth: 210, boxShadow: '0 8px 20px -10px rgba(10,82,196,.6)' }}>
    <span style={{ flex: '0 0 auto', opacity: .8 }}>↘</span>{children}
  </div>
);

const TutorialBoot = () => (
  <MatchShell opp="Coach" round={1} total={8}
    tag={<RouteTag route="/play/price-war/tutorial" phase="tutorial → match" panel="tutorial-decide" />}>
    <div style={{ width: 372, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CoachBubble>Welcome. I’ll suggest three moves for your first turn — accept them, swap any, or pick your own. Don’t move price round one.</CoachBubble>
      <Panel pad={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Eyebrow>Your state</Eyebrow>
          <CoachPin>① what you have right now</CoachPin>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['Cash', '$500'], ['Price', '400¢'], ['Staff', '2'], ['Rep', 'New']].map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline', padding: '5px 10px', borderRadius: 999, background: T.paper2, border: `1px solid ${T.rule}` }}>
              <span className="eyebrow">{s[0]}</span><span className="mono" style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{s[1]}</span>
            </span>
          ))}
        </div>
      </Panel>
    </div>
    <div style={{ width: 432, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel pad={16} style={{ border: `1px solid ${T.blueLine}`, boxShadow: '0 0 0 3px #e8f0ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow style={{ color: T.blue }}>Suggested for your first turn</Eyebrow>
          <span style={{ fontSize: 11.5, color: T.ink3 }}>tap to swap</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {[['sales', 'Hold price at 400¢', 'Don’t move price round 1 — you don’t know Morgan’s plan yet.', null],
            ['people', 'Train staff', 'Pays off in 2 rounds. Cheap and durable.', '−$25'],
            ['promo', 'Local ad', 'Pulls foot traffic for one round. Safe to test demand.', '−$30']].map((m, i) => (
            <div key={i} style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderLeft: `4px solid ${T.d[m[0]].c}`, borderRadius: 11, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Glyph kind={T.d[m[0]].glyph} c={T.d[m[0]].c} size={15} /><span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{m[1]}</span></div>
                {m[3] && <span className="mono" style={{ fontSize: 12, color: T.ink3 }}>{m[3]}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.4, marginTop: 5 }}><b style={{ color: T.blue }}>Why:</b> {m[2]}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Btn kind="ghost" size="md">Pick my own</Btn>
          <Btn kind="primary" size="md">Accept all 3 · review</Btn>
        </div>
      </Panel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.card, border: `1px solid ${T.rule}`, borderRadius: 12 }}>
        <Pill tone="blue">Coach</Pill>
        <span style={{ fontSize: 13, color: T.ink2 }}>step 3 of 5 — picking actions</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {['✓', '✓', '⦿', '○', '○'].map((d, i) => <span key={i} style={{ fontSize: 12, color: i < 2 ? T.green : i === 2 ? T.blue : T.ink4 }}>{d}</span>)}
        </div>
      </div>
    </div>
    <div style={{ width: 300 }}>
      <Panel pad={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>Your plan · 3 / 3</Eyebrow>
          <CoachPin>③ slots fill here</CoachPin>
        </div>
        <div style={{ marginTop: 10 }}>
          {['Hold price at 400¢', 'Train staff', 'Local ad'].map((n, i) => (
            <div key={i} style={{ padding: '9px 0', borderBottom: i < 2 ? `1px dashed ${T.rule}` : 'none' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{n}</div>
              <div className="mono" style={{ fontSize: 11, color: T.ink3, marginTop: 1 }}>swap →</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}><Btn kind="primary" size="md" full>Review &amp; submit</Btn></div>
        <p style={{ fontSize: 11.5, color: T.ink3, lineHeight: 1.5, marginTop: 12, fontStyle: 'italic' }}>Coach disappears after match 1. Re-enable any time in Settings.</p>
      </Panel>
    </div>
  </MatchShell>
);

Object.assign(window, { Catalog, TutorialBoot, CoachPin });
