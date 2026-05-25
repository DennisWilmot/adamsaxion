// First-match onboarding — Decide screen with a guided 3-action turn overlay.

const TutorialDecide = () => (
  <div style={{ position: 'relative' }}>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Tutorial · your first turn · round 1 of 8</div>
        <h2>Coach mode is on.</h2>
        <div className="step-hint" style={{ margin: 0 }}>We suggest 3 moves to start. You can accept, swap any of them, or pick your own.</div>
      </div>
      <Chip kind="accent">guided turn</Chip>
    </div>

    {/* state strip with coach annotation */}
    <div className="wf-card tinted" style={{ position: 'relative', padding: '10px 14px' }}>
      <div className="wf-row wrap" style={{ gap: 10, alignItems: 'center' }}>
        <span className="eyebrow" style={{ margin: 0 }}>You</span>
        <Chip kind="ghost"><span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>CASH</span>&nbsp;$500</Chip>
        <Chip kind="ghost"><span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>PRICE</span>&nbsp;$4.00</Chip>
        <Chip kind="ghost"><span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>STAFF</span>&nbsp;2</Chip>
        <Chip kind="ghost"><span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>REP</span>&nbsp;New</Chip>
        <Btn kind="ghost">more state ▾</Btn>
      </div>
      {/* coach pin: state strip */}
      <div style={{ position: 'absolute', top: -8, right: 16, transform: 'rotate(2deg)' }}>
        <CoachPin>① your state · what you have right now</CoachPin>
      </div>
    </div>

    {/* domains + suggested actions */}
    <div className="wf-row" style={{ alignItems: 'flex-start', gap: 14, marginTop: 14, position: 'relative' }}>
      {/* domain rail */}
      <div className="wf-col" style={{ flex: '0 0 180px', gap: 6, position: 'relative' }}>
        {['Operations','Sales','Marketing','HR','R&D','Finance'].map((d, i) => (
          <div key={d} className={`wf-card ${i === 1 ? 'accent' : ''}`} style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>{d}</span>
            {(i === 1 || i === 3) && <Chip kind="ghost">●</Chip>}
          </div>
        ))}
        <div style={{ position: 'absolute', left: -180, top: 60, width: 170 }}>
          <CoachPin>② six domains · pick across them or focus one</CoachPin>
        </div>
      </div>

      {/* action cards — 3 suggested */}
      <div className="wf-col" style={{ flex: 1, gap: 10 }}>
        <div className="wf-card accent" style={{ padding: 12 }}>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4>Suggested for your first turn</h4>
            <span className="step-hint" style={{ margin: 0, fontSize: 12 }}>tap a card to swap it for something else</span>
          </div>
          <div className="wf-col" style={{ gap: 8, marginTop: 8 }}>
            <TutorialCard dom="Sales"     name="Hold price at $4.00" why="Default. Don't move price round 1 — you don't know what your rival will do yet." />
            <TutorialCard dom="HR"        name="Train staff"           why="Pays off in 2 rounds. Cheap and durable." cost="-$25" />
            <TutorialCard dom="Marketing" name="Local ad"               why="Pulls foot traffic for one round. Safe to test demand." cost="-$30" />
          </div>
          <div className="wf-row" style={{ marginTop: 10, gap: 8, justifyContent: 'flex-end' }}>
            <Btn kind="ghost">Pick my own instead</Btn>
            <Btn kind="primary" className="big">Accept all 3 · review</Btn>
          </div>
        </div>

        {/* a regular action card behind, dimmed, to show "you can browse" */}
        <div className="wf-card" style={{ opacity: 0.55, padding: 10 }}>
          <DomBadge d="Operations" />
          <h4 style={{ marginTop: 4 }}>Upgrade equipment</h4>
          <div className="step-hint" style={{ margin: 0 }}>-$200 upfront · slow effect</div>
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 11, fontStyle: 'italic' }}>not suggested this round — too expensive for a first turn</div>
        </div>
      </div>

      {/* plan rail */}
      <div className="wf-col" style={{ flex: '0 0 220px', position: 'relative' }}>
        <div className="wf-card" style={{ borderWidth: 2, padding: 12 }}>
          <div className="eyebrow">Your plan · 3 / 3</div>
          {['Hold price at $4.00','Train staff','Local ad'].map((n, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < 2 ? '1px dashed var(--ink-3)' : 'none' }}>
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{n}</div>
              <div className="step-hint" style={{ margin: 0, fontSize: 11 }}>swap →</div>
            </div>
          ))}
          <Btn kind="primary" style={{ width: '100%', marginTop: 10 }}>Review &amp; submit</Btn>
        </div>
        <div style={{ position: 'absolute', right: -10, top: -12 }}>
          <CoachPin>③ your 3 slots fill up here as you pick</CoachPin>
        </div>
      </div>
    </div>

    {/* progress strip at bottom */}
    <div className="wf-card" style={{ marginTop: 14, background: 'var(--paper-2)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="wf-row" style={{ gap: 8, alignItems: 'center' }}>
          <Chip kind="accent">Coach</Chip>
          <span style={{ fontFamily: "'Kalam',cursive", fontSize: 14 }}>step 3 of 5 — picking actions</span>
        </div>
        <div className="wf-row" style={{ gap: 6 }}>
          <Chip kind="good">✓ state strip</Chip>
          <Chip kind="good">✓ domains</Chip>
          <Chip kind="accent">⦿ pick 3</Chip>
          <Chip kind="ghost">○ review</Chip>
          <Chip kind="ghost">○ submit</Chip>
        </div>
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn kind="ghost">Skip coach (Pro)</Btn>
        </div>
      </div>
    </div>

    <div className="step-hint" style={{ marginTop: 10, fontStyle: 'italic' }}>
      Coach disappears after match 1. Optional "Show coach again" toggle in Settings.
      After R1 resolves, the Results screen shows a "what just happened" walk-through too.
    </div>
  </div>
);

const CoachPin = ({ children }) => (
  <div style={{
    background: 'var(--accent)', color: '#fff', padding: '6px 10px',
    borderRadius: 10, fontFamily: "'Caveat',cursive", fontWeight: 700,
    fontSize: 15, boxShadow: '2px 3px 0 rgba(0,0,0,.12)', maxWidth: 220,
    border: '2px solid #fff',
  }}>{children}</div>
);

const TutorialCard = ({ dom, name, why, cost }) => (
  <div className="wf-card" style={{ padding: 10, background: 'var(--paper)' }}>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <div className="wf-row" style={{ gap: 8, alignItems: 'baseline' }}>
        <DomBadge d={dom} />
        <h4 style={{ marginBottom: 0 }}>{name}</h4>
      </div>
      {cost && <Chip kind="warm">{cost}</Chip>}
    </div>
    <div style={{ marginTop: 4, fontFamily: "'Patrick Hand',cursive", fontSize: 14, color: 'var(--ink-2)' }}>
      <b style={{ color: 'var(--accent)' }}>Why:</b> {why}
    </div>
  </div>
);

window.TutorialDecide = TutorialDecide;
