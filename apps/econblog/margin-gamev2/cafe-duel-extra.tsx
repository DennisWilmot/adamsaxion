// Café Duel — out-of-scope screens added back: Rematch, Review&submit (modal + inline),
// Austerity calm, Bankruptcy clinical, Match history.

// ----- 1. Rematch · awaiting accept -----

const CafeRematch = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>

    <div style={{
      marginTop: 24, position: 'relative', overflow: 'hidden',
      background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '40px 36px',
      textAlign: 'center',
    }}>
      <CoffeeBackdrop opacity={0.05} />
      <div style={{ position: 'relative' }}>
        <div className="tab">Last match · 8 rounds · Coffee Shop</div>
        <h1 className="serif" style={{ fontSize: 48, color: CD.ink, marginTop: 6, lineHeight: 1.05 }}>
          You called for a rematch.
        </h1>
        <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
          Waiting on Marina. Most players accept within 30 seconds.
        </p>

        {/* Avatars + pending state */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, marginTop: 36 }}>
          <div style={{ textAlign: 'center' }}>
            <AvatarPlayer size={104} ring={CD.terracotta} />
            <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>You</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                          padding: '3px 10px', borderRadius: 999, background: CD.terracotta, color: CD.paper,
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>
              READY
            </div>
          </div>
          <div className="serif" style={{ fontSize: 36, color: CD.ink3, fontStyle: 'italic' }}>vs</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <AvatarOpponent size={104} ring={CD.ink4} />
              <div className="cd-pulse" style={{
                position: 'absolute', inset: -8, borderRadius: 18,
                border: `2px solid ${CD.terracotta}`, opacity: 0.6,
              }} />
            </div>
            <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>Marina K.</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                          padding: '3px 10px', borderRadius: 999, background: CD.paper,
                          color: CD.ink2, border: `1px solid ${CD.rule}`,
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>
              <span className="cd-pulse" style={{ width: 5, height: 5, borderRadius: 999, background: CD.terracotta }} />
              DECIDING
            </div>
          </div>
        </div>

        {/* Last result reminder */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 32,
                      padding: '14px 22px', background: CD.paper, border: `1px solid ${CD.rule}`, borderRadius: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="tab">Last match</div>
            <div className="num serif" style={{ fontSize: 22, color: CD.ink, marginTop: 2 }}>$5,120 · $3,890</div>
          </div>
          <div style={{ width: 1, height: 32, background: CD.rule }} />
          <div style={{ textAlign: 'center' }}>
            <div className="tab">Your Elo</div>
            <div className="num serif" style={{ fontSize: 22, color: CD.green, marginTop: 2 }}>+18</div>
          </div>
        </div>

        {/* Timeout bar */}
        <div style={{ margin: '32px auto 0', maxWidth: 380 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
            <span>Invitation expires</span>
            <span className="mono">0:42</span>
          </div>
          <div style={{ height: 6, background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: CD.terracotta }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
          <PillBtn variant="outline" color={CD.ink}>Cancel rematch</PillBtn>
          <PillBtn variant="ghost" color={CD.ink3}>Queue someone else</PillBtn>
        </div>
      </div>
    </div>
  </div>
);

// ----- 2. Review & submit · modal overlay -----

const CafeReviewModal = () => {
  const you = { name: 'You', cash: 4250, trend: [3000, 3400, 3800, 4900, 5100, 4250] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: true };

  const picks: { domain: Domain; title: string; value: string; cost: number }[] = [
    { domain: 'sales',       title: 'Flash sale',  value: '−15% this round',  cost: 120 },
    { domain: 'procurement', title: 'Buy beans',   value: '4 sacks',           cost: 880 },
    { domain: 'marketing',   title: 'Local poster run', value: 'neighborhood reach', cost: 240 },
  ];
  const totalCost = picks.reduce((s, p) => s + p.cost, 0);

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'hidden', padding: 28, position: 'relative' }}>
      <div style={{ filter: 'blur(2px)', opacity: 0.6 }}>
        <MatchBar round={3} total={8} timer="0:42" you={you} opp={opp} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
          <div style={{ height: 200, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14 }} />
          <div style={{ height: 200, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14 }} />
        </div>
      </div>

      <ModalShell width={640}>
        <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${CD.rule}` }}>
          <div className="tab">Review &amp; lock · Round 3</div>
          <h2 className="serif" style={{ fontSize: 32, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
            Last check before the bell.
          </h2>
          <p style={{ fontSize: 13.5, color: CD.ink2, marginTop: 6, lineHeight: 1.5 }}>
            Locking commits these orders. You can still revise until Marina locks too.
          </p>
        </div>

        <div style={{ padding: '20px 28px', background: CD.paperDeep }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {picks.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', background: CD.paper, border: `1px solid ${CD.rule}`, borderRadius: 12,
              }}>
                <DomainGlyph domain={p.domain} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: CD.ink, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: CD.ink3, marginTop: 2 }}>{p.value}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{ fontSize: 16, color: CD.ink, fontWeight: 600 }}>−${p.cost}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Spend summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 14px', background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 12 }}>
            <span style={{ fontSize: 13, color: CD.ink2 }}>Spend this round · cash after commit</span>
            <span>
              <span className="num" style={{ fontSize: 16, color: CD.red, fontWeight: 600, marginRight: 12 }}>−${totalCost.toLocaleString()}</span>
              <span className="num serif" style={{ fontSize: 22, color: CD.ink }}>${(you.cash - totalCost).toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <PillBtn variant="ghost" color={CD.ink3}>Back to picks</PillBtn>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillBtn variant="outline" color={CD.ink}>Revise</PillBtn>
            <PillBtn variant="solid" color={CD.terracotta} size="md">
              Lock 3 moves <span style={{ opacity: 0.6 }}>→</span>
            </PillBtn>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

// ----- 3. Review & submit · inline strip -----

const CafeReviewInline = () => {
  const you = { name: 'You', cash: 4250, trend: [3000, 3400, 3800, 4900, 5100, 4250] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: true };

  const picks: { domain: Domain; title: string; value: string; cost: number }[] = [
    { domain: 'sales',       title: 'Flash sale',  value: '−15%',  cost: 120 },
    { domain: 'procurement', title: 'Buy beans',   value: '4 sacks',  cost: 880 },
    { domain: 'marketing',   title: 'Local poster', value: 'reach', cost: 240 },
  ];
  const totalCost = picks.reduce((s, p) => s + p.cost, 0);

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28, paddingBottom: 140 }}>
      <MatchBar round={3} total={8} timer="0:42" you={you} opp={opp} />

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo">
          Three moves, big spend. Make sure the bundle works together — or you're paying for one move you'd rather have made twice.
        </CoachBubble>
      </div>

      {/* Faded cards behind */}
      <div style={{ marginTop: 22, opacity: 0.45, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <InlineMoveCard cardId="set-price" state={{ price: 425 }} onChange={() => {}} onAdd={() => {}} />
        <InlineMoveCard cardId="premium-blend" state={{ price: 650 }} onChange={() => {}} onAdd={() => {}} />
      </div>

      {/* Inline review strip — pinned to bottom */}
      <div style={{
        position: 'absolute', left: 28, right: 28, bottom: 28,
        background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16,
        boxShadow: '0 -12px 32px -16px rgba(0,0,0,0.18)',
        padding: '16px 20px',
      }} className="cd-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div className="tab">Review &amp; lock · 3 moves</div>
            <div className="serif" style={{ fontSize: 20, color: CD.ink, marginTop: 2, lineHeight: 1.1 }}>
              Last check before the bell.
            </div>
          </div>

          {/* Inline pick chips */}
          <div style={{ display: 'flex', gap: 8, flex: 1, marginLeft: 12, flexWrap: 'wrap' }}>
            {picks.map((p, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 12px 6px 8px', borderRadius: 999,
                background: CD.d[p.domain].soft, border: `1px solid ${CD.d[p.domain].c}33`,
              }}>
                <DomainGlyph domain={p.domain} size={20} />
                <span style={{ fontSize: 12.5, color: CD.ink, fontWeight: 600 }}>{p.title}</span>
                <span style={{ fontSize: 11, color: CD.ink3 }}>· {p.value}</span>
                <button style={{ border: 'none', background: 'transparent', color: CD.ink3, cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 2 }}>×</button>
              </span>
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Spend / after</div>
            <div>
              <span className="num" style={{ fontSize: 13, color: CD.red, fontWeight: 600, marginRight: 10 }}>−${totalCost.toLocaleString()}</span>
              <span className="num serif" style={{ fontSize: 22, color: CD.ink }}>${(you.cash - totalCost).toLocaleString()}</span>
            </div>
          </div>

          <PillBtn variant="solid" color={CD.terracotta} size="md">
            Lock 3 moves <span style={{ opacity: 0.6 }}>→</span>
          </PillBtn>
        </div>
      </div>
    </div>
  );
};

// ----- 4. Austerity · calm variant -----

const CafeAusterityCalm = () => {
  const you = { name: 'You', cash: 320, trend: [3000, 2200, 1400, 800, 320] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: false };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28 }}>
      <MatchBar round={6} total={8} timer="1:12" you={you} opp={opp} />

      {/* Calm state strip — single thin line, no banner */}
      <div style={{
        marginTop: 18, display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 16px', background: 'transparent',
        border: `1px solid ${CD.red}33`, borderLeft: `3px solid ${CD.red}`,
        borderRadius: 8,
      }}>
        <span style={{ fontSize: 11, color: CD.red, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700 }}>
          Tight cash
        </span>
        <span style={{ fontSize: 13, color: CD.ink2 }}>
          Some moves are out of reach. We'll show what you can still afford.
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: CD.ink3 }}>
          Cash <span className="num" style={{ color: CD.red, fontWeight: 600 }}>$320</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginTop: 22, alignItems: 'flex-start' }}>
        <div>
          <DomainTabs active="sales" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <InlineMoveCard cardId="set-price" state={{ price: 385 }} onChange={() => {}} onAdd={() => {}} />
            <InlineMoveCard cardId="match-rival" state={{ mode: 'undercut' }} onChange={() => {}} onAdd={() => {}} />
            {/* Cards too expensive: just dimmed, no overlay banner */}
            <div style={{ opacity: 0.5 }}>
              <InlineMoveCard cardId="premium-blend" state={{ price: 650 }} onChange={() => {}} onAdd={() => {}} />
            </div>
            <div style={{ opacity: 0.5 }}>
              <InlineMoveCard cardId="bundle-deal" state={{ combo: 575 }} onChange={() => {}} onAdd={() => {}} />
            </div>
          </div>
        </div>

        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 18 }}>
          <h3 className="serif" style={{ fontSize: 22, color: CD.ink }}>My picks</h3>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <PickSlot idx={1} />
            <PickSlot idx={2} />
            <PickSlot idx={3} />
          </div>
          <PillBtn variant="solid" color={CD.ink} size="lg" full>
            Lock 0 moves
          </PillBtn>
        </div>
      </div>
    </div>
  );
};

// ----- 5. Bankruptcy · clinical variant (chart-first) -----

const CafeBankruptcyClinical = () => {
  const youSeries = [5000, 4200, 3500, 2400, 1100, 200, -240];
  const oppSeries = [5000, 4900, 4750, 4900, 5100, 4920, 4820];
  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="tab">Match · Coffee Shop · 7 / 8 played</div>
          <h1 className="serif" style={{ fontSize: 40, color: CD.ink, marginTop: 4, lineHeight: 1.05 }}>
            Insolvent at Round 6.
          </h1>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 6, maxWidth: 540 }}>
            Cash crossed zero. Match resolved in Marina's favor by liquidity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <Stat label="Final" value="−$240" />
          <Stat label="Elo" value="−32" />
          <Stat label="Round" value="6/8" />
        </div>
      </div>

      {/* Big chart */}
      <div style={{ marginTop: 24, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14, padding: 22 }}>
        <div className="tab" style={{ marginBottom: 14 }}>Cash trajectory · you (ink) vs Marina (blue)</div>
        <BankruptcyChart you={youSeries} opp={oppSeries} />
        <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: CD.ink2 }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: CD.ink, marginRight: 6, verticalAlign: 'middle' }} /> You</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: CD.terracotta, marginRight: 6, verticalAlign: 'middle' }} /> Marina</span>
          <span style={{ marginLeft: 'auto', color: CD.red }}>· R6 crossed zero</span>
        </div>
      </div>

      {/* Round-by-round breakdown */}
      <div style={{ marginTop: 20, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 100px 100px',
          padding: '10px 18px', background: CD.paperDeep, borderBottom: `1px solid ${CD.rule}`,
          fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          <span>Round</span><span>Your moves</span><span>Price</span><span>Sold</span><span>You Δ</span><span>Marina Δ</span>
        </div>
        {[
          { r: 1, moves: 'Set price · Premium blend', price: '450¢', sold: 180, you: -120, opp: -50 },
          { r: 2, moves: 'Set price · Marketing',     price: '475¢', sold: 155, you: -700, opp: +120 },
          { r: 3, moves: 'Premium · Hedge · Buy beans', price: '500¢', sold: 140, you: -900, opp: +150 },
          { r: 4, moves: 'Set price · Buy beans',     price: '475¢', sold: 132, you: -1100, opp: -180 },
          { r: 5, moves: 'Bundle deal',               price: '525¢', sold: 96,  you: -1300, opp: +200 },
          { r: 6, moves: 'Match rival · Flash sale',  price: '375¢', sold: 200, you: -900, opp: -120 },
        ].map((row) => (
          <div key={row.r} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 100px 100px',
            padding: '11px 18px', borderBottom: `1px solid ${CD.rule}`, alignItems: 'center',
            background: row.r === 6 ? CD.redSoft : 'transparent',
          }}>
            <span className="num serif" style={{ fontSize: 18, color: CD.ink }}>{row.r}</span>
            <span style={{ fontSize: 13.5, color: CD.ink }}>{row.moves}</span>
            <span className="num" style={{ fontSize: 13, color: CD.ink2 }}>{row.price}</span>
            <span className="num" style={{ fontSize: 13, color: CD.ink2 }}>{row.sold}</span>
            <span className="num" style={{ fontSize: 13, color: row.you < 0 ? CD.red : CD.green, fontWeight: 600 }}>
              {row.you > 0 ? '+' : ''}{row.you}
            </span>
            <span className="num" style={{ fontSize: 13, color: row.opp < 0 ? CD.red : CD.green, fontWeight: 600 }}>
              {row.opp > 0 ? '+' : ''}{row.opp}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        <PillBtn variant="solid" color={CD.ink}>Replay this match →</PillBtn>
        <PillBtn variant="outline" color={CD.ink}>Practice cash management</PillBtn>
        <PillBtn variant="ghost" color={CD.ink3}>Back to lobby</PillBtn>
      </div>
    </div>
  );
};

const BankruptcyChart = ({ you, opp }: { you: number[]; opp: number[] }) => {
  const W = 800, H = 200, pad = 6;
  const all = [...you, ...opp, 0];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const toPath = (arr: number[]) => arr.map((v, i) => {
    const x = pad + (i / (arr.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  // Zero line position
  const zeroY = pad + (1 - (0 - min) / range) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      {/* Zero baseline */}
      <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke={CD.red} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      <text x={W - 4} y={zeroY - 4} textAnchor="end" fontSize="10" fill={CD.red} fontFamily="Inter">$0 · insolvent</text>
      <path d={toPath(opp)} stroke={CD.terracotta} strokeWidth="2" fill="none" />
      <path d={toPath(you)} stroke={CD.ink} strokeWidth="2.4" fill="none" />
      {you.map((v, i) => {
        const x = pad + (i / (you.length - 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={i === you.length - 1 ? 4 : 3} fill={v < 0 ? CD.red : CD.ink} />;
      })}
      {opp.map((v, i) => {
        const x = pad + (i / (opp.length - 1)) * (W - pad * 2);
        const y = pad + (1 - (v - min) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill={CD.terracotta} />;
      })}
    </svg>
  );
};

// ----- 6. Match history · standalone -----

interface HistoryRow {
  id: string; opp: string; oppAvatar: 'p' | 'o'; scenario: string;
  result: 'W' | 'L' | 'D'; score: string; rounds: string;
  delta: number; date: string;
}

const HISTORY: HistoryRow[] = [
  { id: '1', opp: 'Marina K.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'W', score: '$5,120 vs $3,890', rounds: '8 / 8', delta: +18, date: 'Today · 14:22' },
  { id: '2', opp: 'Ben (CPU · Hard)', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'W', score: '$4,640 vs $4,210', rounds: '8 / 8', delta: +12, date: 'Yesterday' },
  { id: '3', opp: 'Wren O.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'L', score: '$2,950 vs $4,830', rounds: '6 / 8 · forfeited', delta: -24, date: 'Yesterday' },
  { id: '4', opp: 'Sasha B.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'W', score: '$5,890 vs $4,110', rounds: '8 / 8', delta: +15, date: '3 days ago' },
  { id: '5', opp: 'Marina K.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'W', score: '$4,980 vs $4,210', rounds: '8 / 8', delta: +14, date: '4 days ago' },
  { id: '6', opp: 'Dom V.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'L', score: '$3,810 vs $4,920', rounds: '8 / 8', delta: -19, date: '5 days ago' },
  { id: '7', opp: 'Aiko T.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'L', score: '−$240 vs $4,820', rounds: '6 / 8 · bankrupt', delta: -32, date: '1 wk ago' },
  { id: '8', opp: 'Marina K.', oppAvatar: 'o', scenario: 'Coffee Shop', result: 'D', score: '$4,500 vs $4,500', rounds: '8 / 8', delta: 0, date: '1 wk ago' },
];

const ResultBadge = ({ r }: { r: HistoryRow['result'] }) => {
  const map = {
    W: { bg: 'oklch(0.94 0.04 145)', fg: CD.green, label: 'Win' },
    L: { bg: 'oklch(0.94 0.04 25)',  fg: CD.red,   label: 'Loss' },
    D: { bg: CD.paperDeep,           fg: CD.ink2,  label: 'Draw' },
  } as const;
  const m = map[r];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 999,
      background: m.bg, color: m.fg, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    }}>{m.label}</span>
  );
};

const CafeHistory = () => {
  const [filter, setFilter] = React.useState('all');
  const wins = HISTORY.filter(r => r.result === 'W').length;
  const losses = HISTORY.filter(r => r.result === 'L').length;
  const draws = HISTORY.filter(r => r.result === 'D').length;

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm">← Lobby</PillBtn>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="tab">History</div>
          <h1 className="serif" style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1.05 }}>
            Every match you've played.
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Stat label="Wins" value={String(wins)} />
          <Stat label="Losses" value={String(losses)} />
          <Stat label="Draws" value={String(draws)} />
          <Stat label="Win rate" value={`${Math.round(wins / HISTORY.length * 100)}%`} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <Segmented value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All' },
          { value: 'wins', label: 'Wins' },
          { value: 'losses', label: 'Losses' },
          { value: 'forfeit', label: 'Forfeits & bankruptcies' },
        ]} />
      </div>

      <div style={{ marginTop: 18, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 1fr 1fr 120px 120px 80px 120px',
          padding: '12px 18px', background: CD.paperDeep, borderBottom: `1px solid ${CD.rule}`,
          fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          <span>Result</span><span>Opponent</span><span>Score</span><span>Rounds</span><span>Elo</span><span>Action</span><span style={{ textAlign: 'right' }}>When</span>
        </div>
        {HISTORY.map((r, i) => (
          <div key={r.id} style={{
            display: 'grid', gridTemplateColumns: '70px 1fr 1fr 120px 120px 80px 120px',
            padding: '14px 18px', borderBottom: i < HISTORY.length - 1 ? `1px solid ${CD.rule}` : 'none', alignItems: 'center',
          }}>
            <span><ResultBadge r={r.result} /></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AvatarOpponent size={28} />
              <span style={{ fontSize: 14, color: CD.ink }}>{r.opp}</span>
            </span>
            <span className="num" style={{ fontSize: 13, color: CD.ink2 }}>{r.score}</span>
            <span style={{ fontSize: 12.5, color: CD.ink3 }}>{r.rounds}</span>
            <span className="num" style={{
              fontSize: 14, fontWeight: 600,
              color: r.delta > 0 ? CD.green : r.delta < 0 ? CD.red : CD.ink3,
            }}>
              {r.delta > 0 ? '+' : ''}{r.delta}
            </span>
            <PillBtn variant="ghost" color={CD.ink3} size="sm">View →</PillBtn>
            <span style={{ fontSize: 12, color: CD.ink3, textAlign: 'right' }}>{r.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

(window as any).CafeRematch = CafeRematch;
(window as any).CafeReviewModal = CafeReviewModal;
(window as any).CafeReviewInline = CafeReviewInline;
(window as any).CafeAusterityCalm = CafeAusterityCalm;
(window as any).CafeBankruptcyClinical = CafeBankruptcyClinical;
(window as any).CafeHistory = CafeHistory;
