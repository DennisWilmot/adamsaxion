// Price War v2 — shared atoms + typed action input components.
// Every action in the catalog maps to ONE of these input types.

// ── atoms ──────────────────────────────────────────────────────────────
const Bar = ({ w = '100%', t }) => <div className={`wf-bar ${t || ''}`} style={{ width: w }} />;
const Btn = ({ children, kind = '', ...rest }) => <button className={`wf-btn ${kind}`} {...rest}>{children}</button>;
const KV = ({ k, v }) => <div className="wf-kv"><span className="k">{k}</span><span className="v">{v}</span></div>;
const Chip = ({ children, kind = '' }) => <span className={`chip ${kind}`}>{children}</span>;
const DomBadge = ({ d }) => {
  const map = { Sales: 'sales', Procurement: 'proc', Operations: 'ops', HR: 'hr', Marketing: 'mkt', Finance: 'fin' };
  return <span className={`badge ${map[d] || ''}`}>{d}</span>;
};
const RoundDots = ({ total = 8, current = 3 }) => (
  <div className="round-dots">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={`d ${i < current - 1 ? 'done' : i === current - 1 ? 'now' : ''}`} />
    ))}
  </div>
);
const Spark = ({ data = [4, 6, 5, 8, 7, 10, 12, 11], color = '#1f59c2', neg = false }) => {
  const w = 100, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={neg ? '#c84a2c' : color} strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// ── layered cost / effect chips ────────────────────────────────────────
// Standard chip vocabulary for every action card. Replaces the old "-$30 cost".
//   <Layer kind="upfront" value="-$25" />
//   <Layer kind="ongoing" value="-$10/round" />
//   <Layer kind="duration" value="persistent" />
//   <Layer kind="public" />  /  kind="private" / "inferable"
//   <Layer kind="forecast" value="likely traffic ▲" />
//   <Layer kind="risk" value="margin if demand stays flat" />
//   <Layer kind="locked" value="requires reputation ≥ Good" />
const Layer = ({ kind, value, label }) => {
  const labels = {
    upfront: 'upfront',
    ongoing: 'ongoing',
    duration: 'duration',
    public: 'visibility',
    private: 'visibility',
    inferable: 'visibility',
    forecast: 'forecast',
    risk: 'risk',
    locked: 'locked',
    delay: 'timing',
  };
  const display = {
    upfront: value,
    ongoing: value,
    duration: value,
    public: 'public',
    private: 'private',
    inferable: 'inferable',
    forecast: value,
    risk: value,
    locked: value,
    delay: value,
  };
  return (
    <span className={`layer ${kind}`}>
      <span className="lk">{label || labels[kind]}</span>
      {display[kind]}
    </span>
  );
};

// ── typed action input components ──────────────────────────────────────
// These are the building blocks: every action in the catalog renders ONE.

const SliderAction = ({ min = 0, max = 100, value = 50, step = 1, prefix = '', suffix = '', ticks }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="wf-row" style={{ alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div className="slider"><div className="track"><div className="thumb" style={{ left: `${pct}%` }} /></div></div>
          <div className="ticks">
            <span>{prefix}{min}{suffix}</span>
            <span>{prefix}{max}{suffix}</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: 32, fontWeight: 700, color: 'var(--accent)', minWidth: 84, textAlign: 'right' }}>
          {prefix}{value}{suffix}
        </div>
      </div>
      {ticks && <div className="step-hint" style={{ margin: '4px 0 0' }}>{ticks}</div>}
    </div>
  );
};

const StepperAction = ({ value = 1, min = 0, max = 5, label = 'workers' }) => (
  <div className="wf-row" style={{ alignItems: 'center', gap: 10 }}>
    <div className="stepper">
      <button className="btn">−</button>
      <span className="val">{value}</span>
      <button className="btn">+</button>
    </div>
    <span className="step-hint" style={{ margin: 0 }}>{label} · range {min}–{max}</span>
  </div>
);

const ChoiceAction = ({ options = [], value }) => (
  <div className="choice-grid">
    {options.map(o => (
      <div key={o.id} className={`choice ${value === o.id ? 'picked' : ''} ${o.locked ? 'locked' : ''}`}>
        <span>{o.label}</span>
        {o.sub && <span className="sub">{o.sub}</span>}
      </div>
    ))}
  </div>
);

const ToggleAction = ({ on = false, label = 'enabled' }) => (
  <div className="wf-row" style={{ alignItems: 'center', gap: 10 }}>
    <div className={`toggle ${on ? 'on' : ''}`}><span className="knob" /></div>
    <span style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{on ? 'ON' : 'OFF'} · {label}</span>
  </div>
);

const OneShotAction = ({ label = 'Activate', confirmed = false }) => (
  <Btn kind={confirmed ? 'good' : 'primary'}>{confirmed ? '✓ Queued' : label}</Btn>
);

const AmountInput = ({ value = 25, prefix = '$' }) => (
  <span className="amount-in">
    <span className="pre">{prefix}</span>
    <input defaultValue={value} />
  </span>
);

const TargetSelect = ({ options = [], value }) => (
  <div className="choice-grid">
    {options.map(o => (
      <div key={o.id} className={`choice ${value === o.id ? 'picked' : ''}`}>
        <span>◉ {o.label}</span>
        {o.sub && <span className="sub">{o.sub}</span>}
      </div>
    ))}
  </div>
);

const ModeSelector = ({ options = [], value }) => (
  <div className="wf-row" style={{ gap: 6, flexWrap: 'wrap' }}>
    {options.map(o => (
      <div key={o.id} className={`choice ${value === o.id ? 'picked' : ''}`} style={{ flex: '1 1 110px' }}>
        <span>{o.label}</span>
        {o.sub && <span className="sub">{o.sub}</span>}
      </div>
    ))}
  </div>
);

const MultiChoice = ({ options = [], values = [] }) => (
  <div className="wf-row" style={{ gap: 6, flexWrap: 'wrap' }}>
    {options.map(o => {
      const on = values.includes(o.id);
      return (
        <div key={o.id} className={`choice ${on ? 'picked' : ''}`} style={{ flex: '1 1 100px' }}>
          <span>{on ? '☑' : '☐'} {o.label}</span>
        </div>
      );
    })}
  </div>
);

const NoInput = ({ label = 'Confirm to queue this action' }) => (
  <div className="step-hint" style={{ margin: 0, fontStyle: 'italic' }}>{label}</div>
);

// Map of inputType → component. Pure rendering layer; catalog drives everything.
const ACTION_INPUTS = {
  slider:       SliderAction,
  stepper:      StepperAction,
  single_choice: ChoiceAction,
  multi_choice:  MultiChoice,
  toggle:        ToggleAction,
  one_shot:      OneShotAction,
  amount_input:  AmountInput,
  target_selection: TargetSelect,
  mode_selector: ModeSelector,
  none:          NoInput,
};

// Renders an action card.
// Default = quiet: title + one-line effect + 1-2 important chips + button.
// Hover/click = tooltip (the "expanded card") with mechanic, costs, visibility, duration,
// and plain-English "strong when / risky when" notes.
const ActionCard = ({ action, picked, locked, tipOpen = false }) => {
  const Input = ACTION_INPUTS[action.inputType] || NoInput;

  // Default chip filter: hide noise, keep only what matters right now.
  const visibleChips = (action.layers || []).filter(l => {
    if (l.kind === 'upfront' || l.kind === 'ongoing') {
      // hide zero-cost chips
      const v = String(l.value || '').replace(/[^0-9.-]/g, '');
      if (!v || parseFloat(v) === 0) return false;
      return true;
    }
    if (l.kind === 'private') return false;                            // private is the default
    if (l.kind === 'duration' && l.value === 'persistent') return false; // persistent is the default
    if (l.kind === 'forecast' || l.kind === 'risk') return false;      // moves into tooltip
    if (l.kind === 'public' || l.kind === 'inferable') return true;    // visibility worth flagging
    if (l.kind === 'locked' || l.kind === 'delay') return true;
    return true;
  });

  return (
    <div className={`act ${picked ? 'picked' : ''} ${locked ? 'locked' : ''} ${tipOpen ? 'tip-open' : ''}`}>
      <div className="act-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="act-title">{action.name}</div>
          {action.tagline && <div className="act-sub">{action.tagline}</div>}
        </div>
        {picked && <Chip kind="accent">✓ picked</Chip>}
      </div>

      {visibleChips.length > 0 && (
        <div className="layers" style={{ marginTop: 8 }}>
          {visibleChips.map((l, i) => <Layer key={i} {...l} />)}
        </div>
      )}

      {/* Show the input only when picked (or when the action insists). */}
      {!locked && (picked || action.alwaysShowInput) && (
        <div style={{ marginTop: 10 }}>
          <Input {...(action.inputConfig || {})} />
        </div>
      )}

      {/* Default bottom row — Add to plan + details affordance */}
      {!picked && (
        <div className="act-bottom">
          {locked ? (
            <Chip kind="ghost">🔒 locked</Chip>
          ) : (
            <Btn>Add to plan</Btn>
          )}
          <span className="details-link">hover for details</span>
        </div>
      )}

      {/* Expanded tooltip — the "details" the feedback asked to push behind hover. */}
      <div className="act-tip">
        {tipOpen && action.tipArrow && <span className="arrow">{action.tipArrow}</span>}
        {action.mechanic && <p>{action.mechanic}</p>}
        <dl className="act-meta">
          <dt>Known cost</dt><dd>{action.knownCost || '$0'}</dd>
          {action.ongoingText && (<><dt>Ongoing</dt><dd>{action.ongoingText}</dd></>)}
          <dt>Visibility</dt><dd>{action.visibility || 'private'}</dd>
          <dt>Duration</dt><dd>{action.durationText || 'persistent'}</dd>
          {action.timingText && (<><dt>Timing</dt><dd>{action.timingText}</dd></>)}
          {action.lockedReason && (<><dt>Locked</dt><dd>{action.lockedReason}</dd></>)}
        </dl>
        {action.strong && <div className="when good"><span>✓</span>Strong when: {action.strong}</div>}
        {action.risky  && <div className="when warm"><span>!</span>Risky when: {action.risky}</div>}
      </div>
    </div>
  );
};

// Tooltip wrapper — shown statically in wireframes to demonstrate
const Tooltip = ({ for: forText, title, body, arrow, alwaysOpen = false }) => (
  <span className="tip">
    <span className="callout">{forText}</span>
    {alwaysOpen && (
      <span className="tip-body">
        {arrow && <span className="tip-arrow">{arrow}</span>}
        <b>{title}</b>
        {body}
      </span>
    )}
  </span>
);

Object.assign(window, {
  Bar, Btn, KV, Chip, DomBadge, RoundDots, Spark,
  Layer, ActionCard, Tooltip,
  SliderAction, StepperAction, ChoiceAction, MultiChoice, ToggleAction, OneShotAction,
  AmountInput, TargetSelect, ModeSelector, NoInput, ACTION_INPUTS,
});
