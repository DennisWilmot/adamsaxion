// Café Duel — core match screens (Decide, Locked, Slim Report)

const CafeDecide = () => {
  const [active, setActive] = React.useState('sales');
  const [draft, setDraft] = React.useState({
    'flash-sale':   { cut: 15 },
  });
  const [cardStates, setCardStates] = React.useState({
    'set-price':           { price: 425 },
    'flash-sale':          { cut: 15 },
    'premium-blend':       { price: 650 },
    'bundle-deal':         { combo: 575 },
    'match-rival':         { mode: 'undercut' },
    'buy-beans':           { sacks: 4 },
    'specialty-supplier':  { tier: 'mid' },
    'hedge-futures':       { rounds: 2 },
  });
  const updateCard = (id, s) => setCardStates(prev => ({ ...prev, [id]: s }));
  const toggleDraft = (id) => setDraft(prev => {
    const next = { ...prev };
    if (next[id]) delete next[id];
    else next[id] = cardStates[id];
    return next;
  });

  const you = { name: 'You', cash: 4250, trend: [3000, 3400, 3800, 4900, 5100, 4250] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: true };

  const byDomain = {
    sales: ['set-price', 'flash-sale', 'premium-blend', 'bundle-deal', 'match-rival'],
    procurement: ['buy-beans', 'specialty-supplier', 'hedge-futures'],
    operations: [], hr: [], marketing: [], finance: [],
  };
  const visible = byDomain[active] || [];

  // Picks summary
  const draftedIds = Object.keys(draft);
  const totalCost = draftedIds.reduce((sum, id) => {
    const c = CARD_LIBRARY[id]; if (!c) return sum;
    const v = cardStates[id][c.knob.key];
    return sum + c.cost(v);
  }, 0);

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28 }}>
      <MatchBar round={3} total={8} timer="0:42" you={you} opp={opp} />

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · Coach">
          Marina just locked at 375¢ — a clear discount. If you stay premium, hold your nerve. If you blink, blink hard.
        </CoachBubble>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginTop: 22, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="tab">Your hand · Round 3</div>
              <h2 className="serif" style={{ fontSize: 28, color: CD.ink, marginTop: 2 }}>Pick up to 3 moves</h2>
            </div>
            <DomainTabs active={active} onPick={setActive} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {visible.length ? visible.map(id => (
              <InlineMoveCard key={id} cardId={id}
                              state={cardStates[id]}
                              onChange={(s) => updateCard(id, s)}
                              drafted={!!draft[id]}
                              onAdd={() => toggleDraft(id)} />
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: CD.ink3,
                            border: `1px dashed ${CD.rule}`, borderRadius: 14 }}>
                <div className="serif" style={{ fontSize: 22, color: CD.ink2 }}>No moves drafted for {active} yet.</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Coming in MVP +1.</div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: CD.cardstock, border: `1px solid ${CD.rule}`,
          borderRadius: 16, padding: 18, position: 'sticky', top: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 className="serif" style={{ fontSize: 22, color: CD.ink }}>My picks</h3>
            <span style={{ fontSize: 12, color: CD.ink3 }}>
              <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>{draftedIds.length}</span> / 3
            </span>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {[0, 1, 2].map(i => {
              const id = draftedIds[i];
              if (!id) return <PickSlot key={i} idx={i + 1} />;
              const c = CARD_LIBRARY[id];
              const v = cardStates[id][c.knob.key];
              return <PickSlot key={i} idx={i + 1} pick={{
                domain: c.domain, title: c.title,
                value: c.knob.format ? `${c.knob.format(v)}${c.knob.suffix || ''}` : String(v),
              }} />;
            })}
          </div>

          <div style={{ marginTop: 16, padding: '12px 14px', background: CD.paperDeep, borderRadius: 10, border: `1px solid ${CD.rule}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: CD.ink3 }}>Spend this round</span>
              <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>−${totalCost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
              <span style={{ color: CD.ink3 }}>After commit</span>
              <span className="num" style={{ color: CD.ink2 }}>${(you.cash - totalCost).toLocaleString()}</span>
            </div>
          </div>

          <PillBtn variant="solid" color={CD.ink} size="lg" full>
            Review &amp; lock {draftedIds.length} move{draftedIds.length === 1 ? '' : 's'} <span style={{ opacity: 0.6 }}>→</span>
          </PillBtn>
          <div style={{ textAlign: 'center', fontSize: 11, color: CD.ink3, marginTop: 8 }}>
            You can revise until both players lock.
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- Locked / Waiting state -----

const CafeLocked = () => {
  const you = { name: 'You', cash: 4130, trend: [3000, 3400, 3800, 4900, 5100, 4250, 4130] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: false };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28 }}>
      <MatchBar round={3} total={8} timer="reveal at 0:00" you={you} opp={opp} />

      <div style={{
        marginTop: 22, background: CD.cardstock, border: `1px solid ${CD.rule}`,
        borderRadius: 18, padding: '32px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <CoffeeBackdrop opacity={0.04} height={180} />
        <div style={{ position: 'relative' }}>
          <div className="tab">Round 3 · awaiting reveal</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
            You've locked. Marina is still thinking.
          </h1>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            Reveal happens when both sides commit, or when her timer runs out.
          </p>

          {/* Avatars facing off */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, marginTop: 28 }}>
            <div style={{ textAlign: 'center' }}>
              <AvatarPlayer size={88} ring={CD.terracotta} />
              <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 8 }}>You</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                             padding: '4px 10px', borderRadius: 999, background: CD.ink, color: CD.paper,
                             fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: CD.terracotta }} />
                LOCKED
              </span>
            </div>
            <div className="serif" style={{ fontSize: 36, color: CD.ink3, fontStyle: 'italic' }}>vs</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <AvatarOpponent size={88} ring={CD.ink4} />
                <div className="cd-pulse" style={{
                  position: 'absolute', inset: -6, borderRadius: 18,
                  border: `2px solid ${CD.terracotta}`, opacity: 0.6,
                }} />
              </div>
              <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 8 }}>Marina K.</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                             padding: '4px 10px', borderRadius: 999, background: CD.paper, color: CD.ink2,
                             fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', border: `1px solid ${CD.rule}` }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: CD.terracotta }} className="cd-pulse" />
                CHOOSING
              </span>
            </div>
          </div>

          {/* Your locked picks */}
          <div style={{ marginTop: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
            <div className="tab" style={{ marginBottom: 8 }}>Your sealed orders</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { domain: 'sales', title: 'Flash sale', value: '−15% this round' },
                { domain: 'procurement', title: 'Buy beans', value: '4 sacks · $880' },
                { domain: 'marketing', title: 'Local poster run', value: '$240' },
              ].map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: CD.paper, border: `1px solid ${CD.rule}`, borderRadius: 10,
                }}>
                  <DomainGlyph domain={p.domain} size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: CD.ink, fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: CD.ink3 }}>{p.value}</div>
                  </div>
                  <span style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em' }}>SEALED</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <PillBtn variant="outline" color={CD.ink}>Unlock &amp; revise</PillBtn>
            <PillBtn variant="ghost" color={CD.ink3}>Forfeit match</PillBtn>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · While we wait">
          Most players over-react after a loss. If she stays cheap and you keep flashing sales, you both bleed. Plan the next two rounds, not just this one.
        </CoachBubble>
      </div>
    </div>
  );
};

// ----- Slim round report (strip-only, scan in 1 second) -----

const SlimDelta = ({ value, label, lean }) => {
  const positive = value >= 0;
  return (
    <div style={{
      flex: 1, padding: '14px 18px',
      background: lean ? CD.cardstockHi : CD.paper,
      border: `1px solid ${lean ? CD.rule : CD.rule}`,
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{label}</div>
      <div className="num serif" style={{
        fontSize: 36, lineHeight: 1, marginTop: 4,
        color: positive ? CD.green : CD.red,
      }}>
        {positive ? '+' : ''}${Math.abs(value).toLocaleString()}
      </div>
    </div>
  );
};

const CafeReport = () => {
  const you = { name: 'You',       cash: 3350, delta: -900, price: 425, sold: 198 };
  const opp = { name: 'Marina K.', cash: 4480, delta: +320, price: 375, sold: 248 };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28 }}>
      <MatchBar round={3} total={8} timer="next round"
                you={{ name: 'You', cash: 3350, trend: [3000, 3400, 3800, 4900, 5100, 4250, 3350] }}
                opp={{ name: 'Marina K.', elo: 1284, price: 375, locked: false }} />

      {/* Slim report strip */}
      <div style={{
        marginTop: 18, background: CD.cardstock, border: `1px solid ${CD.rule}`,
        borderRadius: 16, padding: 22,
      }}>
        {/* Top line: round + weather + demand + verdict */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="tab">Round 2 · resolved</div>
          <WeatherChip kind="rain" label="Rainy Tuesday" delta={-6} />
          <span style={{ fontSize: 13, color: CD.ink2 }}>
            <span style={{ color: CD.ink3 }}>demand</span>{' '}
            <span className="num" style={{ color: CD.ink, fontWeight: 600 }}>406</span>
            <span style={{ color: CD.ink3 }}> cups across the block</span>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 14, color: CD.ink2 }}>
            <span className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: CD.terracotta }}>Marina</span> took the morning.
          </span>
        </div>

        {/* Deltas — the only thing the eye needs */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <SlimDelta value={you.delta} label="Your cash this round" />
          <SlimDelta value={opp.delta} label="Marina's cash this round" lean />
        </div>

        {/* Footer line: tiny detail row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginTop: 14,
          paddingTop: 14, borderTop: `1px dashed ${CD.rule}`, fontSize: 12, color: CD.ink2,
        }}>
          <span><AvatarPlayer size={20} /></span>
          <span><span style={{ color: CD.ink3 }}>price </span><span className="num">{you.price}¢</span></span>
          <span><span style={{ color: CD.ink3 }}>sold </span><span className="num">{you.sold}</span></span>
          <span style={{ marginLeft: 'auto' }}><span style={{ color: CD.ink3 }}>sold </span><span className="num">{opp.sold}</span></span>
          <span><span style={{ color: CD.ink3 }}>price </span><span className="num">{opp.price}¢</span></span>
          <span><AvatarOpponent size={20} /></span>
        </div>
      </div>

      {/* Quick CTA row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <PillBtn variant="solid" color={CD.ink} size="lg">
          Continue to Round 3 <span style={{ opacity: 0.6 }}>→</span>
        </PillBtn>
        <PillBtn variant="outline" color={CD.ink}>Replay round</PillBtn>
        <PillBtn variant="ghost" color={CD.ink3}>Back to lobby</PillBtn>
      </div>
    </div>
  );
};

Object.assign(window, { CafeDecide, CafeLocked, CafeReport });
