// Reproductions of the current flat MVP screens — for side-by-side comparison.
// Faithful to the screenshots the user attached.

const FlatStyle = {
  bg: '#f6f7f9',
  card: '#ffffff',
  ink: '#0c0e12',
  ink2: '#4b5563',
  ink3: '#6b7280',
  rule: '#e5e7eb',
  blue: '#0a52c4',
  bluePale: '#e6efff',
  redPale: '#fde7e7',
};

const FlatPill = ({ children, tone = 'default' }) => {
  const map = {
    default: { bg: '#fff', color: FlatStyle.ink, border: FlatStyle.rule },
    blue:    { bg: FlatStyle.blue, color: '#fff', border: FlatStyle.blue },
    red:     { bg: FlatStyle.redPale, color: '#992020', border: '#f9d2d2' },
  };
  const s = map[tone] || map.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 14, fontWeight: 500,
    }}>{children}</span>
  );
};

const FlatButton = ({ children, variant = 'primary' }) => (
  <button style={{
    padding: '10px 16px', borderRadius: 8,
    background: variant === 'primary' ? FlatStyle.blue : '#fff',
    color: variant === 'primary' ? '#fff' : FlatStyle.ink,
    border: variant === 'primary' ? 'none' : `1px solid ${FlatStyle.rule}`,
    fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  }}>{children}</button>
);

const FlatCard = ({ title, body, hidden }) => (
  <div style={{
    background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
    borderRadius: 14, padding: 18, position: 'relative',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: FlatStyle.ink }}>{title}</h3>
      {hidden && <span style={{ fontSize: 13, color: FlatStyle.ink2 }}>Hidden</span>}
    </div>
    <p style={{ fontSize: 14, color: FlatStyle.ink2, marginTop: 6, marginBottom: 14, lineHeight: 1.45 }}>{body}</p>
    <FlatButton>Configure</FlatButton>
  </div>
);

const FlatDecide = () => (
  <div style={{
    background: FlatStyle.bg, padding: 24, height: '100%', overflow: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif', color: FlatStyle.ink,
  }}>
    {/* Header */}
    <div style={{
      background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
        <FlatPill>Round 3 / 8</FlatPill>
        <span>Unrated match</span>
        <span>Cash: <b>$4,250</b></span>
        <span>Opponent price: <b>375¢</b></span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <FlatPill tone="red">0:00</FlatPill>
        <FlatPill tone="blue">Opponent: Locked ✓</FlatPill>
      </div>
    </div>

    {/* Tutorial */}
    <div style={{
      background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
      borderRadius: 12, padding: '14px 18px', marginTop: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Tutorial</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Inventory matters</span>
      </div>
      <p style={{ fontSize: 14, color: FlatStyle.ink2, marginTop: 8, lineHeight: 1.5 }}>
        If you stock out, you lose sales even with a great price. Procurement refills beans before demand hits.
      </p>
      <p style={{ fontSize: 14, color: FlatStyle.ink2, marginTop: 6 }}>
        <b style={{ color: FlatStyle.ink }}>Tip:</b> Buy beans if inventory is running low.
      </p>
      <p style={{ fontSize: 13, color: FlatStyle.ink3, marginTop: 6 }}>
        Suggested domains: procurement
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginTop: 18, alignItems: 'flex-start' }}>
      <div>
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4,
          background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
          borderRadius: 10, marginBottom: 14,
        }}>
          {['Sales','Procurement','Operations','Hr','Marketing','Finance'].map((t, i) => (
            <span key={t} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 13,
              background: i === 0 ? '#fff' : 'transparent',
              border: i === 0 ? `1px solid ${FlatStyle.rule}` : 'none',
              color: FlatStyle.ink,
            }}>{t}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FlatCard title="Set price"        body="Update your menu price for the next round." />
          <FlatCard title="Flash sale"       body="Temporary price cut to drive volume this round." />
          <FlatCard title="Premium blend"    body="Launch a higher-margin specialty drink line." />
          <FlatCard title="Bundle deal"      body="Coffee + pastry combo to lift average ticket." />
          <FlatCard title="Match competitor price" body="Undercut or match the rival's public price." />
        </div>
      </div>

      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>My picks</h3>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#f1f3f6', border: `1px solid ${FlatStyle.rule}`,
              borderRadius: 8, padding: '14px 16px', fontSize: 13, color: FlatStyle.ink2,
            }}>Empty slot {i}</div>
          ))}
        </div>
        <button disabled style={{
          width: '100%', marginTop: 10, padding: '12px 16px',
          borderRadius: 8, border: 'none',
          background: '#7ba6e4', color: '#fff',
          fontSize: 14, fontWeight: 500,
        }}>Review &amp; lock 0 moves</button>
      </div>
    </div>
  </div>
);

const FlatReport = () => (
  <div style={{
    background: FlatStyle.bg, padding: 24, height: '100%', overflow: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif', color: FlatStyle.ink,
  }}>
    <div style={{
      background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
        <FlatPill>Round 3 / 8</FlatPill>
        <span>Cash: <b>$4,250</b></span>
        <span>Opponent price: <b>375¢</b></span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <FlatPill tone="red">0:00</FlatPill>
        <FlatPill tone="blue">Opponent: Locked ✓</FlatPill>
      </div>
    </div>

    <div style={{
      background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
      borderRadius: 12, padding: '14px 18px', marginTop: 14,
    }}>
      <p style={{ margin: 0, fontSize: 14 }}>
        <b>Tutorial:</b> <span style={{ color: FlatStyle.ink2 }}>Check the cash delta: marketing spend today may pay off in later rounds.</span>
      </p>
    </div>

    <div style={{
      background: FlatStyle.card, border: `1px solid ${FlatStyle.rule}`,
      borderRadius: 12, padding: 22, marginTop: 14,
    }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Round 2 report</h2>
      <p style={{ fontSize: 16, color: FlatStyle.ink2, marginTop: 16 }}>
        Round 2 resolved. Market demand was 406 units.
      </p>
      <ul style={{ fontSize: 14, color: FlatStyle.ink2, paddingLeft: 18, marginTop: 14 }}>
        <li>Weather shifted demand by 6 units.</li>
      </ul>
      <div style={{
        background: '#f1f3f6', borderRadius: 8, padding: '12px 14px',
        fontSize: 14, marginTop: 14,
      }}>Cash change this round: <b>-900</b></div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <FlatButton>Next round</FlatButton>
        <FlatButton variant="secondary">Back to lobby</FlatButton>
      </div>
    </div>
  </div>
);

Object.assign(window, { FlatDecide, FlatReport });
