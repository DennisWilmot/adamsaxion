// Profile Wireframes — sketchy low-fi exploration
// 4 destination tabs (Personal / Subscription / My Path / Progress)
// × 3 layout directions each, shown stacked vertically.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "activeTab": "path",
  "tabStyle": "pill",
  "header": "full",
  "density": "regular",
  "accent": "#1f59c2",
  "view": "desktop",
  "annotations": true
}/*EDITMODE-END*/;

const DEST_TABS = [
  { id: 'personal',     label: 'Personal',     icon: '◐', count: null },
  { id: 'subscription', label: 'Subscription', icon: '▭', count: null },
  { id: 'path',         label: 'My Path',      icon: '◇', count: '0/33' },
  { id: 'progress',     label: 'Progress',     icon: '◯', count: null },
];

// ─── tiny atoms ────────────────────────────────────────────────────────

const Bar = ({ w = '100%', t }) => (
  <div className={`wf-bar ${t || ''}`} style={{ width: w }} />
);

const ImgSlot = ({ h = 120, label = 'image' }) => (
  <div className="wf-img" style={{ height: h }}>{label}</div>
);

const Btn = ({ children, kind = '', ...rest }) => (
  <button className={`wf-btn ${kind}`} {...rest}>{children}</button>
);

const KV = ({ k, v }) => (
  <div className="wf-kv"><span className="k">{k}</span><span className="v">{v}</span></div>
);

// ─── header treatments ─────────────────────────────────────────────────

function Header({ variant }) {
  if (variant === 'none') return null;

  if (variant === 'slim') {
    return (
      <div className="hdr-slim">
        <div className="avatar sm">DW</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 22, lineHeight: 1 }}>DennisWilmot</div>
          <div className="hdr-mail">dennisdwilmot@gmail.com</div>
        </div>
      </div>
    );
  }

  // full
  return (
    <div className="hdr-full" style={{ flexDirection: 'column', display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
        <div className="avatar">DW</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hdr-name">DennisWilmot</div>
          <div className="hdr-mail">dennisdwilmot@gmail.com</div>
        </div>
        <div className="hdr-stats">
          <div className="stat-pill"><b style={{ color: 'var(--warm)' }}>40</b><span>Total XP</span></div>
          <div className="stat-pill"><b>1</b><span>Level</span></div>
          <div className="stat-pill"><b style={{ color: 'var(--ink)' }}>960</b><span>XP to next</span></div>
        </div>
      </div>
      <div className="level-bar">
        <div className="level-row"><span>Level 1</span><span>Level 2</span></div>
        <div className="level-track"><div className="level-fill" /></div>
      </div>
    </div>
  );
}

// ─── tab bar (4 styles) ────────────────────────────────────────────────

function TabBar({ style, active, sidebar = false, onPick }) {
  const cls = `tab-list style-${style}`;
  return (
    <div className={cls}>
      {DEST_TABS.map(t => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onPick && onPick(t.id)}
          type="button"
        >
          {style !== 'segmented' && <span className="ico" aria-hidden>{t.icon === '◐' ? '' : ''}</span>}
          <span>{t.label}</span>
          {t.count && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── tab body content per destination, per option ──────────────────────

// PERSONAL — 3 directions
const PersonalA = () => (
  <>
    <div className="wf-card">
      <div className="eyebrow">Identity</div>
      <div className="wf-row" style={{ alignItems: 'center', gap: 18 }}>
        <div className="avatar">DW</div>
        <div className="wf-col">
          <Bar t="tall mid" />
          <Bar t="short" />
        </div>
        <Btn kind="ghost">change photo</Btn>
      </div>
    </div>
    <div className="wf-card">
      <div className="eyebrow">Account</div>
      <KV k="Display name" v="DennisWilmot" />
      <KV k="Email" v="dennisdwilmot@gmail.com" />
      <KV k="Password" v="••••••••  Change" />
      <KV k="Time zone" v="GMT  Edit" />
    </div>
    <div className="wf-card">
      <div className="eyebrow">Notifications</div>
      <KV k="Lesson reminders" v="Daily ▾" />
      <KV k="Streak alerts" v="On" />
      <KV k="Product updates" v="Off" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
      <Btn kind="danger">Sign out</Btn>
      <Btn kind="primary">Save changes</Btn>
    </div>
  </>
);

const PersonalB = () => (
  <>
    <div className="wf-row" style={{ alignItems: 'flex-start' }}>
      <div className="wf-card" style={{ flex: '0 0 220px', textAlign: 'center' }}>
        <div className="avatar" style={{ width: 110, height: 110, margin: '6px auto', borderRadius: 18, fontSize: 38 }}>DW</div>
        <Bar t="tall" w="80%" />
        <div style={{ height: 8 }} />
        <Bar t="short" w="60%" />
        <div style={{ marginTop: 12 }}><Btn kind="ghost">replace</Btn></div>
      </div>
      <div className="wf-col">
        <div className="wf-card">
          <div className="eyebrow">Inline edit · click to change</div>
          <div className="wf-grid cols-2">
            <div><div className="k" style={{ color: 'var(--ink-3)', fontSize: 12, textTransform: 'uppercase' }}>Name</div><Bar t="tall mid" /></div>
            <div><div className="k" style={{ color: 'var(--ink-3)', fontSize: 12, textTransform: 'uppercase' }}>Pronouns</div><Bar t="tall short" /></div>
            <div><div className="k" style={{ color: 'var(--ink-3)', fontSize: 12, textTransform: 'uppercase' }}>Email</div><Bar t="tall" /></div>
            <div><div className="k" style={{ color: 'var(--ink-3)', fontSize: 12, textTransform: 'uppercase' }}>Country</div><Bar t="tall mid" /></div>
          </div>
        </div>
        <div className="wf-card">
          <div className="eyebrow">Preferences</div>
          <KV k="Theme" v="Light · Dark · Auto" />
          <KV k="Language" v="English ▾" />
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Btn>Discard</Btn>
      <Btn kind="primary">Save</Btn>
    </div>
  </>
);

const PersonalC = () => (
  <>
    <div className="wf-card" style={{ background: 'var(--paper-2)' }}>
      <div className="wf-row" style={{ gap: 16, alignItems: 'center' }}>
        <div className="avatar">DW</div>
        <div className="wf-col">
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>DennisWilmot</div>
          <div className="hdr-mail">dennisdwilmot@gmail.com · member since Mar 2025</div>
        </div>
        <Btn>Edit profile</Btn>
      </div>
    </div>
    <div className="wf-grid cols-2">
      <div className="wf-card">
        <div className="eyebrow">Security</div>
        <KV k="Password" v="Updated 3 mo ago" />
        <KV k="2-factor" v="Not enabled" />
        <KV k="Sessions" v="2 active" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">Connected</div>
        <KV k="Google" v="Linked ✓" />
        <KV k="Apple" v="Connect" />
        <KV k="Slack" v="Connect" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">Notifications</div>
        <KV k="Email digest" v="Weekly" />
        <KV k="Push" v="On" />
      </div>
      <div className="wf-card">
        <div className="eyebrow">Danger zone</div>
        <KV k="Export data" v="Download" />
        <KV k="Delete account" v="Request" />
      </div>
    </div>
  </>
);

// SUBSCRIPTION — 3 directions
const SubA = () => (
  <>
    <div className="wf-card">
      <div className="eyebrow">Current plan</div>
      <KV k="Plan" v="Admin access" />
      <KV k="Status" v="Full access" />
      <KV k="Renews" v="—" />
      <div style={{ marginTop: 10 }}><Btn kind="primary">Subscribe to unlock lessons</Btn></div>
    </div>
    <div className="wf-card">
      <div className="eyebrow">Payment method</div>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>•••• •••• •••• 4242</div>
          <div className="meta" style={{ color: 'var(--ink-3)', fontSize: 13 }}>Visa · exp 09/27</div>
        </div>
        <Btn>Update card</Btn>
      </div>
    </div>
    <div className="wf-card">
      <div className="eyebrow">Billing history</div>
      <KV k="Apr 2026" v="$29.00  ▾ invoice" />
      <KV k="Mar 2026" v="$29.00  ▾ invoice" />
      <KV k="Feb 2026" v="$29.00  ▾ invoice" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Btn kind="danger">Cancel subscription</Btn>
    </div>
  </>
);

const SubB = () => (
  <>
    <div className="wf-card" style={{ background: 'linear-gradient(180deg, rgba(31,89,194,.06), transparent)' }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">You are on</div>
          <h3 style={{ marginTop: 4 }}>Admin access · Full</h3>
          <div className="hdr-mail">Renews monthly · next charge Jun 12</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 36, fontWeight: 700, color: 'var(--accent)' }}>$29</div>
          <div className="hdr-mail">/ month</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Btn kind="primary">Upgrade to Annual (save 20%)</Btn>
        <Btn>Manage</Btn>
        <Btn kind="ghost">Cancel</Btn>
      </div>
    </div>
    <div className="wf-grid cols-2">
      <div className="wf-card">
        <div className="eyebrow">Payment</div>
        <Bar t="tall mid" />
        <div style={{ height: 6 }} />
        <Bar t="short" />
        <div style={{ marginTop: 10 }}><Btn>Update</Btn></div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Receipts</div>
        <KV k="Apr 2026" v="↓" />
        <KV k="Mar 2026" v="↓" />
        <KV k="Feb 2026" v="↓" />
      </div>
    </div>
  </>
);

const SubC = () => (
  <>
    <div className="wf-card">
      <div className="eyebrow">Pick a plan</div>
      <div className="wf-grid cols-3" style={{ marginTop: 6 }}>
        {[
          { name: 'Free', price: '$0', tag: '' },
          { name: 'Learner', price: '$9', tag: '' },
          { name: 'Admin', price: '$29', tag: 'CURRENT' },
        ].map(p => (
          <div key={p.name} className="wf-card" style={{
            border: p.tag ? '2px solid var(--accent)' : '1.5px solid var(--ink)',
            background: p.tag ? 'rgba(31,89,194,.06)' : '#fffdf6',
          }}>
            {p.tag && <div style={{ position: 'absolute', top: -10, right: 10, background: 'var(--accent)', color: '#fff', fontFamily: "'Kalam',cursive", fontSize: 12, padding: '2px 8px', borderRadius: 999 }}>{p.tag}</div>}
            <h4>{p.name}</h4>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: 32, fontWeight: 700 }}>{p.price}<span style={{ fontSize: 14, color: 'var(--ink-3)' }}>/mo</span></div>
            <div style={{ height: 8 }} />
            <Bar /><div style={{ height: 4 }} /><Bar t="mid" /><div style={{ height: 4 }} /><Bar t="short" />
            <div style={{ marginTop: 12 }}>
              <Btn kind={p.tag ? '' : 'primary'}>{p.tag ? 'Current' : 'Choose'}</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="wf-row">
      <div className="wf-card" style={{ flex: 1 }}>
        <div className="eyebrow">Payment method</div>
        <KV k="Card" v="Visa ···· 4242" />
        <KV k="Expires" v="09/27" />
      </div>
      <div className="wf-card" style={{ flex: 1 }}>
        <div className="eyebrow">Latest invoice</div>
        <KV k="Apr 2026" v="$29.00 paid" />
        <Btn kind="ghost">See all invoices →</Btn>
      </div>
    </div>
  </>
);

// PATH — 3 directions
const PATH_NODES = [
  { n: 1, state: 'current', label: "How a currency dies: Zimbabwe's hyperinflation" },
  { n: 2, state: '',        label: 'Budget constraints and tradeoffs' },
  { n: 3, state: 'soon',    label: 'Correlation vs. causation' },
  { n: 4, state: '',        label: 'Preferences and utility' },
  { n: 5, state: 'soon',    label: 'Reference dependence and loss aversion' },
  { n: 6, state: '',        label: 'Demand: where it actually comes from' },
  { n: 7, state: '',        label: 'Income vs. substitution effects' },
];

const PathA = () => (
  <>
    <div className="wf-card" style={{ borderStyle: 'solid', background: 'rgba(31,89,194,.05)' }}>
      <div className="eyebrow" style={{ color: 'var(--accent)' }}>Up next on your path</div>
      <h3 style={{ marginTop: 2 }}>How a currency dies: Zimbabwe's hyperinflation</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div className="hdr-mail">Lesson 1 of 33 · ~12 min</div>
        <Btn kind="primary">Continue →</Btn>
      </div>
    </div>
    <div className="wf-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h4>Your path</h4>
        <Btn kind="ghost">Edit ✎</Btn>
      </div>
      <div className="hdr-mail">Because you're focused on understanding how the economy works</div>
      <div className="path-row">
        {PATH_NODES.map(n => (
          <div key={n.n} className={`path-node ${n.state === 'current' ? 'current' : ''} ${n.n < 1 ? 'done' : ''}`}>
            <div className="circ">{n.n}</div>
            <div className="state">{n.state === 'current' ? 'continue' : n.state.toUpperCase()}</div>
            <div className="lbl">{n.label}</div>
          </div>
        ))}
      </div>
      <div className="hdr-mail" style={{ marginTop: 8 }}>Scroll to see more of your path →</div>
    </div>
  </>
);

const PathB = () => (
  <div className="wf-row" style={{ alignItems: 'flex-start' }}>
    <div className="wf-col" style={{ flex: 1.4 }}>
      <div className="wf-card">
        <div className="eyebrow">Your path · 0 / 33</div>
        <h3>Understanding how the economy works</h3>
        <Bar t="mid" />
        <div style={{ height: 4 }} />
        <Bar t="short" />
        <div style={{ marginTop: 10 }}><Btn>Change focus</Btn></div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Lessons</div>
        {PATH_NODES.map(n => (
          <div key={n.n} className="lesson">
            <div className={`check ${n.state === 'current' ? '' : ''}`}>{n.n}</div>
            <div className="ttl">
              <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 15 }}>{n.label}</div>
              <div className="meta">{n.state === 'current' ? 'In progress' : n.state === 'soon' ? 'Locked · subscribe to unlock' : 'Up next'}</div>
            </div>
            {n.state === 'current' ? <Btn kind="primary">Resume</Btn> : <Btn kind="ghost">Open</Btn>}
          </div>
        ))}
      </div>
    </div>
    <div className="wf-col" style={{ flex: 1, position: 'sticky', top: 16 }}>
      <div className="wf-card" style={{ background: 'rgba(31,89,194,.05)' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)' }}>Continue learning</div>
        <h4>Zimbabwe's hyperinflation</h4>
        <ImgSlot h={100} label="lesson cover" />
        <div className="hdr-mail" style={{ marginTop: 8 }}>Lesson 1 · 12 min · earns 40 XP</div>
        <div style={{ marginTop: 10 }}><Btn kind="primary">Start lesson</Btn></div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Why this path?</div>
        <div style={{ fontFamily: "'Patrick Hand'", fontSize: 15, lineHeight: 1.45 }}>
          You said you wanted to understand how money moves through the real economy.
          We've sequenced 33 lessons from inflation → markets → behavior.
        </div>
      </div>
    </div>
  </div>
);

const PathC = () => (
  <>
    <div className="wf-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3>Map view</h3>
        <Btn kind="ghost">Switch to list ⇄</Btn>
      </div>
      <div style={{ position: 'relative', height: 280, marginTop: 10, border: '1.5px dashed var(--ink-3)', borderRadius: 12, padding: 18, overflow: 'hidden' }}>
        {/* branching tree */}
        <svg viewBox="0 0 600 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 60 120 C 130 120, 150 60, 220 60" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <path d="M 60 120 C 130 120, 150 180, 220 180" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <path d="M 220 60 C 300 60, 320 120, 400 120" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <path d="M 220 180 C 300 180, 320 120, 400 120" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <path d="M 400 120 C 460 120, 500 60, 560 60" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <path d="M 400 120 C 460 120, 500 180, 560 180" stroke="#1f1c18" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
        </svg>
        {[
          { x: 30, y: 100, n: 1, lbl: 'Hyperinflation', cur: true },
          { x: 190, y: 40, n: 2, lbl: 'Tradeoffs' },
          { x: 190, y: 160, n: 3, lbl: 'Correlation' },
          { x: 370, y: 100, n: 4, lbl: 'Utility' },
          { x: 530, y: 40, n: 5, lbl: 'Loss aversion' },
          { x: 530, y: 160, n: 6, lbl: 'Demand' },
        ].map(p => (
          <div key={p.n} style={{ position: 'absolute', left: `${(p.x / 600) * 100}%`, top: p.y, transform: 'translate(-50%, 0)', textAlign: 'center' }}>
            <div className="circ" style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1.5px solid var(--ink)',
              background: p.cur ? 'var(--accent)' : '#fffdf6',
              color: p.cur ? '#fff' : 'var(--ink)',
              fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>{p.n}</div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)' }}>{p.lbl}</div>
          </div>
        ))}
      </div>
      <div className="hdr-mail" style={{ marginTop: 10 }}>Branch paths unlock once you complete the core sequence.</div>
    </div>
    <div className="wf-grid cols-2">
      <div className="wf-card"><div className="eyebrow">Why this path</div><Bar /><div style={{height:4}}/><Bar t="mid"/><div style={{height:4}}/><Bar t="short"/></div>
      <div className="wf-card"><div className="eyebrow">Switch focus</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
          {['Economy','Behavior','Markets','Money basics','Decisions'].map(t=>(
            <span key={t} style={{ border:'1.5px solid var(--ink)', borderRadius:999, padding:'3px 10px', fontSize:13, fontFamily:"'Kalam',cursive" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  </>
);

// PROGRESS — 3 directions
const ProgressA = () => (
  <>
    <div className="wf-grid cols-4">
      {[
        { v: '40',  l: 'TOTAL XP',     c: 'var(--warm)' },
        { v: '1',   l: 'LEVEL',        c: 'var(--accent)' },
        { v: '7d',  l: 'STREAK',       c: 'var(--good)' },
        { v: '#42', l: 'RANK (Apr)',   c: 'var(--ink)' },
      ].map(s => (
        <div key={s.l} className="wf-card" style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 38, color: s.c, lineHeight: 1 }}>{s.v}</div>
          <div className="hdr-mail" style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12, marginTop: 4 }}>{s.l}</div>
        </div>
      ))}
    </div>
    <div className="wf-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h4>Activity · last 100 days</h4>
        <div className="hdr-mail">Mon ─ Sun</div>
      </div>
      <div className="heat" style={{ marginTop: 10 }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const lvl = [0, 0, 0, 1, 1, 2, 2, 3, 4][Math.floor(Math.random() * 9)] || 0;
          return <div key={i} className={`c l${lvl}`} />;
        })}
      </div>
    </div>
    <div className="wf-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h4>Lessons completed</h4>
        <div className="hdr-mail">3 of 33</div>
      </div>
      <div className="lesson"><div className="check done">✓</div><div className="ttl"><div style={{ fontFamily:"'Kalam',cursive",fontWeight:700,fontSize:15 }}>What is money?</div><div className="meta">Apr 18 · 40 XP</div></div></div>
      <div className="lesson"><div className="check done">✓</div><div className="ttl"><div style={{ fontFamily:"'Kalam',cursive",fontWeight:700,fontSize:15 }}>Supply &amp; demand basics</div><div className="meta">Apr 22 · 40 XP</div></div></div>
      <div className="lesson"><div className="check done">✓</div><div className="ttl"><div style={{ fontFamily:"'Kalam',cursive",fontWeight:700,fontSize:15 }}>Why prices move</div><div className="meta">Apr 28 · 40 XP</div></div></div>
    </div>
  </>
);

const ProgressB = () => (
  <>
    <div className="wf-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h3>XP gained this month</h3>
        <div className="hdr-mail">120 XP · ▲ 60% vs last</div>
      </div>
      <div className="barchart">
        {[20, 30, 12, 40, 26, 50, 42, 64, 38, 70, 55, 88, 60, 95].map((h, i) => (
          <div key={i} className="b" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="hdr-mail" style={{ marginTop: 8, textAlign: 'center' }}>weeks →</div>
    </div>
    <div className="wf-grid cols-3">
      <div className="wf-card"><div className="eyebrow">Time spent</div><div style={{ fontFamily:"'Caveat',cursive",fontSize:36,fontWeight:700 }}>4h 12m</div><div className="hdr-mail">avg 18 min / day</div></div>
      <div className="wf-card"><div className="eyebrow">Quiz accuracy</div><div style={{ fontFamily:"'Caveat',cursive",fontSize:36,fontWeight:700,color:'var(--good)' }}>87%</div><div className="hdr-mail">▲ 4 pts</div></div>
      <div className="wf-card"><div className="eyebrow">Best streak</div><div style={{ fontFamily:"'Caveat',cursive",fontSize:36,fontWeight:700,color:'var(--warm)' }}>12</div><div className="hdr-mail">current 7</div></div>
    </div>
    <div className="wf-card">
      <div className="eyebrow">Leaderboard · April</div>
      <div className="lb"><div className="rk">1</div><div>Marina Okafor</div><div>1,240 XP</div></div>
      <div className="lb"><div className="rk">2</div><div>Theo Park</div><div>1,090 XP</div></div>
      <div className="lb"><div className="rk">3</div><div>Anya Lindqvist</div><div>980 XP</div></div>
      <div className="lb me"><div className="rk" style={{ color: 'var(--accent)' }}>42</div><div><b>You</b></div><div>40 XP</div></div>
    </div>
  </>
);

const ProgressC = () => (
  <div className="wf-row" style={{ alignItems: 'flex-start' }}>
    <div className="wf-col" style={{ flex: 1.2 }}>
      <div className="wf-card">
        <h3>This week</h3>
        <div className="wf-row" style={{ marginTop: 8 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:48,fontWeight:700,color:'var(--accent)',lineHeight:1 }}>40</div>
            <div className="hdr-mail">XP this week</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:48,fontWeight:700,color:'var(--good)',lineHeight:1 }}>3</div>
            <div className="hdr-mail">lessons done</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:48,fontWeight:700,color:'var(--warm)',lineHeight:1 }}>7</div>
            <div className="hdr-mail">day streak 🔥</div>
          </div>
        </div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Activity feed</div>
        {[
          { d: 'Today',     t: 'Completed: Why prices move',   x: '+40 XP' },
          { d: 'Yesterday', t: 'Started: How a currency dies', x: '' },
          { d: 'Apr 22',    t: 'Completed: Supply & demand',   x: '+40 XP' },
          { d: 'Apr 19',    t: 'Reached Level 1',              x: '🏅' },
          { d: 'Apr 18',    t: 'Completed: What is money?',    x: '+40 XP' },
        ].map((r, i) => (
          <div key={i} className="lesson">
            <div className="check done" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)', borderColor: 'var(--ink)' }}>•</div>
            <div className="ttl">
              <div style={{ fontFamily:"'Kalam',cursive",fontWeight:700,fontSize:15 }}>{r.t}</div>
              <div className="meta">{r.d}</div>
            </div>
            <div className="meta">{r.x}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="wf-col" style={{ flex: 1 }}>
      <div className="wf-card">
        <div className="eyebrow">Level progress</div>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--ink-3)' }}><span>Level 1</span><span>Level 2</span></div>
        <div className="level-track" style={{ marginTop: 6 }}><div className="level-fill" /></div>
        <div className="hdr-mail" style={{ marginTop: 6 }}>40 / 1000 XP to Level 2</div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Friends learning now</div>
        {['Marina','Theo','Anya','Devon'].map(n => (
          <div key={n} className="lb"><div className="avatar sm" style={{ width:28,height:28,fontSize:13 }}>{n[0]}</div><div>{n}</div><div className="meta">live</div></div>
        ))}
      </div>
      <div className="wf-card">
        <div className="eyebrow">Rank</div>
        <div style={{ fontFamily:"'Caveat',cursive",fontSize:42,fontWeight:700 }}>#42</div>
        <div className="hdr-mail">of 1,284 learners in April</div>
      </div>
    </div>
  </div>
);

// ─── map tab → option set ──────────────────────────────────────────────

const OPTIONS = {
  personal: [
    { tag: 'A', title: 'Classic form, sectioned',     why: 'Predictable. Labels left, values right. Save bar at bottom.',  Body: PersonalA },
    { tag: 'B', title: 'Inline-edit profile card',     why: 'Avatar hero on the left, grid of editable fields on the right.', Body: PersonalB },
    { tag: 'C', title: 'Settings dashboard (2-col)',   why: 'Compact card grid covering security, integrations, danger.',    Body: PersonalC },
  ],
  subscription: [
    { tag: 'A', title: 'Status + history (vertical)',  why: 'List-first, matches the current screenshot vibe.',              Body: SubA },
    { tag: 'B', title: 'Hero plan card',               why: 'Price + renewal as headline, secondary cards below.',           Body: SubB },
    { tag: 'C', title: 'Plan comparison grid',         why: 'Three plans side-by-side; current is highlighted.',             Body: SubC },
  ],
  path: [
    { tag: 'A', title: 'Up-next + horizontal timeline', why: 'Closest to current screenshot. Continue card above the path.', Body: PathA },
    { tag: 'B', title: 'Lesson list + sticky continue', why: 'Vertical reading list with a persistent CTA on the right.',    Body: PathB },
    { tag: 'C', title: 'Branching map view',            why: 'Visual roadmap with optional branches; explorers love it.',    Body: PathC },
  ],
  progress: [
    { tag: 'A', title: 'Stat cards + heatmap + log',    why: 'Github-y. Big numbers, then activity grid, then lessons.',     Body: ProgressA },
    { tag: 'B', title: 'Chart hero + leaderboard',      why: 'XP-over-time chart leads, then accuracy + leaderboard.',       Body: ProgressB },
    { tag: 'C', title: 'This-week summary + feed',      why: 'Personal, social, encouraging. Activity feed instead of grid.',Body: ProgressC },
  ],
};

// ─── option frame ──────────────────────────────────────────────────────

function OptionFrame({ tab, opt, tweaks, idx }) {
  const Body = opt.Body;
  const usingSidebar = tweaks.tabStyle === 'sidebar';

  const inner = (
    <>
      <Header variant={tweaks.header} />
      {!usingSidebar && (
        <div className="tabbar">
          <TabBar style={tweaks.tabStyle} active={tab} />
        </div>
      )}
      {usingSidebar ? (
        <div className="has-sidebar" style={{ marginTop: 14 }}>
          <TabBar style="sidebar" active={tab} />
          <div className="tab-body" style={{ padding: 0 }}>
            <Body />
          </div>
        </div>
      ) : (
        <div className="tab-body">
          <Body />
        </div>
      )}
    </>
  );

  const frameCls = `frame ${tweaks.view === 'mobile' ? 'mobile' : ''} density-${tweaks.density}`;

  return (
    <section className="option" style={{ '--accent': tweaks.accent }}>
      <div className="option-head">
        <span className="tag">Option {opt.tag}</span>
        <h3>{opt.title}</h3>
        <span className="why">{opt.why}</span>
      </div>
      <div className={tweaks.view === 'mobile' ? 'mobile-shell' : ''}>
        <div className={frameCls}>
          {idx === 0 && <div className="tape" />}
          {inner}
        </div>
      </div>
    </section>
  );
}

// ─── app shell ─────────────────────────────────────────────────────────

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tabId = t.activeTab;
  const opts = OPTIONS[tabId] || OPTIONS.path;
  const dest = DEST_TABS.find(x => x.id === tabId);

  return (
    <div className="page" style={{ '--accent': t.accent }}>
      <div className="crumbs">
        <span>adamsaxiom · wireframes</span>
        <span className="dot" />
        <span>profile</span>
        <span className="dot" />
        <span>v0.1 · sketch</span>
      </div>
      <div className="title-row">
        <h1>Profile · 4 tabs · layout exploration</h1>
        <p>Low-fi sketches mapping the design space for Personal, Subscription, My Path, and Progress. Pick a tab below to see 3 directions for it. Toggle Tweaks (top-right) to test tab styles, header, density, accent and mobile.</p>
      </div>

      <div className="notes">
        <div className="note"><b>Why 4 tabs</b><span>Personal pulls identity + account out of the page chrome so Subscription, Path and Progress can each breathe.</span></div>
        <div className="note"><b>Header trade-off</b><span>Full header repeats on every tab. Slim header keeps context cheap. None makes tabs feel like a real app.</span></div>
        <div className="note"><b>Path is the star</b><span>Closest match to current screen is Option A. B and C are more ambitious — show the user.</span></div>
      </div>

      <div className="exp-tabs">
        <span className="lbl">Exploring:</span>
        {DEST_TABS.map(d => (
          <button
            key={d.id}
            className="exp-tab"
            aria-pressed={tabId === d.id}
            onClick={() => setTweak('activeTab', d.id)}
          >
            {d.label}{d.count ? <span className="ct">{d.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="options">
        {opts.map((o, i) => (
          <OptionFrame key={o.tag} tab={tabId} opt={o} tweaks={t} idx={i} />
        ))}
      </div>

      <footer>
        Sketch wireframes · pick a direction per tab, mix & match. Next: pressure-test "Path Option C" (branching map) on real lesson data, and confirm whether Personal deserves its own tab vs. a settings drawer.
      </footer>

      <TweaksPanel>
        <TweakSection label="Exploration" />
        <TweakRadio
          label="Active tab"
          value={t.activeTab}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'subscription', label: 'Sub' },
            { value: 'path', label: 'Path' },
            { value: 'progress', label: 'Prog' },
          ]}
          onChange={(v) => setTweak('activeTab', v)}
        />

        <TweakSection label="Page shell" />
        <TweakSelect
          label="Tab style"
          value={t.tabStyle}
          options={[
            { value: 'pill', label: 'Pill (like screenshot)' },
            { value: 'underline', label: 'Underline' },
            { value: 'segmented', label: 'Segmented' },
            { value: 'sidebar', label: 'Sidebar (desktop)' },
          ]}
          onChange={(v) => setTweak('tabStyle', v)}
        />
        <TweakRadio
          label="Header"
          value={t.header}
          options={['full', 'slim', 'none']}
          onChange={(v) => setTweak('header', v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'roomy']}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#1f59c2', '#c84a2c', '#3a7d44', '#7a4ec2']}
          onChange={(v) => setTweak('accent', v)}
        />

        <TweakSection label="Preview" />
        <TweakRadio
          label="View"
          value={t.view}
          options={['desktop', 'mobile']}
          onChange={(v) => setTweak('view', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
