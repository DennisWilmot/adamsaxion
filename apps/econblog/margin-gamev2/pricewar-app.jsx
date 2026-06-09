// App shell — Price War wireframes deck.
// Picks a screen tab, stacks options vertically.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "activeScreen": "decide",
  "density": "regular",
  "accent": "#1f59c2",
  "view": "desktop",
  "annotations": true
}/*EDITMODE-END*/;

const SCREENS = [
  { id: 'lobby',     label: 'Lobby',       order: '1', options: () => window.LobbyOptions,    hint: 'Multi-game dashboard. Surface the games that need attention.' },
  { id: 'briefing',  label: 'Briefing',    order: '2', options: () => window.BriefingOptions, hint: 'Opening narrative the first time the player enters a match.' },
  { id: 'results',   label: 'Results',     order: '3', options: () => window.ResultsOptions,  hint: 'Last-round report. State B of the turn screen.' },
  { id: 'decide',    label: 'Decide',      order: '4', options: () => window.DecideOptions,   hint: '6 domains, 3 action slots. The heart of the game.' },
  { id: 'submitted', label: 'Submitted',   order: '5', options: () => window.SubmittedOptions,hint: 'Locked-in confirmation; bridges to waiting state.' },
  { id: 'postmatch', label: 'Post-match',  order: '6', options: () => window.PostmatchOptions,hint: 'After round 8. Outcome, recap, what to study.' },
];

function OptionFrame({ opt, idx, view, density }) {
  const Body = opt.Body;
  const frameCls = `frame ${view === 'mobile' ? 'mobile' : ''} density-${density}`;
  return (
    <section className="option">
      <div className="option-head">
        <span className="tag">Option {opt.tag}</span>
        <h3>{opt.title}</h3>
        <span className="why">{opt.why}</span>
      </div>
      <div className={view === 'mobile' ? 'mobile-shell' : ''}>
        <div className={frameCls}>
          {idx === 0 && <div className="tape" />}
          <Body />
        </div>
      </div>
    </section>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const screen = SCREENS.find(s => s.id === t.activeScreen) || SCREENS[0];
  const opts = (screen.options && screen.options()) || [];

  return (
    <div className="page" style={{ '--accent': t.accent }}>
      <div className="crumbs">
        <span>adamsaxiom · wireframes</span>
        <span className="dot" />
        <span>the price war</span>
        <span className="dot" />
        <span>v0.1 · sketch</span>
      </div>
      <div className="title-row">
        <h1>The Price War · 6 screens · layout exploration</h1>
        <p>Low-fi sketches mapping the design space for the turn-based economics duel. Pick a screen below to see 2-3 directions for it stacked. Toggle Tweaks for density, mobile view, and accent.</p>
      </div>

      <div className="notes">
        <div className="note"><b>Decide is the screen</b><span>Spend the most polish on the 6-domain decision flow. Lobby and results sit second.</span></div>
        <div className="note"><b>Public vs. private</b><span>Every screen needs a visual rule for what your opponent can see. Tinted band? Chip type? Decide early.</span></div>
        <div className="note"><b>3 slots, not 3 forms</b><span>Treat the action slots like drafting a hand. Drag-in, swap, reset. Not a settings page.</span></div>
      </div>

      <div className="exp-tabs">
        <span className="lbl">Exploring:</span>
        {SCREENS.map(s => (
          <button
            key={s.id}
            className="exp-tab"
            aria-pressed={t.activeScreen === s.id}
            onClick={() => setTweak('activeScreen', s.id)}
          >
            <span style={{ opacity: .55 }}>{s.order}</span>&nbsp;{s.label}
          </button>
        ))}
      </div>
      <div className="step-hint" style={{ marginTop: 6 }}>{screen.hint}</div>

      <div className="options">
        {opts.length === 0 ? (
          <div className="wf-card"><div className="step-hint">No options registered for this screen.</div></div>
        ) : opts.map((o, i) => (
          <OptionFrame key={o.tag} opt={o} idx={i} view={t.view} density={t.density} />
        ))}
      </div>

      <footer>
        Sketch wireframes · pick a direction per screen, mix and match. Next: pressure-test the Decide flow on a real action catalog, prototype the simultaneous-resolution reveal animation, and confirm whether Briefing should be one screen or a 2-step coach mark.
      </footer>

      <TweaksPanel>
        <TweakSection label="Exploration" />
        <TweakSelect
          label="Screen"
          value={t.activeScreen}
          options={SCREENS.map(s => ({ value: s.id, label: `${s.order} · ${s.label}` }))}
          onChange={(v) => setTweak('activeScreen', v)}
        />

        <TweakSection label="Preview" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'roomy']}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakRadio
          label="View"
          value={t.view}
          options={['desktop', 'mobile']}
          onChange={(v) => setTweak('view', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#1f59c2', '#c84a2c', '#3a7d44', '#7a4ec2']}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
