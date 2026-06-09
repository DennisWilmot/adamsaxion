// Decide screen v3 — quieter cards, expanded view lives in the hover tooltip.
// Punchier action names. Sliders only where continuous choice is the strategic point.
// State strip stripped down to essentials + "more state".

const DOMAINS_V2 = [
  { id: 'Sales',       sub: 'price · promos · offers',   icon: '$', count: 5 },
  { id: 'Procurement', sub: 'suppliers · inventory',     icon: '⛁', count: 5 },
  { id: 'Operations',  sub: 'service · equipment',       icon: '⚙', count: 6 },
  { id: 'HR',          sub: 'hire · wages · train',      icon: '☺', count: 7 },
  { id: 'Marketing',   sub: 'ads · loyalty · events',    icon: '◎', count: 5 },
  { id: 'Finance',     sub: 'loans · scout · insure',    icon: '◆', count: 7 },
];

// Sales actions — refined per "moves, not settings" feedback.
const SALES_ACTIONS = [
  {
    id: 'price',
    name: 'Change base price',
    domain: 'Sales',
    tagline: 'Set the price customers see until you change it again.',
    inputType: 'slider',
    inputConfig: { min: 2.5, max: 6.5, value: 4.0, step: 0.25, prefix: '$', ticks: 'persists until changed' },
    layers: [ { kind: 'public' } ], // duration: persistent (hidden, default) · upfront: $0 (hidden)
    alwaysShowInput: true,
    // tooltip details
    mechanic: 'Lower prices may bring more customers — but only help if extra volume beats the lost margin.',
    knownCost: '$0',
    visibility: 'Public',
    durationText: 'Persistent',
    strong: 'demand is elastic and your capacity has headroom',
    risky:  'demand is flat or your capacity is already tight',
  },
  {
    id: 'flash',
    name: 'Flash sale',
    domain: 'Sales',
    tagline: 'One-round discount to pull in casual customers.',
    inputType: 'one_shot',
    inputConfig: { label: 'Queue flash sale' },
    layers: [ { kind: 'public' }, { kind: 'duration', value: 'this round' } ],
    mechanic: 'Effective price drops 20% for one round. Customers see a "sale" badge.',
    knownCost: '$0',
    visibility: 'Public',
    durationText: 'This round only',
    strong: 'foot traffic is high (weather, events)',
    risky:  'traffic is normal · margin loss without volume',
    tipArrow: 'expanded card lives in the hover tooltip ↘',
  },
  {
    id: 'bundle',
    name: 'Bundle promo',
    domain: 'Sales',
    tagline: 'Lift average ticket without dropping posted price.',
    inputType: 'multi_choice',
    inputConfig: { values: ['coffee'], options: [
      { id: 'coffee', label: 'Coffee + pastry' },
      { id: 'cold',   label: 'Cold brew combo' },
      { id: 'mug',    label: 'Branded mug' },
    ] },
    layers: [ { kind: 'public' }, { kind: 'duration', value: 'this round' } ],
    mechanic: 'Bundles raise the average ticket size by giving customers a reason to add an item.',
    knownCost: '$0',
    visibility: 'Public',
    durationText: 'This round',
    strong: 'you want public movement without signaling a price war',
    risky:  'inventory is tight — can stock out the bundle item',
  },
  {
    id: 'pricematch',
    name: 'Price-match guarantee',
    domain: 'Sales',
    tagline: 'Commit to matching your opponent\'s posted price.',
    inputType: 'toggle',
    inputConfig: { on: false, label: 'price-match guarantee' },
    layers: [ { kind: 'locked', value: 'reputation ≥ Good' } ],
    locked: true,
    mechanic: 'If Marina\'s posted price ends below yours, your effective price drops to match.',
    knownCost: '-$10 setup',
    visibility: 'Public',
    durationText: 'Persistent',
    lockedReason: 'Requires reputation Good or higher',
    strong: 'used as a deterrent · must hold 3+ rounds',
    risky:  'opp cuts anyway — you eat the margin automatically',
  },
  {
    id: 'premium',
    name: 'Reposition as premium',
    domain: 'Sales',
    tagline: 'Lift menu prices broadly and signal quality.',
    inputType: 'one_shot',
    inputConfig: { label: 'Reposition menu' },
    layers: [ { kind: 'upfront', value: '-$40' }, { kind: 'public' } ],
    mechanic: 'Lifts ~all prices ~8% and signals quality. Cosmetic until backed by supplier or training.',
    knownCost: '-$40',
    visibility: 'Public',
    durationText: 'Persistent',
    strong: 'paired with a Procurement upgrade in the same turn',
    risky:  'solo · just shrinks demand if quality lags',
  },
];

// Plan sidebar entries
const PICKED_V2 = [
  { dom: 'Sales', label: 'Change price to $4.00', sub: 'Public. Persists.' },
  { dom: 'HR',    label: 'Train staff',           sub: 'Private. Costs $25. Effect in 2 rounds.' },
];

// Essentials only — the rest tucks behind "more state"
const STATE_ESSENTIALS = [
  { k: 'Cash',       v: '$748' },
  { k: 'Price',      v: '$4.25' },
  { k: 'Staff',      v: '2' },
  { k: 'Reputation', v: 'Good' },
];

const DecideV2 = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Round 5 of 8</div>
        <h2>Pick 3 moves.</h2>
        <div className="step-hint" style={{ margin: 0 }}>Spend across one domain or many. Hover any card for details.</div>
      </div>
      <div className="wf-row" style={{ gap: 6, alignItems: 'center' }}>
        <RoundDots total={8} current={5} />
        <Chip kind="warm">⏱ 18h 42m</Chip>
      </div>
    </div>

    {/* slimmer state strip — essentials only */}
    <div className="wf-card tinted" style={{ padding: '10px 14px' }}>
      <div className="wf-row wrap" style={{ gap: 10, alignItems: 'center' }}>
        <span className="eyebrow" style={{ margin: 0 }}>You</span>
        {STATE_ESSENTIALS.map(s => (
          <Chip key={s.k} kind="ghost">
            <span style={{ color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 11 }}>{s.k}</span>
            &nbsp;{s.v}
          </Chip>
        ))}
        <Btn kind="ghost">more state ▾</Btn>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="eyebrow" style={{ margin: 0 }}>Marina</span>
          <Chip>$3.95 · 168 cust</Chip>
        </span>
      </div>
    </div>

    {/* master / detail */}
    <div className="wf-row" style={{ alignItems: 'flex-start', gap: 14, marginTop: 12 }}>
      {/* DOMAIN LIST */}
      <div className="wf-col" style={{ flex: '0 0 200px', gap: 6 }}>
        {DOMAINS_V2.map((dm, i) => {
          const isActive = i === 0;
          const pickedHere = dm.id === 'Sales' || dm.id === 'HR';
          return (
            <div key={dm.id} className={`wf-card ${isActive ? 'accent' : ''}`} style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, border: '1.5px solid var(--ink)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Caveat',cursive", fontSize: 18, flex: 'none' }}>{dm.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{dm.id}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{dm.count} moves</div>
              </div>
              {pickedHere && <Chip kind="accent">●</Chip>}
            </div>
          );
        })}
      </div>

      {/* ACTION DETAIL */}
      <div className="wf-col" style={{ flex: 1.2 }}>
        <div className="wf-card">
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>Sales <span style={{ fontSize: 14, color: 'var(--ink-3)', fontFamily: "'Patrick Hand'" }}>· price, promos, offers</span></h3>
            <Chip kind="ghost">1 selected</Chip>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 10 }}>
            {SALES_ACTIONS.map((a, i) => (
              // Show the second card (Flash sale) with its tooltip open to demonstrate the hover state
              <ActionCard key={a.id} action={a} picked={i === 0} locked={a.locked} tipOpen={i === 1} />
            ))}
          </div>
        </div>
      </div>

      {/* PLAN RAIL */}
      <div className="wf-col" style={{ flex: '0 0 240px' }}>
        <div className="wf-card" style={{ borderWidth: 2 }}>
          <div className="eyebrow">Your plan · 2 / 3</div>
          {[0, 1, 2].map(i => {
            const s = PICKED_V2[i];
            return (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px dashed var(--ink-3)' : 'none' }}>
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
                  <div style={{ color: 'var(--ink-3)', fontFamily: "'Gloria Hallelujah',cursive", fontSize: 13, padding: '16px 0', textAlign: 'center' }}>slot {i + 1} empty</div>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px solid var(--ink)' }}>
            <KV k="Known cost" v={<span style={{ color: 'var(--warm)' }}>-$25</span>} />
            <div className="step-hint" style={{ margin: '4px 0 0' }}>Other effects resolve after the round.</div>
          </div>

          <Btn kind="primary" style={{ marginTop: 10, width: '100%' }}>Review &amp; submit</Btn>
        </div>

        <div className="wf-card">
          <div className="eyebrow">Marina · public only</div>
          <KV k="Last price" v="$3.95" />
          <KV k="Customers" v="168" />
          <KV k="Review" v="4.0 ★" />
          <KV k="Last move" v="Flash sale" />
          <Btn kind="ghost" style={{ marginTop: 6 }}>Scout · -$25</Btn>
        </div>
      </div>
    </div>
  </>
);

window.DecideV2 = DecideV2;
