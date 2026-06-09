// Café Duel — move cards with inline configuration.
// No more modal. Slider for values, stepper for counts, segmented for binary.

// Card content registry. Each card declares its domain, copy, knob, and cost(value).

const CARD_LIBRARY: Record<string, CardDef> = {
  // Sales
  'set-price': {
    domain: 'sales', title: 'Set price', kicker: 'Update your menu price for the next round.',
    knob: { kind: 'slider', min: 300, max: 700, step: 5, key: 'price', defaults: { price: 425 },
            label: 'Menu price', format: v => v, suffix: '¢',
            effect: v => v > 500 ? 'premium · lower volume' : v < 400 ? 'value · higher volume' : 'balanced',
            hint: v => `Marina is at 375¢. You're ${v > 375 ? 'above' : v < 375 ? 'below' : 'matching'} her.` },
    cost: () => 0,
  },
  'flash-sale': {
    domain: 'sales', title: 'Flash sale', kicker: 'Temporary cut to drive volume this round only.',
    knob: { kind: 'slider', min: 5, max: 50, step: 5, key: 'cut', defaults: { cut: 15 },
            label: 'Discount', format: v => `−${v}`, suffix: '%',
            effect: v => `≈ +${Math.round(v * 4)} cups this round`,
            hint: v => `Costs $${v * 8} in lost margin. Won't carry forward.` },
    cost: v => v * 8,
  },
  'premium-blend': {
    domain: 'sales', title: 'Premium blend', kicker: 'Launch a higher-margin specialty drink line.',
    knob: { kind: 'slider', min: 550, max: 850, step: 10, key: 'price', defaults: { price: 650 },
            label: 'Specialty price', format: v => v, suffix: '¢',
            effect: () => '+margin · brand lift',
            hint: () => 'One-time $420 launch cost. Persists across rounds.' },
    cost: () => 420,
  },
  'bundle-deal': {
    domain: 'sales', title: 'Bundle deal', kicker: 'Coffee + pastry combo to lift average ticket.',
    knob: { kind: 'slider', min: 450, max: 750, step: 10, key: 'combo', defaults: { combo: 575 },
            label: 'Bundle price', format: v => v, suffix: '¢',
            effect: v => `+ticket · ${v < 550 ? 'fast pickup' : 'sit-down'}`,
            hint: () => 'Burns through pastry inventory faster.' },
    cost: () => 180,
  },
  'match-rival': {
    domain: 'sales', title: 'Match rival', kicker: "Track the opponent's public price automatically.",
    knob: { kind: 'segmented', key: 'mode', defaults: { mode: 'undercut' },
            options: [{ value: 'match', label: 'Match exact' }, { value: 'undercut', label: 'Undercut 5%' }],
            label: 'Pricing rule',
            effect: v => v === 'match' ? 'follows · neutral' : 'follows · aggressive',
            hint: v => v === 'match' ? `Sets to 375¢ next round.` : `Sets to ~356¢ next round.` },
    cost: () => 0,
  },
  // Procurement
  'buy-beans': {
    domain: 'procurement', title: 'Buy beans', kicker: 'Stock up on house roast inventory.',
    knob: { kind: 'stepper', key: 'sacks', defaults: { sacks: 4 },
            label: 'Sacks', suffix: ' sacks', min: 1, max: 12,
            effect: v => `+${v * 60} cups of inventory`,
            hint: v => `$${v * 220} now. Stockout risk drops sharply.` },
    cost: v => v * 220,
  },
  'specialty-supplier': {
    domain: 'procurement', title: 'Specialty supplier', kicker: 'Switch to a premium importer for the rest of the match.',
    knob: { kind: 'segmented', key: 'tier', defaults: { tier: 'mid' },
            options: [{ value: 'mid', label: 'Single-origin' }, { value: 'top', label: 'Microlot' }],
            label: 'Tier',
            effect: v => v === 'top' ? '+brand · +cost' : 'subtle quality lift',
            hint: v => v === 'top' ? '$680 upfront, +24¢ per cup forever.' : '$320 upfront, +12¢ per cup forever.' },
    cost: v => v === 'top' ? 680 : 320,
  },
  'hedge-futures': {
    domain: 'procurement', title: 'Hedge futures', kicker: 'Lock bean cost against weather shocks.',
    knob: { kind: 'slider', min: 1, max: 4, step: 1, key: 'rounds', defaults: { rounds: 2 },
            label: 'Lock for', format: v => v, suffix: ' rounds',
            effect: v => `cost stable for ${v} round${v === 1 ? '' : 's'}`,
            hint: v => `$${v * 90} per round locked.` },
    cost: v => v * 90,
  },
};

interface InlineMoveCardProps {
  cardId: string;
  state: Record<string, any>;
  onChange: (s: Record<string, any>) => void;
  onAdd?: () => void;
  drafted?: boolean;
}

const InlineMoveCard = ({ cardId, state, onChange, onAdd, drafted }: InlineMoveCardProps) => {
  const card = CARD_LIBRARY[cardId];
  if (!card) return null;
  const g = CD.d[card.domain];
  const k = card.knob;
  const value = state[k.key];
  const setVal = (v) => onChange({ ...state, [k.key]: v });
  const previewCost = card.cost(value);
  const effect = typeof k.effect === 'function' ? k.effect(value) : null;
  const hint = typeof k.hint === 'function' ? k.hint(value) : null;

  return (
    <div className="cd-move" style={{
      position: 'relative',
      background: drafted ? CD.cardstockHi : CD.cardstock,
      border: `1px solid ${drafted ? g.c : CD.rule}`,
      borderRadius: 14,
      padding: '16px 18px 16px 22px',
      boxShadow: drafted ? `0 0 0 3px ${g.soft}` : `0 1px 0 ${CD.rule}`,
    }}>
      <DomainStripe domain={card.domain} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <DomainGlyph domain={card.domain} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="serif" style={{ fontSize: 22, lineHeight: 1.1, color: CD.ink }}>{card.title}</h3>
          <div style={{ fontSize: 13, color: CD.ink2, marginTop: 2, lineHeight: 1.4 }}>{card.kicker}</div>
        </div>
      </div>

      {/* Knob */}
      <div style={{ marginTop: 16 }}>
        {k.kind === 'slider' && (
          <Slider value={value} min={k.min} max={k.max} step={k.step} color={g.c}
                  label={k.label} format={k.format} suffix={k.suffix}
                  onChange={setVal} hint={hint} />
        )}
        {k.kind === 'stepper' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <Stepper value={value} min={k.min} max={k.max} suffix={k.suffix} label={k.label} onChange={setVal} />
            {hint && <div style={{ fontSize: 11.5, color: CD.ink3, textAlign: 'right', flex: 1, paddingBottom: 6 }}>{hint}</div>}
          </div>
        )}
        {k.kind === 'segmented' && (
          <Segmented value={value} options={k.options} label={k.label} color={g.c} onChange={setVal} />
        )}
        {k.kind === 'segmented' && hint && (
          <div style={{ fontSize: 11.5, color: CD.ink3, marginTop: 8 }}>{hint}</div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
        paddingTop: 12, borderTop: `1px dashed ${CD.rule}`,
      }}>
        <DomainTag domain={card.domain} />
        {effect && (
          <span style={{ fontSize: 12.5, color: CD.ink2 }}>
            <span style={{ color: CD.ink3 }}>effect</span> · {effect}
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: CD.ink2 }}>
            <span style={{ color: CD.ink3 }}>cost </span>
            <span className="num" style={{ color: CD.ink }}>${previewCost.toLocaleString()}</span>
          </span>
          {drafted ? (
            <PillBtn variant="outline" size="sm" color={g.c} onClick={onAdd}>
              ✓ Drafted
            </PillBtn>
          ) : (
            <PillBtn variant="solid" size="sm" color={CD.ink} onClick={onAdd}>
              Draft move
            </PillBtn>
          )}
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { CARD_LIBRARY, InlineMoveCard });
