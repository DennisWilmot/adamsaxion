// Mid-match edge states — Review-and-submit (2 directions),
// Forfeit confirmation, Undo/revise overlay, Austerity mode (2 directions).

// ── Review-and-submit · direction A: modal overlay on Decide ────────────────
const ReviewSubmitModal = () => (
  <div style={{ position: 'relative', minHeight: 540 }}>
    {/* dimmed Decide screen behind */}
    <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none', filter: 'blur(0.5px) saturate(0.85)' }}>
      <div className="wf-card" style={{ padding: 10 }}>
        <h4>Decide · Round 5</h4>
        <div className="wf-grid cols-3" style={{ marginTop: 8 }}>
          <div className="wf-card" style={{ height: 72 }} />
          <div className="wf-card" style={{ height: 72 }} />
          <div className="wf-card" style={{ height: 72 }} />
        </div>
      </div>
    </div>

    {/* modal */}
    <div style={{ position: 'relative', maxWidth: 640, margin: '40px auto 0', background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 16, padding: 22, boxShadow: '6px 8px 0 rgba(31,28,24,.15)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="eyebrow">Review · round 5 · before you lock in</div>
          <h3>Final check.</h3>
        </div>
        <Btn kind="ghost">✕</Btn>
      </div>

      <div className="wf-card warm" style={{ padding: 10, background: '#fff7ed', borderColor: 'var(--warm)', marginTop: 6 }}>
        <div style={{ fontFamily: "'Kalam',cursive", fontSize: 14, fontWeight: 700 }}>⚠ 1 note · no Sales move queued</div>
        <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>Marina's posted price ($3.95) is below yours. Your price will persist at $4.25 — no action will respond unless you queue one.</div>
      </div>

      {/* Current price is a STATE readout, not a slot. */}
      <div className="wf-card" style={{ padding: 8, marginTop: 8, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Patrick Hand',cursive", fontSize: 13 }}>
          <span style={{ color: 'var(--ink-3)' }}>Current price (persists automatically)</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>$4.25</span>
        </div>
      </div>

      <div className="eyebrow" style={{ marginTop: 12 }}>Your 3 actions</div>
      <div className="wf-col" style={{ gap: 6, marginTop: 6 }}>
        <div className="wf-card" style={{ padding: 10, background: 'var(--paper-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><DomBadge d="HR" /> <b style={{ marginLeft: 6, fontFamily: "'Kalam',cursive" }}>Train staff</b></div>
          <span className="step-hint" style={{ margin: 0 }}>-$25 · effect in 2 rounds</span>
        </div>
        <div className="wf-card" style={{ padding: 10, background: 'var(--paper-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><DomBadge d="Marketing" /> <b style={{ marginLeft: 6, fontFamily: "'Kalam',cursive" }}>Local ad</b></div>
          <span className="step-hint" style={{ margin: 0 }}>-$30 · this round · public</span>
        </div>
        <div className="wf-card" style={{ padding: 10, background: 'var(--paper-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'dashed' }}>
          <div><DomBadge d="Sales" /> <b style={{ marginLeft: 6, fontFamily: "'Kalam',cursive" }}>Price-match guarantee · armed</b></div>
          <span className="step-hint" style={{ margin: 0 }}>conditional</span>
        </div>
      </div>

      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--ink-3)' }}>
        <div>
          <KV k="Total upfront cost" v={<span style={{ color: 'var(--warm)' }}>-$25</span>} />
          <KV k="Cash after" v="$723" />
        </div>
        <div className="wf-col" style={{ gap: 8 }}>
          <Btn kind="ghost">← Back to edit</Btn>
          <Btn kind="primary" className="big">✓ Lock in for round 5</Btn>
        </div>
      </div>

      <div className="step-hint" style={{ marginTop: 8, textAlign: 'center', fontSize: 12 }}>You can <b>Unlock &amp; revise</b> from the Submitted screen until Marina submits or the timer expires.</div>
    </div>
  </div>
);

// ── Review-and-submit · direction B: inline review strip (no modal) ─────────
const ReviewSubmitInline = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Decide · round 5 · review</div>
        <h2>Final check — inline.</h2>
        <div className="step-hint" style={{ margin: 0 }}>Less interruption. The plan rail expands into a full review strip in place; Decide stays visible.</div>
      </div>
      <Chip kind="warm">⏱ 18h 42m</Chip>
    </div>

    <div className="wf-card" style={{ background: 'var(--paper-2)', padding: 12 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="eyebrow">Your plan · expanded review</div>
        <span className="step-hint" style={{ margin: 0, fontSize: 12 }}>collapses back into the 240px rail on cancel</span>
      </div>

      <div className="wf-grid cols-3" style={{ gap: 10, marginTop: 8 }}>
        <div className="wf-card" style={{ padding: 10 }}>
          <DomBadge d="HR" />
          <h4 style={{ marginTop: 6 }}>Train staff</h4>
          <KV k="Cost" v={<span style={{ color: 'var(--warm)' }}>-$25</span>} />
          <KV k="Duration" v="2 rounds" />
          <KV k="Visibility" v="Private" />
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 12 }}>Forecast: service quality ▲ R7.</div>
        </div>
        <div className="wf-card" style={{ padding: 10 }}>
          <DomBadge d="Marketing" />
          <h4 style={{ marginTop: 6 }}>Local ad</h4>
          <KV k="Cost" v={<span style={{ color: 'var(--warm)' }}>-$30</span>} />
          <KV k="Duration" v="This round" />
          <KV k="Visibility" v="Public" />
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 12 }}>Forecast: +14 % traffic for one round.</div>
        </div>
        <div className="wf-card" style={{ padding: 10, borderStyle: 'dashed' }}>
          <div><DomBadge d="Sales" /> <Chip kind="warm">if-then</Chip></div>
          <h4 style={{ marginTop: 6 }}>Price-match · armed</h4>
          <KV k="Fires if" v="Marina < $4.25" />
          <KV k="Effect" v="match her price" />
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 12 }}>Currently TRUE — Marina at $3.95.</div>
        </div>
      </div>

      {/* State readout — not a slot */}
      <div className="wf-card" style={{ padding: 8, marginTop: 10, background: 'var(--paper)', borderStyle: 'dashed' }}>
        <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)' }}>Price persists automatically (no Sales action queued):</span>
          <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>$4.25</span>
          <span className="step-hint" style={{ margin: 0, fontSize: 11 }}>← state, not a move</span>
        </div>
      </div>

      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1.5px dashed var(--ink-3)', alignItems: 'center' }}>
        <div className="wf-row" style={{ gap: 10, alignItems: 'center' }}>
          <Chip kind="warm">⚠ 1 note</Chip>
          <span className="step-hint" style={{ margin: 0, fontSize: 12 }}>Marina's price is below yours — your price-match WILL fire</span>
        </div>
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn kind="ghost">← Back to picking</Btn>
          <Btn kind="primary" className="big">✓ Lock in</Btn>
        </div>
      </div>
    </div>

    <div className="step-hint" style={{ marginTop: 10, fontStyle: 'italic' }}>Tradeoff vs. direction A: less ceremony, but warnings compete with the rest of the Decide screen for attention.</div>
  </>
);

// ── Forfeit confirmation — deliberate, not fat-fingerable ───────────────────
const ForfeitConfirm = () => (
  <div style={{ position: 'relative', minHeight: 480 }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', filter: 'blur(1px)' }}>
      <div className="wf-card" style={{ padding: 10 }}><h4>Decide screen behind</h4></div>
    </div>

    <div style={{ position: 'relative', maxWidth: 520, margin: '40px auto 0', background: 'var(--paper)', border: '2.5px solid var(--warm)', borderRadius: 16, padding: 22, boxShadow: '6px 8px 0 rgba(196,107,63,.2)' }}>
      <div className="eyebrow" style={{ color: 'var(--warm)' }}>Forfeit · this is irreversible</div>
      <h3 style={{ marginTop: 4 }}>Give up the match against Marina?</h3>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, marginTop: 6 }}>
        This counts as a <b>loss</b>. The match ends now — no post-match analysis, no Best Move review.
      </p>

      <div className="wf-card" style={{ padding: 10, marginTop: 10, background: '#fffaf0' }}>
        <KV k="Current round" v="5 of 8" />
        <KV k="Cumulative profit" v="+$642 (you ahead)" />
        <KV k="Elo change" v={<span style={{ color: 'var(--warm)' }}>≈ −22 Elo</span>} />
        <KV k="Streak" v="3-game winning streak ends" />
      </div>

      <p style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic' }}>
        You're actually ahead. If you have ~5 minutes, the round timer gives you until tomorrow to come back.
      </p>

      {/* Two-step confirmation — text input prevents fat-finger */}
      <div style={{ marginTop: 12 }}>
        <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>Type <b>FORFEIT</b> to confirm</div>
        <div style={{ marginTop: 6, padding: '10px 12px', border: '1.5px dashed var(--ink)', borderRadius: 10, background: 'var(--paper-2)', fontFamily: "'Kalam',cursive", fontSize: 16, letterSpacing: '.1em' }}>
          <span style={{ color: 'var(--ink-3)' }}>FORF<span style={{ background: '#fde68a', padding: '0 2px' }}>|</span></span>
        </div>
      </div>

      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14, alignItems: 'center' }}>
        <Btn kind="ghost">← Keep playing</Btn>
        <Btn kind="warm" style={{ opacity: 0.5 }}>End match · disabled until typed</Btn>
      </div>
    </div>
  </div>
);

// ── Undo / revise submitted turn — the warning overlay ──────────────────────
const UndoRevise = () => (
  <div style={{ position: 'relative', minHeight: 460 }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none', filter: 'blur(0.5px)' }}>
      <div className="wf-card" style={{ padding: 10 }}><h4>Submitted screen behind</h4></div>
    </div>

    <div style={{ position: 'relative', maxWidth: 520, margin: '50px auto 0', background: 'var(--paper)', border: '2px solid var(--accent)', borderRadius: 16, padding: 22, boxShadow: '6px 8px 0 rgba(31,89,194,.18)' }}>
      <div className="eyebrow" style={{ color: 'var(--accent)' }}>Unlock &amp; revise · round 5</div>
      <h3 style={{ marginTop: 4 }}>Reopen your turn?</h3>

      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 15, marginTop: 6 }}>
        Your plan will move back to <b>Decide</b>. Slots stay filled — you can edit, replace, or re-lock.
      </p>

      <div className="wf-card good" style={{ padding: 10, marginTop: 10, background: '#eff8ec' }}>
        <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>✓ Safe to revise — Marina hasn't locked yet</div>
        <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>If she locks while you're editing, the engine pauses resolution until your timer expires or you re-lock.</div>
      </div>

      <div className="wf-card warm" style={{ padding: 10, marginTop: 8, background: '#fff7ed' }}>
        <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>⚠ One thing to know</div>
        <div className="step-hint" style={{ margin: 0, fontSize: 12 }}>Marina won't see that you reopened. But you have <b>14h 22m</b> to re-lock before the round auto-resolves with whatever's in your slots.</div>
      </div>

      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
        <Btn kind="ghost">← Keep submitted</Btn>
        <Btn kind="primary">↺ Reopen &amp; revise</Btn>
      </div>
    </div>
  </div>
);

// ── Austerity mode · direction A: explicit banner + grayed-out actions ──────
const AusterityBanner = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Decide · round 6</div>
        <h2>You're in austerity.</h2>
      </div>
      <RoundDots total={8} current={6} />
    </div>

    {/* big distinct banner — financial distress as a state, not just "expensive" */}
    <div className="wf-card warm" style={{ padding: 14, background: 'linear-gradient(180deg,#fff5e8 0%,#fef0d4 100%)', borderColor: 'var(--warm)', borderWidth: 2 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="eyebrow" style={{ color: 'var(--warm)' }}>⚠ Financial distress</div>
          <h3 style={{ marginTop: 4 }}>Cash $128 · below the $200 austerity threshold</h3>
          <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>While in austerity: <b>no actions above $50 upfront</b>, no hiring, no equipment, no R&amp;D. Your bank tightened the line.</p>
        </div>
        <div style={{ textAlign: 'center', minWidth: 140 }}>
          <div className="stat-num" style={{ fontSize: 32, color: 'var(--warm)' }}>$128</div>
          <div className="stat-label">cash · floor at $0</div>
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 11 }}>break this floor → bankruptcy</div>
        </div>
      </div>
      <div className="wf-row" style={{ gap: 8, marginTop: 10 }}>
        <a style={{ color: 'var(--warm)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L1 · Budget constraints</a>
        <a style={{ color: 'var(--warm)', fontFamily: "'Patrick Hand',cursive", fontSize: 14, textDecoration: 'underline' }}>L8 · Survival economics</a>
      </div>
    </div>

    {/* sales actions with austerity treatment */}
    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card" style={{ opacity: 1 }}>
        <DomBadge d="Sales" />
        <h4 style={{ marginTop: 4 }}>Flash sale</h4>
        <div className="step-hint" style={{ margin: 0 }}>$0 upfront · public · this round</div>
        <Btn kind="primary" style={{ marginTop: 8 }}>+ Add to plan</Btn>
      </div>
      <div className="wf-card" style={{ opacity: 0.45, position: 'relative' }}>
        <DomBadge d="HR" />
        <h4 style={{ marginTop: 4 }}>Hire barista</h4>
        <div className="step-hint" style={{ margin: 0 }}>-$120 upfront</div>
        <Chip kind="warm">🔒 austerity</Chip>
        <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 11 }}>Distinct from cooldown-locked (gray) and prereq-locked (dashed).</div>
      </div>
      <div className="wf-card" style={{ opacity: 0.45, position: 'relative' }}>
        <DomBadge d="R&D" />
        <h4 style={{ marginTop: 4 }}>Invest in espresso research</h4>
        <div className="step-hint" style={{ margin: 0 }}>-$80 upfront</div>
        <Chip kind="warm">🔒 austerity</Chip>
      </div>
      <div className="wf-card" style={{ opacity: 0.6, position: 'relative', borderStyle: 'dashed' }}>
        <DomBadge d="Operations" />
        <h4 style={{ marginTop: 4 }}>Upgrade equipment · L2</h4>
        <div className="step-hint" style={{ margin: 0 }}>-$200 upfront</div>
        <Chip kind="ghost">🔒 prerequisite: cash ≥ $250</Chip>
        <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 11 }}>Prereq-lock looks different from austerity-lock.</div>
      </div>
    </div>

    <div className="wf-card" style={{ marginTop: 12, background: 'var(--paper-2)' }}>
      <div className="eyebrow">Lock variants — visually distinct</div>
      <div className="wf-row wrap" style={{ gap: 10, marginTop: 6 }}>
        <Chip kind="warm">🔒 austerity (financial distress)</Chip>
        <Chip kind="ghost">🔒 cooldown (used recently)</Chip>
        <Chip kind="ghost">🔒 prerequisite (need to unlock first)</Chip>
      </div>
    </div>
  </>
);

// ── Austerity · direction B: state-bar treatment, no full-width banner ─────
const AusterityCalm = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Decide · round 6 · austerity</div>
        <h2>Quieter take — banner moved into the state strip.</h2>
        <div className="step-hint" style={{ margin: 0 }}>Tradeoff: less alarmist, more sustained. Player can still miss it on quick play.</div>
      </div>
    </div>

    {/* state strip with austerity inline */}
    <div className="wf-card tinted" style={{ padding: '10px 14px', borderLeft: '4px solid var(--warm)', background: '#fff8ec' }}>
      <div className="wf-row wrap" style={{ gap: 10, alignItems: 'center' }}>
        <Chip kind="warm">⚠ AUSTERITY</Chip>
        <Chip kind="ghost"><span style={{ color: 'var(--warm)' }}>CASH</span> &nbsp;$128</Chip>
        <Chip kind="ghost">PRICE $4.25</Chip>
        <Chip kind="ghost">STAFF 2</Chip>
        <Chip kind="ghost">REP Fair</Chip>
        <Btn kind="ghost">more state ▾</Btn>
        <span style={{ marginLeft: 'auto', fontFamily: "'Patrick Hand',cursive", fontSize: 12, color: 'var(--warm)' }}>actions above $50 upfront disabled</span>
      </div>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 10 }}>
      <div className="wf-card"><h4>Flash sale</h4><div className="step-hint" style={{ margin: 0 }}>$0 · public</div><Btn kind="primary" style={{ marginTop: 6 }}>+ Plan</Btn></div>
      <div className="wf-card" style={{ opacity: 0.5 }}>
        <h4>Hire barista</h4>
        <div className="step-hint" style={{ margin: 0 }}>-$120</div>
        <div style={{ position: 'relative' }}>
          <Chip kind="warm">austerity</Chip>
          <div className="step-hint" style={{ margin: '4px 0 0', fontSize: 11 }}>warm border ring · no banner</div>
        </div>
      </div>
      <div className="wf-card" style={{ opacity: 0.5 }}>
        <h4>R&amp;D · espresso</h4>
        <div className="step-hint" style={{ margin: 0 }}>-$80</div>
        <Chip kind="warm">austerity</Chip>
      </div>
    </div>

    <div className="wf-card" style={{ marginTop: 12 }}>
      <div className="eyebrow">Which is better?</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 14, marginTop: 4 }}>
        <b>Direction A</b> — banner — is unmissable but alarming. Right for first-time austerity. <br/>
        <b>Direction B</b> — strip — fits frequent austerity players (they know what it means). Could be the steady-state after the banner has been shown once per match.
      </p>
      <p style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 13, color: 'var(--ink-3)', marginTop: 6, fontStyle: 'italic' }}>
        Recommend: A on first entry per match, B on re-entries.
      </p>
    </div>
  </>
);

Object.assign(window, { ReviewSubmitModal, ReviewSubmitInline, ForfeitConfirm, UndoRevise, AusterityBanner, AusterityCalm });
