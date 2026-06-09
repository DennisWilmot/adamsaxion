// Margin — "system decisions" cards. Each makes one audit fix tangible:
// before (the inconsistency) vs after (the rule). Renders in DesignCanvas.

const SCard = ({ title, note, children }) => (
  <div className="mt" style={{ height: '100%', background: T.card, display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '16px 18px 0' }}>
      <h3 className="serif" style={{ fontSize: 20, color: T.ink, fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.45, margin: '6px 0 0' }}>{note}</p>
    </div>
    <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>{children}</div>
  </div>
);

const BA = ({ k }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: k === 'before' ? T.red : T.green, marginBottom: 8 }}>
    {k === 'before' ? '✕ Before' : '✓ After'}
  </div>
);
const Slab = ({ children, tone }) => (
  <div style={{ background: tone === 'bad' ? T.redSoft : T.paper2, border: `1px solid ${tone === 'bad' ? '#f6cccc' : T.rule}`, borderRadius: 11, padding: 13 }}>{children}</div>
);

// glossy emoji approximation for the "before" icon row
const GlossTile = ({ c }) => (
  <div style={{ width: 38, height: 38, borderRadius: 9, border: `2px solid ${c}`,
    background: `radial-gradient(circle at 32% 26%, #fff, ${c}22 55%, ${c}55 100%)`,
    boxShadow: '0 1px 2px rgba(0,0,0,.2), inset 0 1px 1px rgba(255,255,255,.7)' }} />
);

const CardIcons = () => (
  <SCard title="Domain icons" note="Glossy 3-D emoji clashed with a flat editorial UI and the colored rings taught nothing. Replaced with flat tinted glyph chips — same info, one material.">
    <Slab tone="bad"><BA k="before" /><div style={{ display: 'flex', gap: 7 }}>{['#c2410c','#15803d','#0a52c4','#b45309','#9333ea','#334155'].map(c => <GlossTile key={c} c={c} />)}</div></Slab>
    <Slab><BA k="after" /><DomainRow active="ops" /></Slab>
  </SCard>
);

const CardMoney = () => (
  <SCard title="Money, one way" note="¢ and $ were mixed for the same concept — sometimes on one card, in two fonts. Now: cash and price each have one mono format, used identically everywhere.">
    <Slab tone="bad"><BA k="before" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 18, color: T.ink }}>540¢</span>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: T.green }}>+$54</span>
        <span className="mono" style={{ fontSize: 18, color: T.ink }}>$554</span>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: T.ink }}>$706</span>
      </div>
    </Slab>
    <Slab><BA k="after" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Eyebrow>Cash</Eyebrow><Cash v={554} size={19} color={T.ink} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Eyebrow>This round</Eyebrow><Cash v={54} sign size={19} color={T.green} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Eyebrow>Price</Eyebrow><Price v={450} size={19} color={T.ink} /></div>
      </div>
    </Slab>
  </SCard>
);

const CardButtons = () => (
  <SCard title="One button family" note="Primary flipped between black and blue, pill and rounded-rect, with grey for destructive. Now: blue = primary, ghost = secondary, red = destructive. One shape.">
    <Slab tone="bad"><BA k="before" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ background: '#000', color: '#fff', fontWeight: 600, fontSize: 12.5, padding: '9px 15px', borderRadius: 8 }}>Review and lock</span>
        <span style={{ background: T.blue, color: '#fff', fontWeight: 600, fontSize: 12.5, padding: '9px 15px', borderRadius: 999 }}>Lock 3 moves</span>
        <span style={{ background: '#c8ccd2', color: '#fff', fontWeight: 600, fontSize: 12.5, padding: '9px 15px', borderRadius: 999 }}>Confirm forfeit</span>
      </div>
    </Slab>
    <Slab><BA k="after" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="primary" size="sm">Review and lock →</Btn>
        <Btn kind="ghost" size="sm">Back to edit</Btn>
        <Btn kind="danger" size="sm">Forfeit</Btn>
      </div>
    </Slab>
  </SCard>
);

const CardColor = () => (
  <SCard title="Color has one job each" note="Blue meant you, primary, and links at once — and six domain hues collided with it. Now blue = you / primary only; green = money; red = danger; domain hues live only on the 6 chips.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {[['Brand blue', T.blue, 'You · primary action'], ['Green', T.green, 'Money / gains'], ['Red', T.red, 'Danger / forfeit'], ['Amber', '#eab308', 'Coach · alerts']].map(([n, c, u]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: c, flex: '0 0 auto' }} />
          <div><div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{n}</div><div style={{ fontSize: 11.5, color: T.ink3 }}>{u}</div></div>
        </div>
      ))}
      <div style={{ height: 1, background: T.rule, margin: '2px 0' }} />
      <div style={{ display: 'flex', gap: 7 }}>{Object.keys(T.d).map(k => <DomainChip key={k} dk={k} size={30} selected />)}</div>
      <div style={{ fontSize: 11, color: T.ink3 }}>Domain hues — decoration only, never status.</div>
    </div>
  </SCard>
);

const CardType = () => (
  <SCard title="Type roles, enforced" note="Same trio you have — the fix is discipline. Serif for display moments only, sans for everything you read, mono for every number you compare.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div><Eyebrow>Serif · display only</Eyebrow><div className="serif" style={{ fontSize: 26, color: T.ink, fontWeight: 700, lineHeight: 1 }}>You disconnected.</div></div>
      <div style={{ height: 1, background: T.rule }} />
      <div><Eyebrow>Sans · body & labels</Eyebrow><div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.45, marginTop: 3 }}>Round 1 is in the books. Both shops had a solid day.</div></div>
      <div style={{ height: 1, background: T.rule }} />
      <div><Eyebrow>Mono · compared numbers</Eyebrow><div className="mono" style={{ fontSize: 18, color: T.ink, marginTop: 3 }}>$554 · 450¢ · 3.8★ · 45 served</div></div>
    </div>
  </SCard>
);

Object.assign(window, { CardIcons, CardMoney, CardButtons, CardColor, CardType });
