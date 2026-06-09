// Action Library — the rendering spec.
// Every action in the catalog has metadata; this tab shows one example per inputType
// + a master table of every action mapped to its input.

// Library examples — show the SIMPLER default view per input type.
// (Hover/click on any in the live game opens the same expanded tooltip as Decide.)
const LIBRARY_EXAMPLES = [
  {
    id: 'price', name: 'Change base price', domain: 'Sales',
    tagline: 'Set the price customers see until you change it again.',
    inputType: 'slider',
    inputConfig: { min: 2.5, max: 6.5, value: 4.0, step: 0.25, prefix: '$', ticks: 'persists until changed' },
    layers: [ { kind: 'public' } ],
    alwaysShowInput: true,
    mechanic: 'Lower prices may bring more customers — only helps if extra volume beats the lost margin.',
    knownCost: '$0', visibility: 'Public', durationText: 'Persistent',
    strong: 'demand is elastic and you have capacity',
    risky:  'demand is flat or capacity is tight',
  },
  {
    id: 'hire', name: 'Hire workers', domain: 'HR',
    tagline: 'Add capacity. Wages start next round.',
    inputType: 'stepper',
    inputConfig: { value: 1, min: 0, max: 4, label: 'workers to hire' },
    layers: [ { kind: 'upfront', value: '-$120 / hire' }, { kind: 'ongoing', value: '-$14/hr each' } ],
    mechanic: 'New hires join next round at base skill.',
    knownCost: '-$120 per hire', ongoingText: '-$14/hr per worker',
    visibility: 'Private', durationText: 'Until fired',
    strong: 'foot traffic exceeds capacity often',
    risky:  'late in the match · new hires need rounds to pay back',
  },
  {
    id: 'supplier', name: 'Upgrade supplier', domain: 'Procurement',
    tagline: 'Pick a tier. Cost and quality both move.',
    inputType: 'single_choice',
    inputConfig: { value: 'std', options: [
      { id: 'cheap', label: 'Cheap',    sub: '-$0.25/cup · review ▼' },
      { id: 'std',   label: 'Standard', sub: 'baseline' },
      { id: 'prem',  label: 'Premium',  sub: '+$0.40/cup · review ▲' },
    ]},
    layers: [],
    alwaysShowInput: true,
    mechanic: 'Sets the cost-per-cup floor and the base quality of every drink.',
    knownCost: '$0 switching · cost-per-cup changes',
    visibility: 'Private (cup price is public)',
    durationText: 'Persistent',
    strong: 'you can defend a higher posted price',
    risky:  'cheap tier · one bad review tanks reputation',
  },
  {
    id: 'loyalty', name: 'Launch loyalty program', domain: 'Marketing',
    tagline: 'Convert casuals into regulars over time.',
    inputType: 'toggle',
    inputConfig: { on: false, label: 'loyalty program' },
    layers: [ { kind: 'upfront', value: '-$60 setup' }, { kind: 'ongoing', value: '-$20/round' }, { kind: 'public' } ],
    mechanic: 'Converts a share of casuals into regulars every round it runs.',
    knownCost: '-$60 setup', ongoingText: '-$20 / round',
    visibility: 'Public', durationText: 'Persistent until cancelled',
    strong: 'launched R1-R3 · runway to pay back',
    risky:  'past R5 · sunk cost if match ends',
  },
  {
    id: 'flash', name: 'Flash sale', domain: 'Sales',
    tagline: 'One-round discount to pull in casual customers.',
    inputType: 'one_shot',
    inputConfig: { label: 'Queue flash sale' },
    layers: [ { kind: 'public' }, { kind: 'duration', value: 'this round' } ],
    mechanic: 'Effective price drops 20% for one round. Customers see a "sale" badge.',
    knownCost: '$0', visibility: 'Public', durationText: 'This round only',
    strong: 'foot traffic is high (weather, events)',
    risky:  'traffic is normal',
  },
  {
    id: 'loan', name: 'Take a loan', domain: 'Finance',
    tagline: 'Cash now. Interest every round until repaid.',
    inputType: 'amount_input',
    inputConfig: { value: 200, prefix: '$' },
    layers: [ { kind: 'ongoing', value: '-8% interest/round' } ],
    mechanic: 'Adds principal to cash. Interest deducted every round until repayment.',
    knownCost: '+cash now', ongoingText: '-8% interest/round',
    visibility: 'Private', durationText: 'Until repaid',
    strong: 'R3-R4 if you over-invested early',
    risky:  'R7+ · interest outruns runway',
  },
  {
    id: 'scout', name: 'Scout opponent', domain: 'Finance',
    tagline: 'Pick one thing to peek at.',
    inputType: 'target_selection',
    inputConfig: { value: 'cash', options: [
      { id: 'cash',     label: 'Cash range',     sub: 'broad band' },
      { id: 'staff',    label: 'Staff count',    sub: 'exact' },
      { id: 'supplier', label: 'Supplier tier',  sub: 'exact' },
      { id: 'rep',      label: 'Reputation',     sub: 'qualitative' },
    ]},
    layers: [ { kind: 'upfront', value: '-$25' } ],
    mechanic: 'Reveals one slice of Marina\'s hidden state at end of round.',
    knownCost: '-$25', visibility: 'Private', durationText: 'This round',
    strong: 'R3-R5 · time to act on the intel',
    risky:  'R6+ · no runway to use what you learn',
  },
  {
    id: 'deploy', name: 'Choose operations focus', domain: 'Operations',
    tagline: 'How your shop behaves day-to-day.',
    inputType: 'mode_selector',
    inputConfig: { value: 'balanced', options: [
      { id: 'speed',    label: 'Speed',         sub: 'throughput ▲ · quality ▼' },
      { id: 'quality',  label: 'Quality',       sub: 'review ▲ · cost ▲' },
      { id: 'balanced', label: 'Balanced',      sub: 'no penalties' },
      { id: 'service',  label: 'Customer focus',sub: 'regulars ▲ · throughput ▼' },
    ]},
    layers: [],
    alwaysShowInput: true,
    mechanic: 'Sets default tradeoffs across operations. Most actions inherit this stance.',
    knownCost: '$0', visibility: 'Private', durationText: 'Persistent until changed',
    strong: 'committed early',
    risky:  'switching mid-match · loses tempo',
  },
  {
    id: 'pricematch', name: 'Price-match guarantee', domain: 'Sales',
    tagline: 'Commit to matching Marina\'s posted price.',
    inputType: 'toggle',
    inputConfig: { on: false, label: 'price-match guarantee' },
    layers: [ { kind: 'locked', value: 'reputation ≥ Good' } ],
    locked: true,
    mechanic: 'If Marina\'s posted price ends below yours, your effective price drops to match.',
    knownCost: '-$10 setup', visibility: 'Public', durationText: 'Persistent',
    lockedReason: 'Requires reputation Good or higher',
    strong: 'deterrent · held 3+ rounds',
    risky:  'opp cuts anyway · you eat the margin',
  },
];

const InputTypeRef = () => {
  const ROWS = [
    { type: 'slider',           use: 'Continuous value',           ex: 'Price, wage, marketing budget, training $' },
    { type: 'stepper',          use: 'Count or level change',      ex: 'Hire/fire, hours, inventory buffer' },
    { type: 'single_choice',    use: 'Pick one from small set',    ex: 'Supplier tier, campaign type, loan type' },
    { type: 'multi_choice',     use: 'Pick several',               ex: 'Bundle items, audience tags' },
    { type: 'toggle',           use: 'Persistent on/off program',  ex: 'Loyalty, price-match, insurance, reserves' },
    { type: 'one_shot',         use: 'Discrete tactical move',     ex: 'Flash sale, sponsor, poach, rebrand, scout' },
    { type: 'amount_input',     use: 'Numeric input · open range', ex: 'Loan principal, repayment, bonus $' },
    { type: 'target_selection', use: 'Pick a target attribute',    ex: 'Scout target, counter-marketing focus' },
    { type: 'mode_selector',    use: 'Posture · 3-4 options',      ex: 'Deployment mode, investment stance' },
    { type: 'none',             use: 'No input · just commit',     ex: 'Confirmation-only actions' },
  ];
  return (
    <div className="wf-card">
      <div className="eyebrow">Input type vocabulary · canonical names</div>
      <div style={{ overflowX: 'auto', marginTop: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <th style={{ padding: '6px 8px', borderBottom: '1.5px solid var(--ink)' }}>inputType</th>
              <th style={{ padding: '6px 8px', borderBottom: '1.5px solid var(--ink)' }}>Use when…</th>
              <th style={{ padding: '6px 8px', borderBottom: '1.5px solid var(--ink)' }}>Examples</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r.type} style={{ borderBottom: '1px dashed var(--ink-3)' }}>
                <td style={{ padding: '8px', fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--accent)' }}>{r.type}</td>
                <td style={{ padding: '8px', fontFamily: "'Kalam',cursive", fontWeight: 700 }}>{r.use}</td>
                <td style={{ padding: '8px', color: 'var(--ink-2)' }}>{r.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LayerLegend = () => (
  <div className="wf-card">
    <div className="eyebrow">What's shown by default · what hides behind hover</div>
    <div className="wf-grid cols-2" style={{ marginTop: 8, gap: 14 }}>
      <div>
        <h4 style={{ color: 'var(--good)', marginBottom: 6 }}>Visible on the card</h4>
        <div className="layers" style={{ marginBottom: 6 }}>
          <Layer kind="upfront" value="-$25" />
          <Layer kind="ongoing" value="-$10/round" />
          <Layer kind="public" />
          <Layer kind="locked" value="reputation ≥ Good" />
          <Layer kind="duration" value="this round" />
          <Layer kind="delay" value="effect in 2 rounds" />
        </div>
        <div className="step-hint" style={{ margin: 0 }}>
          Only when meaningful. Zero-cost actions don't get a cost chip. "Persistent" and "Private" are the defaults — they stay quiet.
        </div>
      </div>
      <div>
        <h4 style={{ color: 'var(--accent)', marginBottom: 6 }}>Hidden in the tooltip</h4>
        <div className="layers" style={{ marginBottom: 6 }}>
          <Layer kind="forecast" value="likely traffic ▲" />
          <Layer kind="risk" value="if demand stays flat" />
          <span className="layer" style={{ borderColor: 'var(--ink-3)' }}><span className="lk">mechanic</span>1-2 sentences</span>
          <span className="layer" style={{ borderColor: 'var(--ink-3)' }}><span className="lk">strong when</span>plain-English</span>
          <span className="layer" style={{ borderColor: 'var(--ink-3)' }}><span className="lk">risky when</span>plain-English</span>
        </div>
        <div className="step-hint" style={{ margin: 0 }}>
          Mechanic explanation, forecasts and risks live behind hover. They inform — they never appear as guaranteed numbers.
        </div>
      </div>
    </div>
  </div>
);

const ActionDataModel = () => (
  <div className="wf-card tinted">
    <div className="eyebrow">ActionDefinition · the bridge between spreadsheet and React</div>
    <pre style={{ margin: '6px 0 0', fontFamily: 'ui-monospace,monospace', fontSize: 12, lineHeight: 1.5, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
{`type ActionDefinition = {
  id: string;
  domain: 'Sales'|'Procurement'|'Operations'|'HR'|'Marketing'|'Finance';
  name: string;
  tagline: string;                 // 1-line summary shown in card head
  inputType: ActionInputType;      // see vocabulary above
  inputConfig: Record<string, any>;// { min, max, step, options, … }

  upfrontCost:  number | null;     // exact, always knowable
  ongoingCost:  number | null;     // exact, recurring
  visibility:   'public'|'private'|'inferable'|'revealed_after';
  duration:     'instant'|'one_round'|'multi_round'|'persistent';
  timing:       'this_round'|'next_round'|'delayed';

  prerequisites: string[];         // unlocks gating
  conflictsWith: string[];         // hard / soft conflict ids
  warnings:      string[];         // soft conflict copy

  forecastText: string;            // 1-line "likely outcome"
  riskText:     string;            // 1-line "how this backfires"
  mechanic:     string;            // 2-3 sentence layer-2 explainer
  strategy:     string;            // layer-3 strategic note
};`}
    </pre>
  </div>
);

// Master catalog — every move in every domain, mapped to its inputType.
// Names are PUNCHY — "moves, not settings" (per feedback).
const FULL_CATALOG = {
  Sales: [
    { name: 'Change base price',     input: 'slider',          notes: 'persistent · public' },
    { name: 'Run a flash sale',       input: 'one_shot',        notes: 'one round · public' },
    { name: 'Launch a bundle',        input: 'multi_choice',    notes: 'one round · public' },
    { name: 'Price-match guarantee',  input: 'toggle',          notes: 'persistent · public · prereq' },
    { name: 'Reposition as premium',  input: 'one_shot',        notes: 'persistent · public · prereq' },
  ],
  Procurement: [
    { name: 'Upgrade supplier',       input: 'single_choice',   notes: 'persistent · private' },
    { name: 'Stock up',               input: 'stepper',         notes: 'persistent · private' },
    { name: 'Emergency restock',      input: 'one_shot',        notes: 'one-shot · private' },
    { name: 'Sign exclusive supplier',input: 'one_shot',        notes: 'persistent · inferable' },
    { name: 'Go local',               input: 'toggle',          notes: 'persistent · private' },
  ],
  Operations: [
    { name: 'Choose operations focus',input: 'mode_selector',   notes: 'persistent · private' },
    { name: 'Activate overtime',      input: 'one_shot',        notes: 'one round · private' },
    { name: 'Upgrade equipment',      input: 'single_choice',   notes: 'persistent · private' },
    { name: 'Do maintenance',         input: 'one_shot',        notes: 'one-shot · private' },
    { name: 'Adjust opening hours',   input: 'stepper',         notes: 'persistent · private' },
    { name: 'Start an R&D project',   input: 'single_choice',   notes: 'delayed · private' },
  ],
  HR: [
    { name: 'Hire workers',           input: 'stepper',         notes: 'persistent · private' },
    { name: 'Let workers go',         input: 'stepper',         notes: 'persistent · private' },
    { name: 'Raise wages',            input: 'slider',          notes: 'persistent · private' },
    { name: 'Train staff',            input: 'amount_input',    notes: 'delayed · private' },
    { name: 'Pay a bonus',            input: 'amount_input',    notes: 'one-shot · private' },
    { name: 'Improve conditions',     input: 'one_shot',        notes: 'persistent · private' },
    { name: 'Poach competitor staff', input: 'one_shot',        notes: 'one-shot · inferable' },
  ],
  Marketing: [
    { name: 'Advertise locally',      input: 'slider',          notes: 'persistent · inferable' },
    { name: 'Run a targeted campaign',input: 'target_selection',notes: 'one round · private' },
    { name: 'Launch loyalty program', input: 'toggle',          notes: 'persistent · public' },
    { name: 'Sponsor a local event',  input: 'one_shot',        notes: 'one round · public' },
    { name: 'Counter-market',         input: 'target_selection',notes: 'one round · inferable' },
  ],
  Finance: [
    { name: 'Take a loan',            input: 'amount_input',    notes: 'persistent · private' },
    { name: 'Repay debt',             input: 'amount_input',    notes: 'one-shot · private' },
    { name: 'Build cash reserves',    input: 'toggle',          notes: 'persistent · private' },
    { name: 'Reinvest aggressively',  input: 'mode_selector',   notes: 'persistent · private' },
    { name: 'Buy insurance',          input: 'toggle',          notes: 'persistent · private' },
    { name: 'Delay supplier payment', input: 'one_shot',        notes: 'one-shot · inferable' },
    { name: 'Scout opponent',         input: 'target_selection',notes: 'one-shot · private' },
  ],
};

const FullCatalog = () => (
  <div className="wf-card">
    <div className="eyebrow">Full catalog · {Object.values(FULL_CATALOG).reduce((a, b) => a + b.length, 0)} actions across 6 domains</div>
    <div className="wf-grid cols-3" style={{ marginTop: 8 }}>
      {Object.entries(FULL_CATALOG).map(([dom, list]) => (
        <div key={dom} className="wf-card" style={{ padding: 10 }}>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <DomBadge d={dom} />
            <span className="step-hint" style={{ margin: 0 }}>{list.length}</span>
          </div>
          {list.map(a => (
            <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px dashed var(--ink-3)', gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                <div className="step-hint" style={{ margin: 0 }}>{a.notes}</div>
              </div>
              <code style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{a.input}</code>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Library = () => (
  <>
    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">Action Library · v0.2</div>
        <h2>Quiet cards · details on hover</h2>
        <div className="step-hint">Each catalog move declares one inputType + a few meaningful chips. Mechanic, forecasts, and risks live in the hover tooltip. Catalog data drives rendering — no hand-rolled forms.</div>
      </div>
    </div>

    <InputTypeRef />

    <div style={{ marginTop: 14 }} />
    <LayerLegend />

    <div style={{ marginTop: 14 }} />
    <div className="wf-card">
      <div className="eyebrow">One example per input type · default (quiet) view</div>
      <div className="step-hint" style={{ margin: '4px 0 10px' }}>The bottom-right card is shown with its tooltip open so you can compare resting vs. hover.</div>
      <div className="wf-grid cols-2" style={{ marginTop: 4, rowGap: 60 }}>
        {LIBRARY_EXAMPLES.map((a, i) => (
          <ActionCard
            key={a.id}
            action={a}
            locked={a.locked}
            tipOpen={i === LIBRARY_EXAMPLES.length - 1}
          />
        ))}
      </div>
    </div>

    <div style={{ marginTop: 14 }} />
    <FullCatalog />

    <div style={{ marginTop: 14 }} />
    <ActionDataModel />
  </>
);

Object.assign(window, { Library, LIBRARY_EXAMPLES });
