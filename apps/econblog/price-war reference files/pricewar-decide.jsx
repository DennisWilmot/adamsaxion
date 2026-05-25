// Turn screen — decision-making · 3 directions
// 6 domains, 3 action slots, current state visible.

const DOMAINS = [
  { d: 'Sales',       sub: 'price · promos · offers', actions: ['Change price', 'Flash sale', 'Bundle', 'Price-match'], icon: '$' },
  { d: 'Procurement', sub: 'suppliers · inventory',    actions: ['Upgrade supplier', 'Stockpile', 'Switch tier'],         icon: '⛁' },
  { d: 'Operations',  sub: 'deploy · equip · R&D',      actions: ['Set deploy mode', 'Buy equipment', 'Start R&D'],        icon: '⚙' },
  { d: 'HR',          sub: 'hire · wage · train',       actions: ['Hire', 'Raise wage', 'Train staff', 'Poach'],           icon: '☺' },
  { d: 'Marketing',   sub: 'ads · loyalty · events',    actions: ['Set ad budget', 'Launch loyalty', 'Sponsor event'],     icon: '◎' },
  { d: 'Finance',     sub: 'cash · loans · scout',      actions: ['Take loan', 'Buy insurance', 'Scout opponent'],         icon: '◆' },
];

const STATE_CHIPS = [
  { k: 'Cash',       v: '$748',     tone: '' },
  { k: 'Price',      v: '$4.25',    tone: '' },
  { k: 'Staff',      v: '2',        tone: '' },
  { k: 'Morale',     v: 'Stable',   tone: '' },
  { k: 'Skill',      v: 'Good',     tone: 'good' },
  { k: 'Supplier',   v: 'Tier 2',   tone: '' },
  { k: 'Equipment',  v: 'Lvl 1',    tone: '' },
  { k: 'Reputation', v: 'Good',     tone: 'good' },
];

// Selected example actions (in slots)
const SELECTED = [
  { dom: 'Sales',     label: 'Change price to $4.00',        sub: '-$0.25 / cup · public', },
  { dom: 'HR',        label: 'Train staff (service)',         sub: '-$25 · skill ▲ in 2 rounds · private' },
  null,
];

// ── A: 6-card grid + state strip + slot tray (sticky bottom) ─────────────
const DecideA = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 5 of 8 · plan your turn</div>
        <h2>Pick 3 actions</h2>
      </div>
      <div className="wf-row" style={{ gap: 6 }}>
        <RoundDots total={8} current={5} />
        <Chip kind="warm">18h 42m left</Chip>
      </div>
    </div>

    {/* persistent state strip */}
    <div className="wf-card tinted" style={{ padding: '10px 14px' }}>
      <div className="wf-row wrap" style={{ gap: 10, alignItems: 'center' }}>
        <span className="eyebrow" style={{ margin: 0 }}>You</span>
        {STATE_CHIPS.map(s => (
          <Chip key={s.k} kind={s.tone || 'ghost'}>
            <span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>{s.k}</span>
            &nbsp;{s.v}
          </Chip>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Chip><span style={{ color: 'var(--ink-3)' }}>Opp price</span> &nbsp;$3.95</Chip>
          <Chip><span style={{ color: 'var(--ink-3)' }}>Opp cust</span> &nbsp;168</Chip>
        </span>
      </div>
    </div>

    {/* domain grid */}
    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      {DOMAINS.map((dm, i) => (
        <div key={dm.d} className={`domcard ${(i === 0 || i === 3) ? 'picked' : ''}`}>
          {(i === 0 || i === 3) && <span className="pick-badge">picked</span>}
          <div className="wf-row" style={{ gap: 10, alignItems: 'center' }}>
            <div className="icon">{dm.icon}</div>
            <div>
              <h4>{dm.d}</h4>
              <div className="dom-sub">{dm.sub}</div>
            </div>
          </div>
          <div className="actions-tags">
            {dm.actions.map((a, j) => (
              <span key={a} className={`at ${(i === 0 && j === 0) || (i === 3 && j === 2) ? 'picked' : ''}`}>{a}</span>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="step-hint" style={{ margin: 0 }}>{i === 5 ? '✦ scout = read opp' : ''}</span>
            <Btn kind="ghost">Open →</Btn>
          </div>
        </div>
      ))}
    </div>

    {/* slot tray */}
    <div className="wf-card" style={{ marginTop: 14, borderWidth: 2 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h4>Selected actions · 2 of 3</h4>
        <div className="step-hint" style={{ margin: 0 }}>est. this round: <b style={{ color: 'var(--warm)' }}>-$25</b></div>
      </div>
      <div className="slots" style={{ marginTop: 10 }}>
        {SELECTED.map((s, i) => (
          <div key={i} className={`slot ${s ? 'filled' : ''}`}>
            <span className="num">slot {i + 1}</span>
            {s ? (
              <>
                <span className="x">✕</span>
                <DomBadge d={s.dom} />
                <div className="label">{s.label}</div>
                <div className="sub">{s.sub}</div>
              </>
            ) : (
              <div className="empty">drag or tap an action</div>
            )}
          </div>
        ))}
      </div>
      <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <Btn kind="ghost">⟲ Reset</Btn>
        <Btn kind="primary" className="big">Review &amp; submit →</Btn>
      </div>
    </div>
  </>
);

// ── B: master/detail · domain list left, action picker right ──────────────
const DecideB = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div><h2>Round 5 · plan</h2><div className="step-hint">Pick 3 actions across any domains.</div></div>
      <Chip kind="warm">18h 42m</Chip>
    </div>

    <div className="wf-row" style={{ alignItems: 'flex-start', gap: 14 }}>
      <div className="wf-col" style={{ flex: '0 0 200px', gap: 6 }}>
        {DOMAINS.map((dm, i) => (
          <div key={dm.d} className={`wf-card ${i === 0 ? 'accent' : ''}`} style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
            <div className="icon" style={{ width: 28, height: 28, fontSize: 18 }}>{dm.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{dm.d}</div>
              <div className="dom-sub">{dm.actions.length} actions</div>
            </div>
            {(i === 0 || i === 3) && <Chip kind="accent">●</Chip>}
          </div>
        ))}
      </div>

      <div className="wf-col" style={{ flex: 1.2 }}>
        <div className="wf-card">
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>Sales <span style={{ fontSize: 14, color: 'var(--ink-3)', fontFamily: "'Patrick Hand'" }}>· price, promos, offers</span></h3>
            <Chip kind="ghost">1 selected</Chip>
          </div>

          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="wf-card" style={{ background: 'rgba(31,89,194,.05)', borderColor: 'var(--accent)' }}>
              <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <h4>Change base price</h4>
                  <div className="step-hint">Public · persists until next change</div>
                </div>
                <Chip kind="accent">selected ✓</Chip>
              </div>
              <div className="wf-row" style={{ gap: 14, marginTop: 10, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <Slider pct={32} />
                  <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                    <span className="step-hint">$2.50</span>
                    <span className="step-hint">$6.50</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: 32, fontWeight: 700, color: 'var(--accent)', minWidth: 80, textAlign: 'right' }}>$4.00</div>
              </div>
              <div className="annot-row">soft warning: 5¢ below their flash-sale price</div>
            </div>

            {[
              { name: 'Flash sale',         desc: '24-hr discount · public, one-shot',   cost: '-$30 cost', vis: 'public',   lock: '' },
              { name: 'Bundle promo',       desc: 'Combo pricing · public',              cost: 'free',      vis: 'public',   lock: '' },
              { name: 'Price-match guarantee', desc: 'Match opp price · public commit',  cost: '-$10 setup',vis: 'public',   lock: 'requires reputation ≥ 0.6' },
              { name: 'Premium positioning',desc: 'Lift menu prices broadly · public',   cost: 'free',      vis: 'public',   lock: '' },
            ].map((a, i) => (
              <div key={a.name} className="wf-card" style={{ padding: 12, opacity: a.lock ? .55 : 1 }}>
                <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                    <div className="step-hint" style={{ margin: 0 }}>{a.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Chip kind="ghost">{a.cost}</Chip>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{a.vis}</div>
                  </div>
                </div>
                {a.lock ? (
                  <div className="annot-row" style={{ color: 'var(--ink-3)' }}>🔒 {a.lock}</div>
                ) : (
                  <div style={{ marginTop: 8 }}><Btn>Add to plan</Btn></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wf-col" style={{ flex: '0 0 240px' }}>
        <div className="wf-card" style={{ borderWidth: 2 }}>
          <div className="eyebrow">Your plan · 2 / 3</div>
          {SELECTED.map((s, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < 2 ? '1px dashed var(--ink-3)' : 'none' }}>
              {s ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <DomBadge d={s.dom} />
                    <span style={{ color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>✕</span>
                  </div>
                  <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14, marginTop: 4 }}>{s.label}</div>
                  <div className="step-hint" style={{ margin: '2px 0 0' }}>{s.sub}</div>
                </>
              ) : (
                <div className="empty" style={{ color: 'var(--ink-3)', fontFamily: "'Gloria Hallelujah',cursive", fontSize: 13, padding: '20px 0', textAlign: 'center' }}>slot {i + 1} empty</div>
              )}
            </div>
          ))}
          <div className="step-hint" style={{ marginTop: 8 }}>est. impact: <b style={{ color: 'var(--warm)' }}>-$25</b></div>
          <Btn kind="primary" style={{ marginTop: 10, width: '100%' }}>Review &amp; submit</Btn>
        </div>

        <div className="wf-card">
          <div className="eyebrow">Opponent (public)</div>
          <KV k="Last price" v="$3.95" />
          <KV k="Customers" v="168" />
          <KV k="Review" v="4.0 ★" />
          <KV k="Last action" v="Flash sale" />
          <Btn kind="ghost">Scout for $25</Btn>
        </div>
      </div>
    </div>
  </>
);

// ── C: drafting flow · 3 columns like a Pokemon-Showdown team picker ──────
const DecideC = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 5 · drafting your turn</div>
        <h2>3 moves. Pick wisely.</h2>
      </div>
      <Chip kind="warm">⏱ 18h 42m</Chip>
    </div>

    {/* horizontal slot tray — top, large */}
    <div className="slots" style={{ marginBottom: 14 }}>
      {[0, 1, 2].map(i => {
        const s = SELECTED[i];
        return (
          <div key={i} className={`slot ${s ? 'filled' : ''}`} style={{ minHeight: 110 }}>
            <span className="num">Slot {i + 1}</span>
            {s ? (
              <>
                <span className="x">✕</span>
                <DomBadge d={s.dom} />
                <div className="label" style={{ fontSize: 16 }}>{s.label}</div>
                <div className="sub">{s.sub}</div>
              </>
            ) : (
              <div className="empty" style={{ paddingTop: 30, fontSize: 14 }}>↓ tap an action below</div>
            )}
          </div>
        );
      })}
    </div>

    {/* domain "browser" — collapsed accordion of 6 domains, each showing 2-3 actions */}
    <div className="wf-grid cols-2">
      {DOMAINS.map((dm, i) => (
        <div key={dm.d} className="wf-card" style={{ padding: 12 }}>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="wf-row" style={{ gap: 10, alignItems: 'center' }}>
              <div className="icon" style={{ width: 28, height: 28, fontSize: 18 }}>{dm.icon}</div>
              <div>
                <h4>{dm.d}</h4>
                <div className="dom-sub">{dm.sub}</div>
              </div>
            </div>
            <DomBadge d={dm.d} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dm.actions.slice(0, 3).map((a, j) => {
              const picked = (i === 0 && j === 0) || (i === 3 && j === 2);
              const lockedExample = i === 5 && j === 2;
              return (
                <div key={a} className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', border: `1.5px ${picked ? 'solid var(--accent)' : 'dashed var(--ink-3)'}`, borderRadius: 8, background: picked ? 'rgba(31,89,194,.06)' : 'transparent', opacity: lockedExample ? .55 : 1 }}>
                  <div>
                    <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{a}</div>
                    <div className="step-hint" style={{ margin: 0 }}>{j === 0 ? 'public · persists' : j === 1 ? 'one-shot · private effect' : 'investment · 2 rounds'}</div>
                  </div>
                  {lockedExample ? (
                    <Chip kind="ghost">🔒 needs $25</Chip>
                  ) : picked ? (
                    <Chip kind="accent">✓ picked</Chip>
                  ) : (
                    <Btn>+</Btn>
                  )}
                </div>
              );
            })}
            <Btn kind="ghost" style={{ alignSelf: 'flex-start' }}>more in {dm.d.toLowerCase()} →</Btn>
          </div>
        </div>
      ))}
    </div>

    {/* sticky-feeling bottom bar */}
    <div className="wf-card accent" style={{ marginTop: 14, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div className="eyebrow" style={{ color: 'var(--accent)', margin: 0 }}>2 of 3 slots filled</div>
        <div className="step-hint" style={{ margin: 0 }}>You can spend all 3 in one domain or spread them out.</div>
      </div>
      <div className="wf-row" style={{ gap: 8 }}>
        <Btn kind="ghost">⟲ Reset</Btn>
        <Btn kind="primary" className="big">Review &amp; submit →</Btn>
      </div>
    </div>
  </>
);

window.DecideOptions = [
  { tag: 'A', title: 'Grid + sticky slot tray',  why: '6 domains as cards; persistent state strip; slot tray at bottom.',  Body: DecideA },
  { tag: 'B', title: 'Master / detail picker',    why: 'Pick a domain on the left; deep action list center; plan rail right.', Body: DecideB },
  { tag: 'C', title: 'Drafting flow (slots top)', why: 'Slots on top like a team-builder; tap actions below to fill them.',   Body: DecideC },
];
