// Price War v2 app shell — locks the 6 picked directions + new Action Library tab.

const TWEAK_DEFAULTS_V2 = /*EDITMODE-BEGIN*/{
  "activeScreen": "decide",
  "density": "regular",
  "accent": "#1f59c2",
  "view": "desktop"
}/*EDITMODE-END*/;

const SCREENS_V2 = [
  { id: 'lobby',     order: '1', label: 'Lobby',        pick: 'B', body: () => <LobbyV2 />,      title: 'Kanban by status · scenario label · results-ready elevated',
    why: 'Picked direction B, refined: scenario label on every card; results-ready column now sits left with urgent red treatment so it visually outranks waiting.' },
  { id: 'briefing',  order: '2', label: 'Briefing',     pick: 'A', body: () => <BriefingV2 />,   title: 'Narrative briefing · opponent identity hero',
    why: 'Picked direction A, refined: opponent moved to a hero card so the match feels personal; "price = a Sales action" phrasing instead of treating price as special.' },
  { id: 'results',   order: '3', label: 'Results',      pick: 'A', body: () => <ResultsV2 />,    title: 'P&L report · event-pill tooltips',
    why: 'Picked direction A, refined: hover-tooltips on every event/market pill explain the mechanic (not just the word). One tooltip is shown open to demonstrate.' },
  { id: 'library',   order: 'L', label: 'Action Library', pick: 'NEW', body: () => <Library />,  title: 'The rendering spec · quiet by default, details on hover',
    why: 'New tab. Defines 10 input types, what stays visible on the card (only meaningful chips), what hides behind hover (mechanic, forecast, risk), the full catalog mapped to inputs, and the ActionDefinition TS shape.' },
  { id: 'decide',    order: '4', label: 'Decide',       pick: 'B', body: () => <DecideV2 />,     title: 'Pick 3 moves · master / detail · details on hover',
    why: 'Picked direction B, rebuilt twice: cards now show name + 1-line effect + only-meaningful chips, expanded "details" (mechanic, costs, strong-when / risky-when) live behind hover. Slimmer state strip (4 essentials + "more state"). Punchier action names — "moves, not settings." Plan sidebar stays minimal.' },
  { id: 'submitted', order: '5', label: 'Submitted',    pick: 'A', body: () => <SubmittedV2 />,  title: 'Active watch tower · definite vs conditional',
    why: 'Picked direction A, refined: copy fixed ("price applies when round resolves"); plan split into "Will definitely apply" and "Conditional · depends on Marina" so price-match etc. read correctly.' },
  { id: 'postmatch', order: '6', label: 'Post-match',   pick: 'C', body: () => <PostmatchV2 />,  title: 'Trophy hero + turning point + concept rail',
    why: 'Picked direction C, refined: Turning Point added as a top-level explainer card; price chart highlights the pivot round.' },
];

function OptionFrame({ screen, view, density }) {
  const Body = screen.body;
  const frameCls = `frame ${view === 'mobile' ? 'mobile' : ''} density-${density}`;
  return (
    <section className="option">
      <div className="option-head">
        <span className={`tag ${screen.pick === 'NEW' ? 'v2' : ''}`}>
          {screen.pick === 'NEW' ? 'New' : `Option ${screen.pick} · refined`}
        </span>
        <h3>{screen.title}</h3>
        <span className="why">{screen.why}</span>
      </div>
      <div className={view === 'mobile' ? 'mobile-shell' : ''}>
        <div className={frameCls}>
          <div className="tape" />
          <Body />
        </div>
      </div>
    </section>
  );
}

function AppV2() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_V2);
  const screen = SCREENS_V2.find(s => s.id === t.activeScreen) || SCREENS_V2[0];

  return (
    <div className="page" style={{ '--accent': t.accent }}>
      <div className="crumbs">
        <span>adamsaxiom · wireframes</span>
        <span className="dot" />
        <span>the price war</span>
        <span className="dot" />
        <span>v0.2 · picked directions + action library</span>
      </div>
      <div className="title-row">
        <h1>The Price War · v2 · pick 3 moves</h1>
        <p>Your 6 picks (1-B, 2-A, 3-A, 4-B, 5-A, 6-C) refined twice: the cards now read as "pick 3 moves," with mechanic, forecasts and risks pushed behind a hover tooltip. The <b>Action Library</b> tab documents the system underneath.</p>
      </div>

      <div className="notes">
        <div className="note"><b>Moves, not settings</b><span>Action names are verbs: "Stock up", "Raise wages", "Advertise locally". The card surface should feel strategic, not administrative.</span></div>
        <div className="note"><b>Quiet by default</b><span>Only show a chip when it actually matters now. Zero-cost actions don't get a cost chip. Persistent + private are defaults — they stay silent.</span></div>
        <div className="note"><b>Details live in the hover</b><span>Mechanic, forecast, and risk all live in the expanded tooltip. The Decide tab shows one card with the tooltip open so you can compare resting vs. hover.</span></div>
      </div>

      <div className="exp-tabs">
        <span className="lbl">Exploring:</span>
        {SCREENS_V2.map(s => (
          <button
            key={s.id}
            className="exp-tab"
            aria-pressed={t.activeScreen === s.id}
            onClick={() => setTweak('activeScreen', s.id)}
          >
            <span style={{ opacity: .55 }}>{s.order}</span>&nbsp;{s.label}
            {s.pick === 'NEW' && <span className="ct">new</span>}
          </button>
        ))}
      </div>
      <div className="step-hint" style={{ marginTop: 6 }}>{screen.why}</div>

      <div className="options">
        <OptionFrame screen={screen} view={t.view} density={t.density} />
      </div>

      <footer>
        Open questions: do conditional actions (price-match, insurance) need their own UI category, or do they live happily as toggles with a "trigger" badge? Should scout intel surface as a layer on the opponent rail, or as its own private inbox? Also: when does Briefing collapse into a 2-step coach mark for veterans?
      </footer>

      <TweaksPanel>
        <TweakSection label="Exploration" />
        <TweakSelect
          label="Screen"
          value={t.activeScreen}
          options={SCREENS_V2.map(s => ({ value: s.id, label: `${s.order} · ${s.label}${s.pick === 'NEW' ? ' (new)' : ''}` }))}
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

ReactDOM.createRoot(document.getElementById('app')).render(<AppV2 />);
