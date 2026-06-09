// Submitted / waiting state — 2 directions.

const SubmittedA = () => (
  <>
    <div className="wf-card good">
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--good)' }}>✓ Submitted</div>
          <h2>Round 5 locked in</h2>
          <div className="step-hint" style={{ margin: '4px 0 0' }}>You can't change your moves until the round resolves.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num">14:08:22</div>
          <div className="stat-label">until timer expires</div>
        </div>
      </div>

      <div className="wf-row" style={{ marginTop: 14, gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Opponent</div>
          <div className="opp"><div className="av">MO</div><div><div className="name">Marina Okafor</div><div className="elo">submitting…</div></div></div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="step-hint" style={{ margin: 0 }}>Waiting on Marina to submit</div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--paper-2)', overflow: 'hidden', marginTop: 6, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, var(--accent) 0 8px, var(--accent-soft) 8px 16px)', width: '60%' }} />
          </div>
        </div>
        <Btn kind="ghost">Notify me when she submits</Btn>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Your locked plan</div>
        {[
          { dom: 'Sales', a: 'Change price to $4.00', sub: 'public · persists' },
          { dom: 'HR',    a: 'Train staff (service)', sub: 'private · resolves R7' },
          { dom: 'Marketing', a: 'Set ad budget · $40', sub: 'private · effect on traffic R5' },
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
        <div className="step-hint" style={{ marginTop: 8 }}>price will change from $4.25 → $4.00 if she submits something compatible</div>
      </div>

      <div className="wf-col">
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
            <Chip kind="ghost">⛅ Look up tomorrow's weather</Chip>
            <Chip kind="ghost">↩ Back to lobby</Chip>
          </div>
        </div>
      </div>
    </div>
  </>
);

// Variant: minimal "locked in" view
const SubmittedB = () => (
  <div className="wf-col" style={{ alignItems: 'stretch', gap: 14 }}>
    <div className="wf-card" style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--good)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--good)' }}>✓</div>
      <h2 style={{ marginTop: 10 }}>Round 5 submitted</h2>
      <div className="step-hint" style={{ margin: 0 }}>Now waiting on Marina · ⏱ 14h 08m left</div>
      <div className="wf-row" style={{ gap: 12, justifyContent: 'center', marginTop: 18 }}>
        <Btn>Review my plan</Btn>
        <Btn kind="primary">Back to games</Btn>
      </div>
    </div>

    <div className="wf-card">
      <div className="eyebrow">If she doesn't submit</div>
      <div className="step-hint" style={{ margin: 0 }}>Engine uses her previous settings (autopilot). Round still resolves on timer.</div>
      <Btn kind="ghost" style={{ marginTop: 10 }}>What is autopilot?</Btn>
    </div>
  </div>
);

window.SubmittedOptions = [
  { tag: 'A', title: 'Active "watch tower"',  why: 'Locked plan visible, opponent progress bar, jump to other games.', Body: SubmittedA },
  { tag: 'B', title: 'Quiet confirmation',     why: 'Big check, get out fast. Mobile-friendly minimal.',               Body: SubmittedB },
];
