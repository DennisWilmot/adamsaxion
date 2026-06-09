// Margin — TERMINAL states + OVERLAYS.
//   Post-match (win / loss), Bankruptcy (dramatic / clinical), Abandonment.
//   Overlays drawn over a dimmed match: opponent disconnected, forfeit confirm,
//   error modals (already-in-match, forbidden). Plus the Austerity decide variant.

// ── shared: small two-line trajectory chart (you=blue, opp=slate dashed) ───
const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8];
const TrajChart = ({ title, you, opp, fmt = (v) => v, ticks, pivot = 4, sub }) => {
  const W = 360, H = 132, pad = 30;
  const all = [...you, ...opp];
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const x = (i) => pad + (i * (W - pad - 12)) / (you.length - 1);
  const y = (v) => H - pad + 2 - ((v - min) / span) * (H - pad - 18);
  const path = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  return (
    <Panel pad={16}>
      <Eyebrow>{title}</Eyebrow>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', marginTop: 6 }}>
        <rect x={x(pivot - 1) - 13} y={4} width={26} height={H - pad} fill="#fdf0d8" />
        <line x1={pad - 4} y1={H - pad + 2} x2={W - 6} y2={H - pad + 2} stroke={T.rule} strokeWidth="1.2" />
        <path d={path(opp)} stroke={T.ink3} strokeWidth="2" fill="none" strokeDasharray="4 3" />
        <path d={path(you)} stroke={T.blue} strokeWidth="2.4" fill="none" />
        {you.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={T.blue} />)}
        {ticks && ticks.map((t, i) => <text key={i} x={2} y={y(t) + 4} fontSize="10" fill={T.ink3} fontFamily="JetBrains Mono">{fmt(t)}</text>)}
        {ROUNDS.map((r, i) => <text key={r} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill={T.ink3} fontFamily="JetBrains Mono">R{r}</text>)}
        <text x={x(pivot - 1)} y={16} textAnchor="middle" fontSize="10" fill="#9a6b12" fontFamily="JetBrains Mono" fontWeight="600">turning point</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: T.ink2 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 14, height: 3, background: T.blue }} /> You</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 14, borderTop: `2px dashed ${T.ink3}` }} /> Morgan</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: T.ink3, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>}
    </Panel>
  );
};

const OutcomeBanner = ({ tone, eyebrow, title, sub, stat, statLabel }) => {
  const bg = tone === 'win' ? T.blueSoft : tone === 'loss' ? T.redSoft : T.paper2;
  const bd = tone === 'win' ? T.blueLine : tone === 'loss' ? '#f3c0c0' : T.rule;
  return (
    <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 16, padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="serif" style={{ fontSize: 32, color: T.ink, fontWeight: 700, marginTop: 4, lineHeight: 1.05 }}>{title}</h1>
        <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 6 }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 30, fontWeight: 600, color: tone === 'loss' ? T.red : T.green }}>{stat}</div>
        <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{statLabel}</div>
      </div>
    </div>
  );
};

// ── post-match · WIN ───────────────────────────────────────────────────────
const PostmatchWin = () => (
  <FullBleed max={760}>
    <RouteTag route="/play/price-war/match/{id}/postmatch" phase="completed" panel="terminal-postmatch" bleed />
    <OutcomeBanner tone="win" eyebrow="Match complete · 8 / 8"
      title="You won · vs Morgan"
      sub={<>Cumulative profit <b>$2,148</b> vs Morgan <b>$1,772</b> · margin <b>+$376</b></>}
      stat="+18 Elo" statLabel="now 1266 · best 1284" />

    <div style={{ background: T.blueSoft, border: `1px solid ${T.blueLine}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
      <Eyebrow style={{ color: T.blue }}>Turning point · Round 4</Eyebrow>
      <p className="serif" style={{ fontSize: 17, lineHeight: 1.45, color: T.ink, marginTop: 6, fontStyle: 'italic' }}>Morgan dropped to 395¢ to chase casuals after the weekend traffic bump. You held quality, held price, kept your regulars. Her gain was a one-round spike; your retention compounded.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <TrajChart title="Price · 8 rounds" you={[400, 400, 425, 425, 400, 425, 440, 440]} opp={[410, 410, 410, 395, 395, 395, 405, 410]} ticks={[395, 420, 440]} fmt={(v) => v + '¢'} />
      <TrajChart title="Customers · 8 rounds" you={[128, 134, 144, 142, 156, 152, 148, 155]} opp={[140, 138, 132, 168, 154, 145, 138, 134]} ticks={[130, 150, 170]} sub="R4 spike: her flash sale pulled the crowd briefly. You crossed her in R5 and never gave it back." />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <div style={{ background: T.greenSoft, border: '1px solid #bfe6cc', borderRadius: 13, padding: 15 }}>
        <Eyebrow style={{ color: T.green }}>Best move</Eyebrow>
        <h3 className="serif" style={{ fontSize: 18, color: T.ink, marginTop: 4 }}>R5 · Held price, ran loyalty</h3>
        <div style={{ fontSize: 12.5, color: T.ink2, marginTop: 4 }}>≈ +$184 retained margin. Morgan’s casuals leaked back to you.</div>
      </div>
      <div style={{ background: T.redSoft, border: '1px solid #f3c0c0', borderRadius: 13, padding: 15 }}>
        <Eyebrow style={{ color: T.red }}>Worst move</Eyebrow>
        <h3 className="serif" style={{ fontSize: 18, color: T.ink, marginTop: 4 }}>R2 · Hired without training</h3>
        <div style={{ fontSize: 12.5, color: T.ink2, marginTop: 4 }}>≈ −$60. The new hire dragged service quality for 2 rounds.</div>
      </div>
    </div>

    <div style={{ marginTop: 12 }}>
      <LessonNudge topic="Hiring without breaking service" mins={3}
        ctx="Your R2 hire cost you 2 rounds of quality. Learn how to grow the team without the dip." cta="Do this lesson →" />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
      <Btn kind="ghost" size="md">← Lobby</Btn>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="ghost" size="md">Replay ▷</Btn>
        <Btn kind="ghost" size="md">Rematch Morgan</Btn>
        <Btn kind="primary" size="md">Find new opponent</Btn>
      </div>
    </div>
  </FullBleed>
);

// ── post-match · LOSS (normal) ─────────────────────────────────────────────
const PostmatchLoss = () => (
  <FullBleed max={760}>
    <RouteTag route="/play/price-war/match/{id}/postmatch" phase="completed (loss)" panel="terminal-postmatch" bleed />
    <OutcomeBanner tone="loss" eyebrow="Match complete · 8 / 8"
      title="Morgan won this one"
      sub={<>Cumulative profit <b>$1,640</b> vs Morgan <b>$1,994</b> · margin <b>−$354</b></>}
      stat="−14 Elo" statLabel="now 1252 · best 1284" />

    <div style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
      <Eyebrow>Turning point · Round 3</Eyebrow>
      <p className="serif" style={{ fontSize: 17, lineHeight: 1.45, color: T.ink, marginTop: 6, fontStyle: 'italic' }}>You chased Morgan’s price down instead of holding. Margin evaporated on both sides, but she had the volume to absorb it and you didn’t.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <TrajChart title="Price · 8 rounds" you={[400, 390, 360, 370, 380, 375, 390, 400]} opp={[410, 405, 400, 395, 390, 395, 400, 405]} ticks={[360, 390, 410]} fmt={(v) => v + '¢'} pivot={3} />
      <div style={{ background: T.redSoft, border: '1px solid #f3c0c0', borderRadius: 13, padding: 15 }}>
        <Eyebrow style={{ color: T.red }}>Worst move</Eyebrow>
        <h3 className="serif" style={{ fontSize: 18, color: T.ink, marginTop: 4 }}>R3 · Matched her price cut</h3>
        <div style={{ fontSize: 12.5, color: T.ink2, marginTop: 4 }}>≈ −$210. A hold would have kept your regulars and your margin.</div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.rule}` }}>
          <Eyebrow>Best move</Eyebrow>
          <div style={{ fontSize: 13, color: T.ink, marginTop: 3, fontWeight: 600 }}>R7 · Recovered price discipline</div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 12 }}>
      <LessonNudge topic="Why chasing a price cut backfires" mins={4}
        ctx="You matched Morgan’s Round 3 cut and lost ~$210. Learn when holding wins the war." />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
      <Btn kind="ghost" size="md">← Lobby</Btn>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="ghost" size="md">Replay ▷</Btn>
        <Btn kind="primary" size="md">Rematch Morgan</Btn>
      </div>
    </div>
  </FullBleed>
);

// ── reusable LOSS-ENDING (completed) ───────────────────────────────────────
// Every "you lost" outcome — bankruptcy, disconnect, timeout, forfeit — renders
// as a variation of the completed screen so the loop always closes on a clear
// "Morgan wins" with Elo + reason. Pass the body content per reason.
const LossEnd = ({ route, phase, panel, eyebrow, title, sub, stat, statLabel, children, lesson, actions }) => (
  <FullBleed max={760}>
    <RouteTag route={route} phase={phase} panel={panel} bleed />
    <OutcomeBanner tone="loss" eyebrow={eyebrow} title={title} sub={sub} stat={stat} statLabel={statLabel} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: T.redSoft, border: '1px solid #f3c0c0', borderRadius: 12, marginTop: 12 }}>
      <AvOpp size={30} />
      <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>Morgan wins this match.</span>
      <span style={{ fontSize: 12.5, color: T.ink3, marginLeft: 'auto' }}>Result recorded · counts as a loss</span>
    </div>
    {children}
    {lesson && <div style={{ marginTop: 12 }}>{lesson}</div>}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
      <Btn kind="ghost" size="md">← Lobby</Btn>
      <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
    </div>
  </FullBleed>
);

// ── bankruptcy — Out of cash (completed-screen variation, Morgan wins) ─────
const Bankruptcy = () => (
  <LossEnd
    route="/play/price-war/match/{id}/bankruptcy" phase="completed (bankruptcy)" panel="terminal-bankruptcy"
    eyebrow="Match ended · Round 5 · bankruptcy" title="Out of cash."
    sub={<>The shop is liquidated — you couldn’t make payroll. Morgan wins by default.</>}
    stat="−28 Elo" statLabel="now 1238 · best 1284"
    lesson={<LessonNudge topic="Cash flow vs. profit — don’t run dry" mins={5} ctx="You went broke while profitable on paper. This lesson is how to keep cash above the line." cta="Learn this →" />}
    actions={<><Btn kind="ghost" size="md">Replay ▷</Btn><Btn kind="primary" size="md">Try again</Btn></>}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12, marginTop: 12 }}>
      <Panel pad={16}>
        <Eyebrow>Cash trajectory · R1 → R5</Eyebrow>
        <svg viewBox="0 0 360 140" style={{ width: '100%', marginTop: 6 }}>
          <line x1="30" y1="110" x2="350" y2="110" stroke={T.red} strokeWidth="1" strokeDasharray="4 3" />
          <line x1="30" y1="74" x2="350" y2="74" stroke="#e0a360" strokeWidth="1" strokeDasharray="3 3" />
          <text x="32" y="70" fontSize="9" fill="#9a6b12" fontFamily="JetBrains Mono">austerity · $200</text>
          <path d="M 30,28 L 110,80 L 190,68 L 270,94 L 350,110" stroke={T.red} strokeWidth="2.4" fill="none" />
          {[[30, 28], [110, 80], [190, 68], [270, 94], [350, 110]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={i < 3 ? T.blue : T.red} />)}
          {['R1', 'R2', 'R3', 'R4', 'R5'].map((r, i) => <text key={r} x={30 + i * 80} y="126" textAnchor="middle" fontSize="10" fill={T.ink3} fontFamily="JetBrains Mono">{r}</text>)}
          {['$500', '$184', '$248', '$102', '$0'].map((v, i) => <text key={i} x={30 + i * 80} y={[28, 80, 68, 94, 110][i] - 8} textAnchor="middle" fontSize="10.5" fill={T.ink} fontFamily="JetBrains Mono" fontWeight="600">{v}</text>)}
        </svg>
      </Panel>
      <Panel pad={16}>
        <Eyebrow>Why this specifically</Eyebrow>
        <p style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.5, margin: '6px 0 10px' }}>You went broke <b style={{ color: T.ink }}>while still profitable on paper</b> — the classic first-founder failure.</p>
        <div>
          {[['Over-investment in', 'R1 + R2'], ['Below austerity since', 'R3'], ['Triggering bill', 'R5 wages: $112'], ['Cash gap', '$112 short']].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? `1px dashed ${T.rule}` : 'none' }}>
              <span style={{ fontSize: 12.5, color: T.ink2 }}>{r[0]}</span>
              <span className="mono" style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>{r[1]}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </LossEnd>
);

// reason-row helper for the self-inflicted endings
const ReasonNote = ({ eyebrow, children }) => (
  <Panel pad={16} style={{ marginTop: 12 }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.55, marginTop: 6 }}>{children}</p>
  </Panel>
);

// ── you disconnected (forfeit_on_abandonment · you lost) ───────────────────
const YouDisconnected = () => (
  <LossEnd
    route="/play/price-war/match/{id}/postmatch" phase="completed · forfeit_on_abandonment" panel="terminal-postmatch · disconnect"
    eyebrow="Match ended · Round 4 · you went inactive" title="You disconnected."
    sub={<>You missed 3 turns in a row, so the match auto-resolved. Morgan takes it by default.</>}
    stat="−22 Elo" statLabel="now 1244 · best 1284"
    lesson={<LessonNudge topic="Don’t lose on a no-show" mins={3} ctx="An abandonment carries a full Elo hit. Learn the habits that keep you from dropping a live match." cta="Learn this →" />}
    actions={<Btn kind="primary" size="md">Rematch Morgan</Btn>}>
    <ReasonNote eyebrow="What happened">
      We held the round and notified you, but no move landed before the grace window closed. <b style={{ color: T.ink }}>Reconnecting next time keeps the match live</b> — abandonment losses carry the full Elo hit and no review.
    </ReasonNote>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {[['R3', 'Missed turn — auto-passed', 'ink'], ['R4', 'Missed turn — you notified', 'ink'], ['R4', 'Grace window expired · 3rd miss', 'warn'], ['now', 'Resolved · loss recorded', 'red']].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 38 }}><Pill tone={r[2]}>{r[0]}</Pill></span>
          <span style={{ fontSize: 13, color: T.ink2 }}>{r[1]}</span>
        </div>
      ))}
    </div>
  </LossEnd>
);

// ── you ran out of time (forfeit_on_timeout · you lost) ────────────────────
const YouTimedOut = () => (
  <LossEnd
    route="/play/price-war/match/{id}/postmatch" phase="completed · forfeit_on_timeout" panel="terminal-postmatch · timeout"
    eyebrow="Match ended · Round 6 · turn timer expired" title="You ran out of time."
    sub={<>Your turn clock hit zero before you locked. The match resolves in Morgan’s favor.</>}
    stat="−18 Elo" statLabel="now 1248 · best 1284"
    lesson={<LessonNudge topic="Managing your turn clock" mins={3} ctx="Your clock ran out before you locked. Learn how to plan a turn so time never decides it for you." cta="Learn this →" />}
    actions={<Btn kind="primary" size="md">Rematch Morgan</Btn>}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <ReasonNote eyebrow="What happened">
        You had a turn pending in Round 6 and the timer ran out. No moves were submitted, so the round couldn’t resolve and the match was forfeited on time.
      </ReasonNote>
      <Panel pad={16} style={{ marginTop: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Eyebrow>At expiry</Eyebrow>
        <div className="mono" style={{ fontSize: 40, fontWeight: 600, color: T.red, marginTop: 4 }}>0:00</div>
        <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 4 }}>standard turn clock · 24h/turn</div>
      </Panel>
    </div>
  </LossEnd>
);

// ── you forfeited (you confirmed forfeit · you lost) ───────────────────────
const YouForfeited = () => (
  <LossEnd
    route="/play/price-war/match/{id}/postmatch" phase="completed · forfeit (voluntary)" panel="terminal-postmatch · forfeit"
    eyebrow="Match ended · Round 5 · you forfeited" title="You forfeited."
    sub={<>You ended the match early. It’s recorded as a loss for you and a win for Morgan.</>}
    stat="−22 Elo" statLabel="now 1244 · best 1284"
    lesson={<LessonNudge topic="When to hold a winning position" mins={3} ctx="You forfeited while ahead +$642. Learn to recognize — and protect — a lead worth keeping." cta="Learn this →" />}
    actions={<Btn kind="primary" size="md">Rematch Morgan</Btn>}>
    <ReasonNote eyebrow="Heads up for next time">
      You were actually <b style={{ color: T.ink }}>ahead +$642</b> when you forfeited — the turn timer gives you until tomorrow before a match is at risk. Forfeits skip the report and Best-Move review.
    </ReasonNote>
  </LossEnd>
);

// ── abandonment (opponent left — YOU win) ─────────────────────────────────
const Abandoned = () => (
  <FullBleed max={760}>
    <RouteTag route="/play/price-war/match/{id}/abandoned" phase="completed (abandonment)" panel="terminal-abandoned" bleed />
    <OutcomeBanner tone="win" eyebrow="Match closed · opponent inactive"
      title="Morgan stepped out."
      sub="3 consecutive missed turns triggered automatic resolution. Win awarded."
      stat="+8 Elo" statLabel="smaller than a normal win" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <Panel pad={16}>
        <Eyebrow>Timeline</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
          {[['R3', 'Morgan missed turn — auto-passed', 'ink'], ['R4', 'Missed again — you notified', 'ink'], ['R5', 'Missed 3rd · flagged for resolution', 'warn'], ['now', 'Resolved · win awarded', 'green']].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38 }}><Pill tone={r[2]}>{r[0]}</Pill></span>
              <span style={{ fontSize: 13, color: T.ink2 }}>{r[1]}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel pad={16}>
        <Eyebrow>Why a smaller Elo bump</Eyebrow>
        <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, marginTop: 6 }}>The match didn’t reach a real outcome — no turning point, no full P&amp;L. You get a fraction of a real win’s Elo and no streak credit.</p>
        <p style={{ fontSize: 12, color: T.ink3, lineHeight: 1.5, marginTop: 8, fontStyle: 'italic' }}>Prevents grinding the ladder by pairing with inactive players on purpose.</p>
      </Panel>
    </div>
    <div style={{ marginTop: 12 }}>
      <LessonNudge topic="Playing patient opponents" mins={3}
        ctx="Morgan stalled out. Learn to keep pressure on players who try to wait you out." cta="Sharpen this →" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
      <Btn kind="ghost" size="md">← Lobby</Btn>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="ghost" size="md">Report concern</Btn>
        <Btn kind="primary" size="md">Find a new opponent</Btn>
      </div>
    </div>
  </FullBleed>
);

// ── reusable WIN-ENDING (opponent ended it early — YOU win) ────────────────
const WinEnd = ({ route, phase, panel, eyebrow, title, sub, stat, statLabel, note, noteEyebrow, lesson, actions }) => (
  <FullBleed max={760}>
    <RouteTag route={route} phase={phase} panel={panel} bleed />
    <OutcomeBanner tone="win" eyebrow={eyebrow} title={title} sub={sub} stat={stat} statLabel={statLabel} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: T.greenSoft, border: '1px solid #bfe6cc', borderRadius: 12, marginTop: 12 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>You win this match.</span>
      <span style={{ fontSize: 12.5, color: T.ink3, marginLeft: 'auto' }}>Result recorded · counts as a win</span>
    </div>
    <Panel pad={16} style={{ marginTop: 12 }}>
      <Eyebrow>{noteEyebrow}</Eyebrow>
      <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.55, marginTop: 6 }}>{note}</p>
    </Panel>
    {lesson && <div style={{ marginTop: 12 }}>{lesson}</div>}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
      <Btn kind="ghost" size="md">← Lobby</Btn>
      <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
    </div>
  </FullBleed>
);

// opponent forfeited (voluntary · you win)
const OppForfeited = () => (
  <WinEnd
    route="/play/price-war/match/{id}/postmatch" phase="completed · opponent forfeit" panel="terminal-postmatch · opp-forfeit"
    eyebrow="Match ended · Round 5 · Morgan forfeited" title="Morgan forfeited."
    sub={<>Morgan ended the match early — you were ahead <b>+$642</b>. The win is yours.</>}
    stat="+16 Elo" statLabel="now 1282 · best 1284"
    noteEyebrow="What this means"
    note={<>A voluntary forfeit counts as a full win, so you keep the Elo and your streak. There’s no round report since the match didn’t play out — but the lead you built still stands.</>}
    lesson={<LessonNudge topic="Pressing a lead" mins={3} ctx="You forced Morgan to fold. Learn how to build a position so strong opponents step out." cta="Sharpen this →" />}
    actions={<><Btn kind="ghost" size="md">Replay ▷</Btn><Btn kind="primary" size="md">Find a new opponent</Btn></>} />
);

// opponent ran out of time (their clock expired · you win)
const OppTimedOut = () => (
  <WinEnd
    route="/play/price-war/match/{id}/postmatch" phase="completed · opponent forfeit_on_timeout" panel="terminal-postmatch · opp-timeout"
    eyebrow="Match ended · Round 6 · Morgan’s timer expired" title="Morgan ran out of time."
    sub={<>Morgan’s turn clock hit zero before they locked. The match resolves in your favor.</>}
    stat="+14 Elo" statLabel="now 1280 · best 1284"
    noteEyebrow="What happened"
    note={<>We held Round 6 for Morgan’s move, but their clock ran out. Timeouts resolve as a win for the active player — that’s you.</>}
    lesson={<LessonNudge topic="Closing out a match" mins={3} ctx="You’re one win from your peak Elo. Learn how to finish strong when a match is yours to lose." cta="Sharpen this →" />}
    actions={<Btn kind="primary" size="md">Find a new opponent</Btn>} />
);


const DisconnectOverlay = () => (
  <FullBleed max={900}>
    <RouteTag route="overlay · any live phase" phase="opponent_disconnected" panel="ModalShell" />
    <Modal accent="#c2410c" width={460}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvOpp size={44} />
        <div>
          <Eyebrow style={{ color: '#9a6b12' }}>Connection lost</Eyebrow>
          <h2 className="serif" style={{ fontSize: 23, color: T.ink, fontWeight: 700, marginTop: 2 }}>Morgan dropped out.</h2>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5, margin: '12px 0' }}>We’re holding the round. If they don’t return within the grace window, the match resolves in your favor.</p>
      <div style={{ textAlign: 'center', padding: '14px 0', background: T.paper2, borderRadius: 12, border: `1px solid ${T.rule}` }}>
        <div className="mono" style={{ fontSize: 38, fontWeight: 600, color: '#c2410c' }}>1:48</div>
        <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>grace remaining</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Btn kind="ghost" size="md" full>Leave — notify me</Btn>
        <Btn kind="primary" size="md" full>Keep waiting</Btn>
      </div>
    </Modal>
  </FullBleed>
);

// ── overlay · forfeit confirm (type FORFEIT) ───────────────────────────────
const ForfeitOverlay = () => (
  <FullBleed max={900}>
    <RouteTag route="overlay · live match" phase="forfeit" panel="ModalShell · destructive" />
    <Modal accent={T.red} width={500}>
      <Eyebrow style={{ color: T.red }}>Forfeit · irreversible</Eyebrow>
      <h2 className="serif" style={{ fontSize: 24, color: T.ink, fontWeight: 700, marginTop: 4 }}>Give up the match against Morgan?</h2>
      <p style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5, margin: '8px 0 12px' }}>This counts as a <b>loss</b>. The match ends now — no report, no Best Move review.</p>
      <div style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 12, padding: 12 }}>
        {[['Current round', '5 of 8'], ['Cumulative profit', '+$642 (you ahead)'], ['Elo change', '≈ −22 Elo'], ['Streak', '3-game streak ends']].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? `1px dashed ${T.rule}` : 'none' }}>
            <span style={{ fontSize: 13, color: T.ink2 }}>{r[0]}</span>
            <span className="mono" style={{ fontSize: 13, color: i === 2 ? T.red : T.ink, fontWeight: 600 }}>{r[1]}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.5, marginTop: 10, fontStyle: 'italic' }}>You’re actually ahead — the round timer gives you until tomorrow to come back.</p>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: T.ink3 }}>Type <b style={{ color: T.ink }}>FORFEIT</b> to confirm</div>
        <div className="mono" style={{ marginTop: 6, padding: '11px 13px', border: `1px dashed ${T.ink4}`, borderRadius: 10, background: T.paper2, fontSize: 15, letterSpacing: '.12em', color: T.ink3 }}>FORF<span style={{ background: '#fde68a', color: T.ink }}>|</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <Btn kind="ghost" size="md">← Keep playing</Btn>
        <button disabled style={{ padding: '11px 18px', fontSize: 14, fontWeight: 600, borderRadius: 999, border: 'none', background: T.ink4, color: '#fff', opacity: .6, cursor: 'default' }}>End match · disabled</button>
      </div>
    </Modal>
  </FullBleed>
);

// ── error modals (API blocks) ──────────────────────────────────────────────
const ErrorModal = ({ title, body, primary, tag, phase }) => (
  <FullBleed max={900}>
    <RouteTag route={tag} phase={phase} panel="error-modal" />
    <Modal accent={T.ink} width={420}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: T.paper2, border: `1px solid ${T.rule}`, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
        <span style={{ fontSize: 22 }}>🙃</span>
      </div>
      <h2 className="serif" style={{ fontSize: 23, color: T.ink, fontWeight: 700, textAlign: 'center', marginTop: 12 }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5, textAlign: 'center', margin: '8px auto 16px', maxWidth: 320 }}>{body}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn kind="ghost" size="md" full>Dismiss</Btn>
        {primary && <Btn kind="primary" size="md" full>{primary}</Btn>}
      </div>
    </Modal>
  </FullBleed>
);
const ErrorAlreadyInMatch = () => <ErrorModal tag="API block · 403" phase="already_in_match" title="Can’t start another match right now" body="Free tier plays one match at a time. Finish your match with Marina, or upgrade to run several at once." primary="Upgrade" />;
const ErrorForbidden = () => <ErrorModal tag="API block · 403" phase="forbidden" title="Not available right now" body="That action isn’t available at the moment. Head back to the lobby and try again." />;

// ── austerity decide variant (low cash) ────────────────────────────────────
const AusterityDecide = () => (
  <MatchShell opp="Morgan" round={6} total={8}
    tag={<RouteTag route="/play/price-war/match/{id}" phase="decide · low cash" panel="decide + AusterityBanner" />}>
    <div style={{ width: 372, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'linear-gradient(180deg,#fdf3e2,#fbe8cc)', border: '2px solid #f0d99a', borderRadius: 14, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <Eyebrow style={{ color: '#9a6b12' }}>⚠ Financial distress</Eyebrow>
            <h3 className="serif" style={{ fontSize: 19, color: T.ink, fontWeight: 700, marginTop: 4 }}>You’re in austerity.</h3>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Cash v={128} size={26} color="#c2410c" />
            <div style={{ fontSize: 10.5, color: '#9a6b12', marginTop: 2 }}>floor at $0</div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: '#7a5a12', lineHeight: 1.45, margin: '10px 0 0' }}>Below the $200 threshold: no actions above $50 upfront, no hiring, no equipment, no R&amp;D until cash recovers.</p>
      </div>
      <LessonNudge topic="Surviving a cash crunch" mins={4}
        ctx="You’ve dropped into austerity. Learn the moves that pull a shop back from the brink." cta="Learn this →" />
      <Panel pad={16}>
        <Eyebrow>Lock variants — visually distinct</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <Pill tone="warn">🔒 austerity</Pill>
          <Pill tone="ink">🔒 cooldown</Pill>
          <Pill tone="ink">🔒 prerequisite</Pill>
        </div>
      </Panel>
    </div>
    <div style={{ width: 432 }}>
      <Panel pad={16}>
        <Eyebrow>Affordable this round</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          <MoveTile dk="sales" name="Flash sale" meta="$0 upfront · public" selected />
          <div style={{ opacity: .42, position: 'relative' }}><MoveTile dk="people" name="Hire barista" meta="−$120 · 🔒 austerity" /></div>
          <div style={{ opacity: .42 }}><MoveTile dk="ops" name="Upgrade equipment" meta="−$200 · 🔒 prereq" /></div>
          <div style={{ opacity: .42 }}><MoveTile dk="product" name="R&D project" meta="−$80 · 🔒 austerity" /></div>
        </div>
        <p style={{ fontSize: 12, color: T.ink3, lineHeight: 1.5, marginTop: 12 }}>Recommendation: show the banner on first austerity entry per match; collapse to a state-strip on re-entries.</p>
      </Panel>
    </div>
    <TurnLog />
  </MatchShell>
);

Object.assign(window, {
  PostmatchWin, PostmatchLoss, Bankruptcy, YouDisconnected, YouTimedOut, YouForfeited,
  Abandoned, OppForfeited, OppTimedOut, WinEnd,
  DisconnectOverlay, ForfeitOverlay, ErrorAlreadyInMatch, ErrorForbidden, AusterityDecide,
});
