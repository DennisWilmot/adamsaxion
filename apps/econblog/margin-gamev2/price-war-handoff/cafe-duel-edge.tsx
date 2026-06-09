// Café Duel — edge states: Forfeit, Undo/revise, Austerity, Bankruptcy, Abandonment

interface ModalShellProps {
  children: React.ReactNode;
  width?: number;
  align?: 'center' | 'top';
  scrim?: number;
}
const ModalShell = ({ children, width = 520, align = 'center', scrim = 0.35 }: ModalShellProps) => (
  <div style={{
    position: 'absolute', inset: 0,
    background: `oklch(0.22 0.025 55 / ${scrim})`,
    display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center', justifyContent: 'center',
    padding: 28, paddingTop: align === 'top' ? 60 : 28,
    backdropFilter: 'blur(2px)',
  }}>
    <div className="cd-pop-in" style={{
      width: '100%', maxWidth: width,
      background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 18,
      boxShadow: '0 24px 60px -16px rgba(0,0,0,0.25)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  </div>
);

// ----- Forfeit confirm -----

const CafeForfeit = () => {
  const [confirm, setConfirm] = React.useState('');
  const armed = confirm === 'FORFEIT';

  // Faded match behind
  const you = { name: 'You', cash: 1820, trend: [3000, 3400, 2800, 2100, 1820] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: true };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'hidden', padding: 28, position: 'relative' }}>
      <div style={{ filter: 'blur(2px)', opacity: 0.65 }}>
        <MatchBar round={5} total={8} timer="0:38" you={you} opp={opp} />
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ height: 220, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14 }} />
          <div style={{ height: 220, background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14 }} />
        </div>
      </div>

      <ModalShell width={540}>
        <div style={{ padding: '24px 26px 22px', borderBottom: `1px solid ${CD.rule}` }}>
          <div className="tab" style={{ color: CD.red }}>Forfeit · permanent</div>
          <h2 className="serif" style={{ fontSize: 30, color: CD.ink, marginTop: 6, lineHeight: 1.1 }}>
            Walk away from this match?
          </h2>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, lineHeight: 1.5 }}>
            Marina takes the win. You lose <span className="num" style={{ color: CD.red, fontWeight: 600 }}>−24 Elo</span> and the round-3 streak resets. There's no undo.
          </p>
        </div>

        <div style={{ padding: '18px 26px 20px', background: CD.paperDeep }}>
          <CoachBubble label="Prof. Aldo · Wait">
            You're 3 rounds from end. Down isn't out. If you're set on this, type FORFEIT below.
          </CoachBubble>
          <div style={{ marginTop: 16 }}>
            <div className="tab" style={{ marginBottom: 6 }}>Type FORFEIT to confirm</div>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.toUpperCase())}
              placeholder="FORFEIT"
              style={{
                width: '100%', padding: '12px 14px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 16, letterSpacing: '0.08em',
                background: CD.paper, color: CD.ink,
                border: `1px solid ${armed ? CD.red : CD.rule}`, borderRadius: 10, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <PillBtn variant="ghost" color={CD.ink3}>Stay in the match</PillBtn>
          <PillBtn variant="solid" color={armed ? CD.red : CD.ink3} size="md">
            Confirm forfeit
          </PillBtn>
        </div>
      </ModalShell>
    </div>
  );
};

// ----- Undo / revise warning -----

const CafeUndo = () => {
  const you = { name: 'You', cash: 4130, trend: [3000, 3400, 3800, 4900, 4130] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: false };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'hidden', padding: 28, position: 'relative' }}>
      <div style={{ filter: 'blur(2px)', opacity: 0.65 }}>
        <MatchBar round={3} total={8} timer="0:24" you={you} opp={opp} />
      </div>

      <ModalShell width={500}>
        <div style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: CD.terraSoft, color: CD.terracotta,
              display: 'grid', placeItems: 'center', fontSize: 22, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            }}>↺</div>
            <div>
              <div className="tab">Revise picks</div>
              <h2 className="serif" style={{ fontSize: 26, color: CD.ink, lineHeight: 1.1 }}>Break the seal?</h2>
            </div>
          </div>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 12, lineHeight: 1.5 }}>
            Unlocking returns your sealed orders to drafts. Marina will see <i>UNSEALED</i> next to your name — she'll know you flinched.
          </p>
          <div style={{ marginTop: 14, padding: '10px 12px', background: CD.cream, borderRadius: 10, fontSize: 13, color: CD.ink2 }}>
            <b style={{ color: CD.ink }}>Tip:</b> revising costs you nothing in Elo, but it does cost you the bluff.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <PillBtn variant="ghost" color={CD.ink3}>Keep my picks</PillBtn>
            <PillBtn variant="solid" color={CD.terracotta}>Unlock &amp; revise</PillBtn>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

// ----- Austerity (low cash) — full screen state -----

const CafeAusterity = () => {
  const you = { name: 'You', cash: 320, trend: [3000, 2200, 1400, 800, 320] };
  const opp = { name: 'Marina K.', elo: 1284, price: 375, locked: false };

  return (
    <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 28 }}>
      <MatchBar round={6} total={8} timer="1:12" you={you} opp={opp} />

      {/* Austerity banner */}
      <div style={{
        marginTop: 18, position: 'relative', overflow: 'hidden',
        background: 'oklch(0.94 0.03 25)', border: `1px solid ${CD.red}`,
        borderRadius: 14, padding: '14px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: CD.red, color: CD.paper,
            display: 'grid', placeItems: 'center', fontSize: 22, fontStyle: 'italic', fontFamily: "'Instrument Serif', serif",
          }}>!</div>
          <div style={{ flex: 1 }}>
            <div className="tab" style={{ color: CD.red }}>Austerity mode · cash below $500</div>
            <div className="serif" style={{ fontSize: 22, color: CD.ink, lineHeight: 1.2, marginTop: 2 }}>
              Only cheap moves are on the menu.
            </div>
            <div style={{ fontSize: 13, color: CD.ink2, marginTop: 4 }}>
              Spend caps to keep you in the game. Find $300+ in cash to lift the limit.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tab">Cash</div>
            <div className="num serif" style={{ fontSize: 28, color: CD.red, lineHeight: 1 }}>$320</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginTop: 22, alignItems: 'flex-start' }}>
        <div>
          <DomainTabs active="sales" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            {/* Active cheap card */}
            <InlineMoveCard cardId="set-price" state={{ price: 385 }} onChange={() => {}} onAdd={() => {}} />
            <InlineMoveCard cardId="match-rival" state={{ mode: 'undercut' }} onChange={() => {}} onAdd={() => {}} />

            {/* Grayed expensive cards */}
            <div style={{ position: 'relative' }}>
              <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                <InlineMoveCard cardId="premium-blend" state={{ price: 650 }} onChange={() => {}} onAdd={() => {}} />
              </div>
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              }}>
                <span style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                  background: CD.paperDeep, color: CD.ink2, border: `1px solid ${CD.rule}`,
                }}>$420 · can't afford</span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                <InlineMoveCard cardId="bundle-deal" state={{ combo: 575 }} onChange={() => {}} onAdd={() => {}} />
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <span style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                  background: CD.paperDeep, color: CD.ink2, border: `1px solid ${CD.rule}`,
                }}>$180 · can't afford</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 16, padding: 18 }}>
          <h3 className="serif" style={{ fontSize: 22, color: CD.ink }}>My picks</h3>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <PickSlot idx={1} pick={{ domain: 'sales', title: 'Match rival', value: 'undercut 5%' } as PickValue} />
            <PickSlot idx={2} />
            <PickSlot idx={3} />
          </div>
          <PillBtn variant="solid" color={CD.ink} size="lg" full>
            Lock 1 move <span style={{ opacity: 0.6 }}>→</span>
          </PillBtn>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CoachBubble label="Prof. Aldo · Last legs" tone="warn">
          When you're broke, you stop trying to win and start trying not to lose more. Match her price, keep inventory thin, survive to next round. Heroics will end you.
        </CoachBubble>
      </div>
    </div>
  );
};

// ----- Bankruptcy — full screen, match-ending -----

const CafeBankruptcy = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '40px 36px',
      textAlign: 'center',
    }}>
      <CoffeeBackdrop opacity={0.04} height={220} />

      {/* Empty mug glyph */}
      <svg viewBox="0 0 120 120" width="84" height="84" style={{ position: 'relative', margin: '0 auto', display: 'block' }}>
        <g stroke={CD.ink} strokeWidth="2.4" fill="none">
          <path d="M 22 36 L 82 36 L 78 96 Q 76 104, 68 104 L 36 104 Q 28 104, 26 96 Z" />
          <path d="M 82 50 Q 102 54, 100 76 L 90 76 Q 92 62, 80 60" />
          <line x1="32" y1="48" x2="72" y2="48" strokeDasharray="3 4" opacity="0.3" />
        </g>
      </svg>

      <div className="tab" style={{ marginTop: 14 }}>Round 6 · Match concluded</div>
      <h1 className="serif" style={{ fontSize: 64, color: CD.ink, marginTop: 4, lineHeight: 1, fontStyle: 'italic' }}>
        The till is empty.
      </h1>
      <p style={{ fontSize: 15, color: CD.ink2, marginTop: 12, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        You've burned through your cash reserve. The shop can't make payroll. Marina wins by liquidity.
      </p>

      {/* Final position */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 28, alignItems: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <AvatarPlayer size={80} ring={CD.ink4} />
          <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>You</div>
          <div className="num serif" style={{ fontSize: 36, color: CD.red, lineHeight: 1, marginTop: 4 }}>−$240</div>
          <div style={{ fontSize: 11, color: CD.ink3, letterSpacing: '0.08em' }}>BANKRUPT</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <AvatarOpponent size={80} ring={CD.terracotta} />
          <div className="serif" style={{ fontSize: 18, color: CD.ink, marginTop: 8 }}>Marina K.</div>
          <div className="num serif" style={{ fontSize: 36, color: CD.ink, lineHeight: 1, marginTop: 4 }}>$4,820</div>
          <div style={{ fontSize: 11, color: CD.terracotta, letterSpacing: '0.08em' }}>WINNER</div>
        </div>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22,
                    padding: '6px 14px', background: CD.paper, border: `1px solid ${CD.rule}`, borderRadius: 999 }}>
        <span className="num serif" style={{ fontSize: 22, color: CD.red }}>−32</span>
        <span style={{ fontSize: 13, color: CD.ink2 }}>Elo · now <b className="num" style={{ color: CD.ink }}>1,294</b></span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
        <PillBtn variant="solid" color={CD.ink} size="lg">Replay this match →</PillBtn>
        <PillBtn variant="outline" color={CD.ink}>Practice cash management</PillBtn>
        <PillBtn variant="ghost" color={CD.ink3}>Back to lobby</PillBtn>
      </div>
    </div>

    <div style={{ marginTop: 18 }}>
      <CoachBubble label="Prof. Aldo · After the bell">
        You spent like you'd win. You won't always. Half the game is what you do <i>before</i> things go sideways — buy cheap, hold cash, take the small fight. Try again.
      </CoachBubble>
    </div>
  </div>
);

// ----- Abandonment (opponent disconnected) -----

const CafeAbandonment = () => (
  <div className="cd" style={{ background: CD.paper, height: '100%', overflow: 'auto', padding: 36 }}>
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 22, padding: '40px 36px', textAlign: 'center',
    }}>
      <CoffeeBackdrop opacity={0.05} />
      <div className="tab" style={{ marginTop: 8 }}>Match · Round 4 of 8</div>
      <h1 className="serif" style={{ fontSize: 56, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: 'italic' }}>
        Marina stepped out.
      </h1>
      <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        Her connection dropped after Round 3. She has <span className="num">2:00</span> to come back — after that, we'll resolve the match in your favor.
      </p>

      {/* Avatars: yours steady, theirs faded */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, marginTop: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <AvatarPlayer size={96} ring={CD.terracotta} />
          <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>You</div>
          <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>$4,920 · leading</div>
        </div>
        <div className="serif" style={{ fontSize: 36, color: CD.ink3, fontStyle: 'italic' }}>vs</div>
        <div style={{ textAlign: 'center', opacity: 0.5, filter: 'grayscale(0.6)' }}>
          <AvatarOpponent size={96} ring={CD.ink4} />
          <div className="serif" style={{ fontSize: 22, color: CD.ink, marginTop: 10 }}>Marina K.</div>
          <div style={{ fontSize: 13, color: CD.ink3, marginTop: 2 }}>Disconnected · 0:58 ago</div>
        </div>
      </div>

      {/* Timer */}
      <div style={{ margin: '32px auto 0', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: CD.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
          <span>Waiting for reconnect</span>
          <span className="mono">1:02 left</span>
        </div>
        <div style={{ height: 6, background: CD.paperDeep, border: `1px solid ${CD.rule}`, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '52%', height: '100%', background: CD.terracotta }} />
        </div>
      </div>

      {/* Resolution offer */}
      <div style={{
        margin: '28px auto 0', maxWidth: 480,
        background: CD.cardstock, border: `1px solid ${CD.rule}`, borderRadius: 14, padding: 18, textAlign: 'left',
      }}>
        <div className="tab">If she doesn't return</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 14, color: CD.ink }}>Partial-credit win</span>
          <span className="num serif" style={{ fontSize: 22, color: CD.terracotta }}>+12 Elo</span>
        </div>
        <div style={{ fontSize: 12, color: CD.ink3, marginTop: 4 }}>
          Half the normal stake. Saved as a partial-match in your history.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
        <PillBtn variant="solid" color={CD.terracotta}>Resolve now (+12 Elo)</PillBtn>
        <PillBtn variant="outline" color={CD.ink}>Wait for her</PillBtn>
      </div>
    </div>

    <div style={{ marginTop: 18 }}>
      <CoachBubble label="Prof. Aldo · Sportsmanship">
        A win is a win. But the rating doesn't tell the full story of a match like this — and you know it. Take the half-Elo, log it, find a better fight.
      </CoachBubble>
    </div>
  </div>
);

(window as any).CafeForfeit = CafeForfeit;
(window as any).CafeUndo = CafeUndo;
(window as any).CafeAusterity = CafeAusterity;
(window as any).CafeBankruptcy = CafeBankruptcy;
(window as any).CafeAbandonment = CafeAbandonment;
(window as any).ModalShell = ModalShell;
