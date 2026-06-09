// Match-opening briefing — 2 directions.

const BriefingA = () => (
  <>
    <div className="wf-row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <div>
        <div className="eyebrow">New match · Coffee Shop</div>
        <h2>You vs. Marina Okafor</h2>
        <div className="step-hint">Elo 1284 · 8-5 · matched in 24s</div>
      </div>
      <Btn kind="ghost">← Lobby</Btn>
    </div>

    <div className="wf-card" style={{ background: 'var(--paper-2)' }}>
      <div className="eyebrow">The scene</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 17, lineHeight: 1.45, marginTop: 6 }}>
        You just opened a coffee shop. Someone else opened one across the street. Same block, same foot traffic, same customers walking by every day. You both pay a base cost per cup. Everything else is up to you. <b>The shop with the most profit after 8 days wins.</b>
      </p>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Objective</div>
        <h4>Highest profit, 8 rounds</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Cumulative net profit decides the match.</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Each turn</div>
        <h4>Pick 3 actions</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>From any of 6 domains. Set price (counts as one).</p>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Resolution</div>
        <h4>Simultaneous</h4>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Both submit, then the engine resolves the round.</p>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">You start with</div>
        <KV k="Cash" v="$500" />
        <KV k="Staff" v="2 · wage $14/hr" />
        <KV k="Supplier" v="Tier 2 (mid)" />
        <KV k="Equipment" v="Level 1 · basic" />
        <KV k="Price" v="$4.00 / cup (default)" />
        <KV k="Base foot traffic" v="220 / day" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">What's public</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
          <li>Both prices, customer counts, review scores</li>
          <li>Total foot traffic, market events</li>
          <li>"Public" actions: flash sale, sponsored event, loyalty launch, price-match, rebrand</li>
        </ul>
        <div className="eyebrow" style={{ marginTop: 12 }}>What's hidden</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
          <li>Cash, costs, debt, morale, supplier tier</li>
          <li>R&amp;D, inventory, deployment mode</li>
          <li>Read the public signals to infer the rest</li>
        </ul>
      </div>
    </div>

    <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
      <Chip kind="ghost">Turn timer: 24h per round</Chip>
      <Btn kind="primary" className="big">Open round 1 →</Btn>
    </div>
  </>
);

const BriefingB = () => (
  <div className="wf-row" style={{ alignItems: 'flex-start' }}>
    <div className="wf-col" style={{ flex: 1.4 }}>
      <div className="wf-card warm">
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>Coffee Shop · 8 rounds</div>
        <h2 style={{ fontSize: 38, marginTop: 4 }}>Same block. Same customers. One winner.</h2>
        <p style={{ fontFamily: "'Patrick Hand'", fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 8 }}>
          A turn-based price war. You and your opponent each run a shop on the same street.
          You see their price and their customer count. Everything else — their costs, their staff,
          their reputation, what they're planning — you'll have to read between the lines.
        </p>
        <div className="wf-row wrap" style={{ marginTop: 12, gap: 8 }}>
          <Chip kind="accent">3 actions / turn</Chip>
          <Chip kind="accent">Simultaneous resolve</Chip>
          <Chip kind="accent">24h timer</Chip>
          <Chip kind="ghost">~30 min total</Chip>
        </div>
      </div>

      <div className="wf-card">
        <div className="eyebrow">The 8 rounds at a glance</div>
        <div className="rt" style={{ marginTop: 8 }}>
          {[1,2,3,4,5,6,7,8].map(n => (
            <React.Fragment key={n}>
              <div className={`n ${n === 1 ? 'now' : ''}`}>{n}</div>
              {n < 8 && <div className="conn" />}
            </React.Fragment>
          ))}
        </div>
        <div className="wf-grid cols-4" style={{ marginTop: 14, gap: 8 }}>
          <div><div className="eyebrow">R1-2</div><div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>Opening blind</div></div>
          <div><div className="eyebrow">R3-4</div><div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>Patterns emerge</div></div>
          <div><div className="eyebrow">R5-6</div><div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>Lock in &amp; pressure</div></div>
          <div><div className="eyebrow">R7-8</div><div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>Endgame defection</div></div>
        </div>
      </div>

      <div className="wf-card">
        <div className="eyebrow">Six domains, one plan</div>
        <div className="wf-grid cols-3" style={{ marginTop: 6 }}>
          {[
            { d: 'Sales',       blurb: 'price, menu, promos' },
            { d: 'Procurement', blurb: 'inputs, suppliers' },
            { d: 'Operations',  blurb: 'deploy, equipment' },
            { d: 'HR',          blurb: 'hire, wage, train' },
            { d: 'Marketing',   blurb: 'ads, loyalty, events' },
            { d: 'Finance',     blurb: 'loans, scout, insure' },
          ].map(x => (
            <div key={x.d} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DomBadge d={x.d} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{x.blurb}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="wf-col" style={{ flex: 1 }}>
      <div className="wf-card">
        <div className="eyebrow">Your opponent</div>
        <div className="opp" style={{ marginTop: 4 }}>
          <div className="av" style={{ width: 48, height: 48, fontSize: 20 }}>MO</div>
          <div>
            <div className="name" style={{ fontSize: 18 }}>Marina Okafor</div>
            <div className="elo">Elo 1284 · 8 W / 5 L</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <KV k="Avg. price last 5" v="$4.10" />
          <KV k="Style" v="Conservative" />
          <KV k="Last seen" v="2h ago" />
        </div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Starting state</div>
        <KV k="Cash" v="$500" />
        <KV k="Staff" v="2 @ $14/hr" />
        <KV k="Supplier" v="Tier 2" />
        <KV k="Equip." v="Lvl 1" />
        <KV k="Reputation" v="Stable" />
      </div>
      <Btn kind="primary" className="big" style={{ width: '100%' }}>Start round 1 →</Btn>
      <div className="step-hint" style={{ textAlign: 'center' }}>shown once · skippable for veterans</div>
    </div>
  </div>
);

window.BriefingOptions = [
  { tag: 'A', title: 'Narrative briefing',     why: 'Heavy on the story setup. Best for first-timers; skippable later.',  Body: BriefingA },
  { tag: 'B', title: 'Hero + opponent rail',   why: 'Compresses scene to one card; emphasizes the rival and the arc.',   Body: BriefingB },
];
