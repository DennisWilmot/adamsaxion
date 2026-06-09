// Terminal states — Bankruptcy (2 directions), Opponent abandonment.

// ── Bankruptcy · direction A: dramatic full-screen ending ───────────────────
const BankruptcyDramatic = () => (
  <>
    <div className="wf-card" style={{ background: 'linear-gradient(180deg,#2a1f17 0%,#3a2a1e 100%)', color: '#f6efe0', padding: '40px 24px', borderColor: '#2a1f17', textAlign: 'center' }}>
      <div className="eyebrow" style={{ color: '#e8a76b' }}>Round 5 · cash hit $0</div>
      <h1 style={{ color: '#f6efe0', fontSize: 56, lineHeight: 1, marginTop: 8 }}>The shop closes.</h1>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 18, maxWidth: 580, margin: '12px auto 0', color: '#e8d9bd' }}>
        You couldn't make payroll. The bank called the line. The match ends here — Marina wins by default.
      </p>
      <div className="wf-row" style={{ justifyContent: 'center', gap: 24, marginTop: 22 }}>
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 38, color: 'var(--warm)' }}>−28</div>
          <div style={{ fontSize: 12, color: '#bda892' }}>Elo · now 1238</div>
        </div>
        <div style={{ width: 1, background: '#5a4633' }} />
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 38, color: '#e8d9bd' }}>R5</div>
          <div style={{ fontSize: 12, color: '#bda892' }}>where it ended</div>
        </div>
        <div style={{ width: 1, background: '#5a4633' }} />
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 38, color: '#e8d9bd' }}>+$184</div>
          <div style={{ fontSize: 12, color: '#bda892' }}>peak cash (R2)</div>
        </div>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">What happened</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, marginTop: 4 }}>
          <b>R1–R2:</b> you over-invested — equipment upgrade + 2 hires + bean stockpile in two rounds. Cash dropped from $500 to $184.<br/>
          <b>R3:</b> Marina's flash sale pulled your casuals. Revenue dipped.<br/>
          <b>R4:</b> you tried to recover with marketing — another $80. Wages hit the next morning.<br/>
          <b>R5:</b> $0. Bank closed the line.
        </p>
      </div>
      <div className="wf-card" style={{ background: '#fff8ec' }}>
        <div className="eyebrow">Why this specifically?</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>
          You ran out of cash <b>while still profitable on paper</b>. That's a famous failure mode — most first-time founders meet it. The lesson below walks through exactly that gap.
        </p>
      </div>
    </div>

    {/* Lesson CTA — the painful loss is the best teaching moment */}
    <div className="wf-card accent" style={{ marginTop: 14, padding: 18, background: 'linear-gradient(180deg,#eaf2ff 0%,#fff5e8 100%)', borderColor: 'var(--accent)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Lesson recommended for this loss</div>
          <h3 style={{ marginTop: 2, fontSize: 28 }}>L4 · Cash vs. profit — why cash kills first</h3>
          <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, lineHeight: 1.45, marginTop: 6 }}>
            You'd have ended R5 profitable. But profit doesn't pay payroll — cash does. This lesson uses <b>your actual R1–R5 ledger</b> to show when the gap opened and what would have closed it.
          </p>
          <div className="wf-row" style={{ gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip kind="ghost">10 min · interactive</Chip>
            <Chip kind="ghost">replays your match as the worked example</Chip>
          </div>
        </div>
        <Btn kind="primary" className="big" style={{ padding: '14px 22px', fontSize: 17 }}>Start lesson →</Btn>
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--ink-3)' }}>
        <div className="eyebrow" style={{ fontSize: 11 }}>Also unlocked by this match</div>
        <div className="wf-row wrap" style={{ gap: 8, marginTop: 6 }}>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L1 · Budget constraints</a>
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L9 · Sequencing investments</a>
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L12 · The austerity threshold</a>
        </div>
      </div>
    </div>

    <div className="wf-row" style={{ marginTop: 14, justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <Btn kind="ghost">← Lobby</Btn>
      <div className="wf-row" style={{ gap: 8 }}>
        <Btn kind="ghost">Replay R1-R5 ▷</Btn>
        <Btn kind="ghost">Try again · new opponent</Btn>
      </div>
    </div>
  </>
);

// ── Bankruptcy · direction B: clinical / analytical ─────────────────────────
const BankruptcyClinical = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Match ended · round 5 · bankruptcy</div>
        <h2>Out of cash.</h2>
        <div className="step-hint" style={{ margin: 0 }}>The shop is liquidated. Marina wins by default — Elo settles as if she'd held a 60 % margin.</div>
      </div>
      <Chip kind="warm">−28 Elo · now 1238</Chip>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 6 }}>
      <div className="wf-card">
        <div className="eyebrow">Cash trajectory · R1 → R5</div>
        <svg viewBox="0 0 360 140" style={{ width: '100%' }}>
          <line x1="30" y1="110" x2="350" y2="110" stroke="#bcb5a8" strokeWidth="1.2" />
          <line x1="30" y1="110" x2="30" y2="10" stroke="#bcb5a8" strokeWidth="1.2" />
          {/* zero line */}
          <line x1="30" y1="110" x2="350" y2="110" stroke="#c46b3f" strokeWidth="1" strokeDasharray="4 3" />
          {/* austerity threshold */}
          <line x1="30" y1="75" x2="350" y2="75" stroke="#e8a76b" strokeWidth="1" strokeDasharray="3 3" />
          <text x="32" y="72" fontSize="9" fill="#c46b3f" fontFamily="Patrick Hand">austerity · $200</text>
          {/* trajectory: 500, 184, 248, 102, 0 */}
          <path d="M 30,30 L 110,80 L 190,69 L 270,93 L 350,110" stroke="#c46b3f" strokeWidth="2.4" fill="none" />
          <circle cx="30"  cy="30"  r="4" fill="#1f59c2" />
          <circle cx="110" cy="80"  r="4" fill="#1f59c2" />
          <circle cx="190" cy="69"  r="4" fill="#1f59c2" />
          <circle cx="270" cy="93"  r="4" fill="#c46b3f" />
          <circle cx="350" cy="110" r="5" fill="#c46b3f" stroke="#2a1f17" strokeWidth="1.5" />
          {['R1','R2','R3','R4','R5'].map((r,i) => (
            <text key={r} x={30 + i * 80} y="126" textAnchor="middle" fontSize="11" fill="#7d7567" fontFamily="Patrick Hand">{r}</text>
          ))}
          {['$500','$184','$248','$102','$0'].map((v,i) => (
            <text key={i} x={30 + i * 80} y={[30,80,69,93,110][i] - 8} textAnchor="middle" fontSize="11" fill="#2a1f17" fontFamily="Kalam" fontWeight="700">{v}</text>
          ))}
        </svg>
      </div>

      <div className="wf-col" style={{ gap: 8 }}>
        <div className="wf-card">
          <div className="eyebrow">Cause of failure</div>
          <KV k="Over-investment in" v="R1 + R2" />
          <KV k="Below austerity since" v="R3" />
          <KV k="Triggering bill" v="R5 wages: $112" />
          <KV k="Cash gap" v="$112 short" />
        </div>
        <div className="wf-card" style={{ background: 'var(--paper-2)' }}>
          <div className="eyebrow">Lessons unlocked</div>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, display: 'block' }}>L1 · Budget constraints</a>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, display: 'block' }}>L4 · Cash vs. profit</a>
          <a style={{ color: 'var(--accent)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, display: 'block' }}>L9 · Sequencing investments</a>
        </div>
      </div>
    </div>

    {/* Lesson CTA — clinical variant, same recommendation, leaner presentation */}
    <div className="wf-card accent" style={{ marginTop: 12, padding: 14 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Lesson recommended</div>
          <h4 style={{ fontSize: 22, marginTop: 2 }}>L4 · Cash vs. profit</h4>
          <div className="step-hint" style={{ margin: 0 }}>Uses your R1–R5 ledger as the worked example · 10 min</div>
        </div>
        <Btn kind="primary" className="big">Start lesson →</Btn>
      </div>
    </div>

    <div className="wf-row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
      <Btn kind="ghost">← Lobby</Btn>
      <Btn kind="ghost">Try again</Btn>
    </div>

    <div className="step-hint" style={{ marginTop: 10, fontStyle: 'italic' }}>Tradeoff vs. dramatic: chart-first respects players who want to learn. Loses the emotional weight that makes the lesson stick.</div>
  </>
);

// ── Opponent abandonment resolution ─────────────────────────────────────────
const AbandonmentResolution = () => (
  <>
    <div className="wf-card good" style={{ background: '#eff8ec', padding: 18 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="eyebrow">Match closed · opponent inactive</div>
          <h2>Win awarded — Marina didn't return.</h2>
          <div className="step-hint" style={{ margin: '4px 0 0' }}>3 consecutive missed turns triggered automatic resolution.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num" style={{ fontSize: 30, color: 'var(--good)' }}>+8 Elo</div>
          <div className="stat-label">smaller than a normal win</div>
        </div>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Timeline</div>
        <div className="wf-col" style={{ gap: 6, marginTop: 6, fontFamily: "'Kalam',cursive", fontSize: 14 }}>
          <div className="wf-row" style={{ gap: 8 }}><Chip kind="ghost">R3</Chip>Marina missed turn — auto-passed</div>
          <div className="wf-row" style={{ gap: 8 }}><Chip kind="ghost">R4</Chip>Missed again — you notified</div>
          <div className="wf-row" style={{ gap: 8 }}><Chip kind="warm">R5</Chip>Missed 3rd · match flagged for resolution</div>
          <div className="wf-row" style={{ gap: 8 }}><Chip kind="accent">now</Chip>Resolved · win awarded</div>
        </div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Why a smaller Elo bump</div>
        <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>
          The match didn't reach a real outcome — no Best Move, no Turning Point, no full P&amp;L to analyze. We give you a fraction of the Elo a real win would award, no streak credit.
        </p>
        <p style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)', marginTop: 6, fontStyle: 'italic' }}>
          Prevents grinding the ladder by intentionally pairing with inactive players.
        </p>
      </div>
    </div>

    <div className="wf-card" style={{ marginTop: 12, background: 'var(--paper-2)' }}>
      <div className="eyebrow">What you keep</div>
      <div className="wf-row wrap" style={{ gap: 10, marginTop: 6 }}>
        <Chip kind="ghost">your moves R1–R2 (the rounds that played) replay in History</Chip>
        <Chip kind="ghost">no Best Move / Worst Move</Chip>
        <Chip kind="ghost">no Turning Point</Chip>
        <Chip kind="ghost">+8 Elo, no streak credit</Chip>
      </div>
    </div>

    {/* Lesson CTA — even abandonment leads back into learning, just gentler */}
    <div className="wf-card" style={{ marginTop: 12, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="eyebrow">While you wait for the next match</div>
          <h4 style={{ marginTop: 2 }}>Pick up where R2 left off · L8 · Reading public signals</h4>
          <div className="step-hint" style={{ margin: 0 }}>You saw 2 rounds of Marina's prices and reviews — practice inferring from incomplete data.</div>
        </div>
        <Btn kind="primary">Start lesson →</Btn>
      </div>
    </div>

    <div className="wf-row" style={{ marginTop: 14, justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <Btn kind="ghost">← Lobby</Btn>
      <div className="wf-row" style={{ gap: 8 }}>
        <Btn kind="ghost">Report concern about opponent</Btn>
        <Btn kind="ghost">Find a new opponent</Btn>
      </div>
    </div>
  </>
);

Object.assign(window, { BankruptcyDramatic, BankruptcyClinical, AbandonmentResolution });
